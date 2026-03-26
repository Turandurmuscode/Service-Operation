import { act, renderHook } from '@testing-library/react';
import { AuditProvider, useAudit } from './AuditContext';

describe('AuditContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('adds an audit entry and persists it', () => {
    const { result } = renderHook(() => useAudit(), { wrapper: AuditProvider });

    act(() => {
      result.current.addAuditEntry(
        { id: 7, name: 'Test User', role: 'manager' },
        'UPDATE',
        'incident',
        101,
        'Ariza guncellendi'
      );
    });

    expect(result.current.auditLog).toHaveLength(1);
    expect(result.current.auditLog[0]).toMatchObject({
      userId: 7,
      userName: 'Test User',
      userRole: 'manager',
      action: 'UPDATE',
      entity: 'incident',
      entityId: 101,
    });

    const stored = JSON.parse(localStorage.getItem('audit_log'));
    expect(stored).toHaveLength(1);
    expect(stored[0].detail).toBe('Ariza guncellendi');
  });

  test('clearAuditLog clears state and storage', () => {
    localStorage.setItem('audit_log', JSON.stringify([{ id: 1, detail: 'x' }]));

    const { result } = renderHook(() => useAudit(), { wrapper: AuditProvider });
    expect(result.current.auditLog).toHaveLength(1);

    act(() => {
      result.current.clearAuditLog();
    });

    expect(result.current.auditLog).toEqual([]);
    expect(localStorage.getItem('audit_log')).toBeNull();
  });

  test('exportAuditLog creates downloadable csv link', () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    URL.createObjectURL = jest.fn(() => 'blob:test-url');
    URL.revokeObjectURL = jest.fn();

    const clickMock = jest.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return {
          click: clickMock,
          set href(value) {
            this._href = value;
          },
          get href() {
            return this._href;
          },
          set download(value) {
            this._download = value;
          },
          get download() {
            return this._download;
          },
        };
      }
      return originalCreateElement(tagName);
    });

    const { result } = renderHook(() => useAudit(), { wrapper: AuditProvider });

    act(() => {
      result.current.exportAuditLog([
        {
          timestamp: '2026-03-25T10:00:00.000Z',
          userName: 'Admin User',
          userRole: 'admin',
          action: 'CREATE',
          entity: 'client',
          entityId: 5,
          detail: 'Musteri eklendi',
        },
      ]);
    });

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');

    createElementSpy.mockRestore();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });
});
