import React, { useState, useMemo } from 'react';
import { useAudit } from '../context/AuditContext';
import { useI18n } from '../context/i18nContext';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const ACTION_COLORS = {
  CREATE: 'var(--success)',
  UPDATE: 'var(--warning)',
  DELETE: 'var(--danger)',
  LOGIN:  'var(--accent)',
  LOGOUT: 'var(--text-muted)',
  EXPORT: 'var(--purple)',
};

const ACTION_LABELS = {
  CREATE: 'Oluşturuldu',
  UPDATE: 'Güncellendi',
  DELETE: 'Silindi',
  LOGIN:  'Giriş',
  LOGOUT: 'Çıkış',
  EXPORT: 'Dışa Aktarıldı',
};

function AuditLogViewer() {
  const { auditLog, clearAuditLog, exportAuditLog } = useAudit();
  const { t } = useI18n();
  const { hasPermission } = useAuth();

  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterUser,   setFilterUser]   = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const uniqueUsers   = useMemo(() => [...new Set(auditLog.map(e => e.userName))], [auditLog]);
  const uniqueEntities = useMemo(() => [...new Set(auditLog.map(e => e.entity))], [auditLog]);

  const filtered = useMemo(() => {
    return auditLog.filter(e => {
      if (filterAction !== 'all' && e.action !== filterAction) return false;
      if (filterEntity !== 'all' && e.entity !== filterEntity) return false;
      if (filterUser   !== 'all' && e.userName !== filterUser)  return false;
      if (search && !e.detail.toLowerCase().includes(search.toLowerCase()) &&
          !e.userName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [auditLog, filterAction, filterEntity, filterUser, search]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const formatTime = (iso) => {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}><Icon name="clipboard" size={16} style={{ marginRight: 8 }} />{t('audit.title')}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => exportAuditLog(filtered)}>
            <Icon name="download" size={14} /> {t('audit.export')}
          </button>
          {hasPermission('canManageUsers') && (
            <button className="btn btn-danger" onClick={() => {
              if (window.confirm('Denetim logu temizlensin mi?')) clearAuditLog();
            }}>
              <Icon name="trash" size={14} /> {t('audit.clear')}
            </button>
          )}
        </div>
      </div>

      {/* Filtreler */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <input
          className="search-input"
          style={{ flex: 1, minWidth: 180 }}
          placeholder="Ara..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="filter-select" value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}>
          <option value="all">Tüm İşlemler</option>
          {Object.keys(ACTION_LABELS).map(a => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
        </select>
        <select className="filter-select" value={filterEntity} onChange={e => { setFilterEntity(e.target.value); setPage(1); }}>
          <option value="all">Tüm Varlıklar</option>
          {uniqueEntities.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select className="filter-select" value={filterUser} onChange={e => { setFilterUser(e.target.value); setPage(1); }}>
          <option value="all">Tüm Kullanıcılar</option>
          {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Stat bar */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
        {filtered.length} kayıt gösteriliyor (toplam {auditLog.length})
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Icon name="clipboard" size={36} />
          <p>{t('audit.noData')}</p>
        </div>
      ) : (
        <>
          <div className="table-container" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>{t('audit.time')}</th>
                  <th>{t('audit.user')}</th>
                  <th>{t('audit.action')}</th>
                  <th>Varlık</th>
                  <th>{t('audit.detail')}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(entry => (
                  <tr key={entry.id}>
                    <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {formatTime(entry.timestamp)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{entry.userName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{entry.userRole}</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs)',
                        background: `${ACTION_COLORS[entry.action]}18`,
                        color: ACTION_COLORS[entry.action],
                        fontSize: 11,
                        fontWeight: 700,
                      }}>
                        {ACTION_LABELS[entry.action] || entry.action}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{entry.entity}</td>
                    <td style={{ fontSize: 12, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
              <span style={{ padding: '6px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                {page} / {totalPages}
              </span>
              <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AuditLogViewer;
