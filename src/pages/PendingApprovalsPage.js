import React, { useMemo, useState } from 'react';
import './PendingApprovalsPage.css';

const STORAGE_KEY = 'sod_pending_approvals';

function readApprovals() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function formatMoney(value) {
  return `${(Number(value) || 0).toLocaleString('tr-TR')} TL`;
}

export default function PendingApprovalsPage({ currentUser, showToast }) {
  const [items, setItems] = useState(readApprovals);
  const [form, setForm] = useState({
    type: 'price',
    title: '',
    requestedBy: currentUser?.name || '',
    amount: '',
    note: '',
  });

  const persist = (next) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addItem = () => {
    if (!form.title || !form.requestedBy) {
      showToast?.('Baslik ve talep eden zorunlu', 'warning');
      return;
    }

    const now = new Date().toISOString();
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...form,
      amount: Number(form.amount) || 0,
      status: 'pending',
      createdAt: now,
      decidedAt: '',
      decidedBy: '',
    };

    persist([item, ...items]);
    setForm({
      type: 'price',
      title: '',
      requestedBy: currentUser?.name || '',
      amount: '',
      note: '',
    });
    showToast?.('Onay talebi eklendi', 'success');
  };

  const decide = (id, status) => {
    const next = items.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            decidedAt: new Date().toISOString(),
            decidedBy: currentUser?.name || 'Yonetici',
          }
        : item
    );
    persist(next);
  };

  const removeItem = (id) => {
    persist(items.filter((item) => item.id !== id));
  };

  const pendingItems = items.filter((item) => item.status === 'pending');
  const stats = useMemo(() => {
    const pendingTotal = pendingItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    return {
      pendingCount: pendingItems.length,
      pendingTotal,
      approvedCount: items.filter((item) => item.status === 'approved').length,
      rejectedCount: items.filter((item) => item.status === 'rejected').length,
    };
  }, [items, pendingItems]);

  return (
    <div className="page-content approvals-page">
      <div className="page-header">
        <div>
          <h1>Bekleyen Onaylar Kutusu</h1>
          <p>Fiyat, indirim ve iade onaylarini tek merkezde hizlandirin</p>
        </div>
      </div>

      <div className="approvals-kpis">
        <div className="card"><span>Bekleyen</span><strong>{stats.pendingCount}</strong></div>
        <div className="card"><span>Bekleyen Tutar</span><strong>{formatMoney(stats.pendingTotal)}</strong></div>
        <div className="card"><span>Onaylanan</span><strong>{stats.approvedCount}</strong></div>
        <div className="card"><span>Reddedilen</span><strong>{stats.rejectedCount}</strong></div>
      </div>

      <div className="card approvals-form">
        <h3>Yeni Onay Talebi</h3>
        <div className="approvals-grid">
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option value="price">Fiyat Onayi</option>
            <option value="discount">Indirim Onayi</option>
            <option value="refund">Iade Onayi</option>
          </select>
          <input placeholder="Talep basligi" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <input placeholder="Talep eden" value={form.requestedBy} onChange={(event) => setForm({ ...form, requestedBy: event.target.value })} />
          <input type="number" min="0" placeholder="Tutar" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
        </div>
        <textarea rows={2} placeholder="Not" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        <button className="btn btn-primary" onClick={addItem}>Onaya Gonder</button>
      </div>

      <div className="approvals-lists">
        <div className="card">
          <h3>Bekleyen Talepler</h3>
          {pendingItems.length === 0 && <p className="approvals-empty">Bekleyen talep yok</p>}
          <div className="approvals-items">
            {pendingItems.map((item) => (
              <div key={item.id} className="approvals-item">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.type} · {item.requestedBy}</p>
                  <p>{formatMoney(item.amount)} · {new Date(item.createdAt).toLocaleDateString('tr-TR')}</p>
                  {item.note && <p>{item.note}</p>}
                </div>
                <div className="approvals-actions">
                  <button className="btn btn-sm" onClick={() => decide(item.id, 'approved')}>Onayla</button>
                  <button className="btn btn-sm" onClick={() => decide(item.id, 'rejected')}>Reddet</button>
                  <button className="btn btn-sm" onClick={() => removeItem(item.id)}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Son Kararlar</h3>
          <div className="approvals-items">
            {items
              .filter((item) => item.status !== 'pending')
              .slice(0, 12)
              .map((item) => (
                <div key={item.id} className={`approvals-item is-${item.status}`}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.status === 'approved' ? 'Onaylandi' : 'Reddedildi'} · {item.decidedBy || '-'}</p>
                    <p>{item.decidedAt ? new Date(item.decidedAt).toLocaleDateString('tr-TR') : '-'}</p>
                  </div>
                </div>
              ))}
            {items.filter((item) => item.status !== 'pending').length === 0 && (
              <p className="approvals-empty">Henuz karar verilmis kayit yok</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
