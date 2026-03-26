import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

describe('AuthContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('auto logs in with admin user when no session exists', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.currentUser).toBeTruthy();
    expect(result.current.currentUser.role).toBe('admin');
    expect(result.current.canAccessPage('settings')).toBe(true);
    expect(result.current.hasPermission('canManageUsers')).toBe(true);
  });

  test('logs in manager and applies manager permissions', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      const res = result.current.login('yonetici', 'yonetici123');
      expect(res.success).toBe(true);
      expect(res.user.role).toBe('manager');
    });

    expect(result.current.currentUser.role).toBe('manager');
    expect(result.current.canAccessPage('settings')).toBe(false);
    expect(result.current.canAccessPage('reports')).toBe(true);
    expect(result.current.hasPermission('canDelete')).toBe(false);
    expect(result.current.hasPermission('canExport')).toBe(true);
    expect(result.current.canAccessFeature('finance.viewCosts')).toBe(true);
    expect(result.current.canAccessFeature('users.manage')).toBe(false);
  });

  test('rejects invalid login credentials', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    let response;
    act(() => {
      response = result.current.login('wrong', 'wrong');
    });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/hatalı/i);
  });

  test('logout clears current user and blocks permissions', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.logout();
    });

    expect(result.current.currentUser).toBeNull();
    expect(result.current.canAccessPage('dashboard')).toBe(false);
    expect(result.current.hasPermission('canEdit')).toBe(false);
  });
});
