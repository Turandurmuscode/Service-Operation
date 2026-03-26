import React, { createContext, useContext, useState, useCallback } from 'react';
import { hasFeatureAccess } from '../services/policy/policy';

// ── Demo kullanıcılar ─────────────────────────────────────────────
export const DEMO_USERS = [
  {
    id: 1,
    name: 'Admin User',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    avatar: 'AU',
  },
  {
    id: 2,
    name: 'Yönetici User',
    username: 'yonetici',
    password: 'yonetici123',
    role: 'manager',
    avatar: 'YU',
  },
  {
    id: 3,
    name: 'Teknisyen User',
    username: 'teknisyen',
    password: 'tech123',
    role: 'technician',
    avatar: 'TU',
  },
];

// ── Rol izinleri ─────────────────────────────────────────────────
export const ROLE_PERMISSIONS = {
  admin: {
    label: 'Admin',
    pages: ['dashboard', 'incidents', 'clients', 'kanban', 'analytics', 'calendar', 'reports', 'settings', 'assets', 'timesheet', 'messaging', 'checklists', 'costtracking', 'announcements', 'contactlog', 'activityfeed', 'workflowrules', 'spareparts', 'contracts', 'knowledgebase', 'scheduledmaintenance', 'remoteaccess', 'documents', 'projects', 'quotations', 'modules', 'kumescalculator', 'crmdeals', 'workorders', 'invoices', 'rbac', 'fieldteam', 'integrations'],
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    canManageUsers: true,
  },
  manager: {
    label: 'Yönetici',
    pages: ['dashboard', 'incidents', 'clients', 'kanban', 'analytics', 'calendar', 'reports', 'assets', 'timesheet', 'messaging', 'checklists', 'costtracking', 'announcements', 'contactlog', 'activityfeed', 'workflowrules', 'spareparts', 'contracts', 'knowledgebase', 'scheduledmaintenance', 'remoteaccess', 'documents', 'projects', 'quotations', 'kumescalculator', 'crmdeals', 'workorders', 'invoices', 'fieldteam'],
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExport: true,
    canManageUsers: false,
  },
  technician: {
    label: 'Teknisyen',
    pages: ['dashboard', 'incidents', 'calendar', 'timesheet', 'messaging', 'checklists', 'announcements', 'activityfeed', 'spareparts', 'knowledgebase', 'documents', 'projects', 'fieldteam'],
    canCreate: false,
    canEdit: true,   // sadece durum güncelleyebilir
    canDelete: false,
    canExport: false,
    canManageUsers: false,
  },
};

const AuthContext = createContext(null);

const SESSION_KEY = 'auth_user';

// Otomatik admin girişi – her zaman admin olarak başla
const AUTO_LOGIN_USER = {
  id: DEMO_USERS[0].id,
  name: DEMO_USERS[0].name,
  username: DEMO_USERS[0].username,
  role: DEMO_USERS[0].role,
  avatar: DEMO_USERS[0].avatar,
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    // Kayıtlı oturum yoksa otomatik admin girişi
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(AUTO_LOGIN_USER));
    return AUTO_LOGIN_USER;
  });

  const login = useCallback((username, password) => {
    const user = DEMO_USERS.find(
      u => u.username === username.trim().toLowerCase() && u.password === password
    );
    if (!user) return { success: false, error: 'Kullanıcı adı veya şifre hatalı.' };

    const session = { id: user.id, name: user.name, username: user.username, role: user.role, avatar: user.avatar };
    setCurrentUser(session);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const hasPermission = useCallback((action) => {
    if (!currentUser) return false;
    const perms = ROLE_PERMISSIONS[currentUser.role];
    return perms ? !!perms[action] : false;
  }, [currentUser]);

  const canAccessPage = useCallback((page) => {
    if (!currentUser) return false;
    const perms = ROLE_PERMISSIONS[currentUser.role];
    return perms ? perms.pages.includes(page) : false;
  }, [currentUser]);

  const canAccessFeature = useCallback((featureKey) => {
    if (!currentUser) return false;
    return hasFeatureAccess(currentUser.role, featureKey);
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasPermission, canAccessPage, canAccessFeature }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
