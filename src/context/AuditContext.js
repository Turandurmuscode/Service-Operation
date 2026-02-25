import React, { createContext, useContext, useState, useCallback } from 'react';

const AuditContext = createContext(null);

const STORAGE_KEY = 'audit_log';
const MAX_ENTRIES = 500;

const loadLog = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};

export function AuditProvider({ children }) {
  const [auditLog, setAuditLog] = useState(loadLog);

  const addAuditEntry = useCallback((user, action, entity, entityId, detail, extra = {}) => {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      userId: user?.id ?? 0,
      userName: user?.name ?? 'Sistem',
      userRole: user?.role ?? 'system',
      action,      // 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT'
      entity,      // 'incident' | 'client' | 'technician' | 'setting' | 'auth'
      entityId,
      detail,
      ...extra,
    };

    setAuditLog(prev => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAuditLog = useCallback(() => {
    setAuditLog([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportAuditLog = useCallback((log) => {
    const rows = [
      ['Zaman', 'Kullanıcı', 'Rol', 'İşlem', 'Varlık', 'ID', 'Detay'],
      ...log.map(e => [
        new Date(e.timestamp).toLocaleString('tr-TR'),
        e.userName,
        e.userRole,
        e.action,
        e.entity,
        e.entityId ?? '',
        e.detail,
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <AuditContext.Provider value={{ auditLog, addAuditEntry, clearAuditLog, exportAuditLog }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
}
