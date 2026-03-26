import React, { useMemo, useState } from 'react';
import './CRMDealsPage.css';

const STORAGE_KEY = 'sod_crm_deals';
const QUOTATIONS_STORAGE_KEY = 'sod_quotations';
const REMINDER_STORAGE_KEY = 'sod_crm_followup_reminders';

const STAGES = [
  { id: 'lead', label: 'Potansiyel' },
  { id: 'qualified', label: 'Nitelikli' },
  { id: 'proposal', label: 'Teklif' },
  { id: 'negotiation', label: 'Müzakere' },
  { id: 'won', label: 'Kazanıldı' },
  { id: 'lost', label: 'Kaybedildi' },
];

const STAGE_PROBABILITY = {
  lead: 0.1,
  qualified: 0.35,
  proposal: 0.6,
  negotiation: 0.8,
  won: 1,
  lost: 0,
};

function formatMoney(value) {
  return `${(value || 0).toLocaleString('tr-TR')} TL`;
}

function readJsonArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function readDeals() {
  return readJsonArray(STORAGE_KEY);
}

export default function CRMDealsPage({ clients = [], currentUser, showToast, onNavigate }) {
  const [deals, setDeals] = useState(readDeals);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoHtml, setInfoHtml] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [form, setForm] = useState({
    title: '',
    clientId: '',
    value: '',
    owner: currentUser?.name || '',
    nextAction: '',
    followUpDate: '',
    notes: '',
    stage: 'lead',
  });

  const persist = (next) => {
    setDeals(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addDeal = () => {
    if (!form.title || !form.clientId || !form.value) {
      showToast?.('Başlık, müşteri ve tutar alanları zorunlu', 'warning');
      return;
    }

    const newDeal = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: form.title,
      clientId: Number(form.clientId),
      value: Number(form.value),
      owner: form.owner || currentUser?.name || 'Atanmadı',
      nextAction: form.nextAction,
      followUpDate: form.followUpDate || '',
      notes: form.notes,
      stage: form.stage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    persist([newDeal, ...deals]);
    setForm({
      title: '',
      clientId: '',
      value: '',
      owner: currentUser?.name || '',
      nextAction: '',
      followUpDate: '',
      notes: '',
      stage: 'lead',
    });
    showToast?.('CRM fırsatı eklendi', 'success');
  };

  const updateStage = (id, stage) => {
    const updated = deals.map((d) =>
      d.id === id ? { ...d, stage, updatedAt: new Date().toISOString() } : d
    );
    persist(updated);
  };

  const removeDeal = (id) => {
    persist(deals.filter((d) => d.id !== id));
    showToast?.('Firsat kaydi silindi', 'warning');
  };

  const convertToQuotation = (deal) => {
    if (deal.quoteId) {
      showToast?.(`Bu fırsat zaten teklife dönüştürüldü: ${deal.quoteId}`, 'info');
      return;
    }

    const quotations = readJsonArray(QUOTATIONS_STORAGE_KEY);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const validUntil = new Date(now.getTime() + 15 * 86400000).toISOString().split('T')[0];
    const year = now.getFullYear();

    const newQuote = {
      id: `TKL-${year}-${String(quotations.length + 1).padStart(4, '0')}`,
      client: clientMap.get(Number(deal.clientId))?.name || 'Bilinmeyen Müşteri',
      clientContact: deal.owner,
      source: 'crm',
      sourceDealId: deal.id,
      status: 'draft',
      version: 1,
      createdAt: today,
      validUntil,
      notes: `CRM fırsatı: ${deal.title}${deal.notes ? `\n${deal.notes}` : ''}`,
      taxRate: 20,
      discount: 0,
      items: [
        {
          name: deal.title,
          qty: 1,
          unit: 'adet',
          unitPrice: Number(deal.value) || 0,
          category: 'hizmet',
        },
      ],
      history: [
        {
          date: today,
          action: `CRM'den oluşturuldu (${deal.id})`,
          user: currentUser?.name || 'Sistem',
        },
      ],
    };

    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify([newQuote, ...quotations]));

    const updatedDeals = deals.map((d) =>
      d.id === deal.id
        ? {
            ...d,
            quoteId: newQuote.id,
            updatedAt: new Date().toISOString(),
          }
        : d
    );
    persist(updatedDeals);

    showToast?.(`Teklif oluşturuldu: ${newQuote.id}`, 'success');
  };

  const openQuotation = (quoteId) => {
    if (!quoteId) return;
    onNavigate?.('quotations');
    showToast?.(`Teklif açıldı: ${quoteId}`, 'info');
  };

  const remindFollowUp = (deal) => {
    const reminders = readJsonArray(REMINDER_STORAGE_KEY);
    const reminder = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      dealId: deal.id,
      title: deal.title,
      owner: deal.owner,
      followUpDate: deal.followUpDate,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify([reminder, ...reminders]));
    showToast?.(`Takip hatırlatması eklendi: ${deal.title}`, 'info');
  };

  const openInfo = async () => {
    setShowInfoModal(true);
    if (infoHtml || infoLoading) return;

    try {
      setInfoLoading(true);
      setInfoError('');
      const response = await fetch('/crm-bilgi.html', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Bilgi dokümanı yüklenemedi');
      }
      const html = await response.text();
      setInfoHtml(html);
    } catch {
      setInfoError('CRM bilgi içeriği şu an yüklenemiyor. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setInfoLoading(false);
    }
  };

  const stageTotals = useMemo(() => {
    return STAGES.reduce((acc, stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage.id);
      acc[stage.id] = {
        count: stageDeals.length,
        total: stageDeals.reduce((s, d) => s + (d.value || 0), 0),
      };
      return acc;
    }, {});
  }, [deals]);

  const clientMap = useMemo(() => {
    const map = new Map();
    clients.forEach((c) => map.set(Number(c.id), c));
    return map;
  }, [clients]);

  const kpis = useMemo(() => {
    const activeDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
    const closedDeals = deals.filter((d) => d.stage === 'won' || d.stage === 'lost');
    const wonDeals = deals.filter((d) => d.stage === 'won');
    const today = new Date().toISOString().split('T')[0];

    const totalPipeline = activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const weightedPipeline = activeDeals.reduce(
      (sum, deal) => sum + (deal.value || 0) * (STAGE_PROBABILITY[deal.stage] || 0),
      0
    );
    const winRate = closedDeals.length === 0 ? 0 : (wonDeals.length / closedDeals.length) * 100;
    const overdueFollowUps = activeDeals.filter(
      (deal) => deal.followUpDate && deal.followUpDate < today
    ).length;

    return {
      totalPipeline,
      weightedPipeline,
      winRate,
      overdueFollowUps,
    };
  }, [deals]);

  return (
    <div className="crm-page page-content">
      <div className="page-header">
        <div>
          <h1>CRM Fırsat Takibi</h1>
          <p>Potansiyelden kazanım/kayba kadar fırsat hattı yönetimi</p>
        </div>
        <button className="btn btn-secondary crm-info-btn" onClick={openInfo}>
          CRM Bilgi
        </button>
      </div>

      <div className="crm-kpi-grid">
        <div className="crm-kpi-card">
          <span className="crm-kpi-label">Toplam Fırsat Tutarı</span>
          <strong>{formatMoney(kpis.totalPipeline)}</strong>
        </div>
        <div className="crm-kpi-card">
          <span className="crm-kpi-label">Ağırlıklı Fırsat Hattı</span>
          <strong>{formatMoney(Math.round(kpis.weightedPipeline))}</strong>
        </div>
        <div className="crm-kpi-card">
          <span className="crm-kpi-label">Kazanma Oranı</span>
          <strong>%{kpis.winRate.toFixed(1)}</strong>
        </div>
        <div className="crm-kpi-card">
          <span className="crm-kpi-label">Geciken Takip</span>
          <strong>{kpis.overdueFollowUps}</strong>
        </div>
      </div>

      <div className="crm-form card">
        <h3>Yeni Fırsat</h3>
        <div className="crm-form-grid">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Fırsat başlığı"
          />
          <select
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          >
            <option value="">Müşteri seç</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="Fırsat tutarı"
          />
          <select
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value })}
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <input
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
            placeholder="Sorumlu"
          />
          <input
            value={form.nextAction}
            onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
            placeholder="Sonraki aksiyon"
          />
          <input
            type="date"
            value={form.followUpDate}
            onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
          />
        </div>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Notlar"
          rows={2}
        />
        <button className="btn btn-primary" onClick={addDeal}>Firsat Ekle</button>
      </div>

      <div className="crm-pipeline">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          return (
            <div key={stage.id} className="crm-column card">
              <div className="crm-column-header">
                <strong>{stage.label}</strong>
                <span>{stageTotals[stage.id]?.count || 0} kayit</span>
              </div>
              <div className="crm-column-total">
                Toplam: {formatMoney(stageTotals[stage.id]?.total || 0)}
              </div>

              <div className="crm-deals">
                {stageDeals.map((deal) => (
                  <div key={deal.id} className="crm-deal">
                    <div className="crm-deal-title">{deal.title}</div>
                    <div className="crm-deal-meta">
                      <span>{clientMap.get(Number(deal.clientId))?.name || 'Musteri yok'}</span>
                      <span>{formatMoney(deal.value || 0)}</span>
                    </div>
                    <div className="crm-deal-meta">
                      <span>Sorumlu: {deal.owner}</span>
                      <span>{new Date(deal.updatedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    {deal.nextAction && <div className="crm-next">Aksiyon: {deal.nextAction}</div>}
                    {deal.followUpDate && (
                      <div className={`crm-followup ${deal.followUpDate < new Date().toISOString().split('T')[0] ? 'is-overdue' : ''}`}>
                        Takip: {new Date(deal.followUpDate).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                    <div className="crm-actions">
                      <select
                        value={deal.stage}
                        onChange={(e) => updateStage(deal.id, e.target.value)}
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                      {deal.stage !== 'won' && deal.stage !== 'lost' && (
                                      <button className="btn btn-sm" onClick={() => convertToQuotation(deal)}>
                                        Teklife Dönüştür
                        </button>
                      )}
                      {deal.quoteId && (
                        <button className="btn btn-sm" onClick={() => openQuotation(deal.quoteId)}>
                                        Teklifi Aç
                        </button>
                      )}
                      {deal.followUpDate && (
                        <button className="btn btn-sm" onClick={() => remindFollowUp(deal)}>
                                        Hatırlat
                        </button>
                      )}
                      <button className="btn btn-sm" onClick={() => removeDeal(deal.id)}>Sil</button>
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && <div className="crm-empty">Kayit yok</div>}
              </div>
            </div>
          );
        })}
      </div>

      {showInfoModal && (
        <div className="crm-info-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="crm-info-modal card" onClick={(e) => e.stopPropagation()}>
            <div className="crm-info-header">
              <h3>CRM Nedir, Ne Değildir?</h3>
              <button className="btn btn-sm" onClick={() => setShowInfoModal(false)}>Kapat</button>
            </div>
            {infoLoading && <p className="crm-info-state">Bilgi dokümanı yükleniyor...</p>}
            {infoError && <p className="crm-info-state crm-info-error">{infoError}</p>}
            {!infoLoading && !infoError && (
              <div className="crm-info-content" dangerouslySetInnerHTML={{ __html: infoHtml }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
