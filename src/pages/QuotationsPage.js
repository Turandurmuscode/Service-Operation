import React, { useState, useEffect, useCallback, useRef } from 'react';
import './QuotationsPage.css';

/* ════════════════════════════════════════════════════════════
   SVG ICONS
   ════════════════════════════════════════════════════════════ */
const Icons = {
  plus: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  file: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1.5h6.5L13 5v9.5H3V1.5Z" strokeLinejoin="round"/><path d="M9.5 1.5v3.5H13" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  fileText: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1.5h6.5L13 5v9.5H3V1.5Z" strokeLinejoin="round"/><path d="M9.5 1.5v3.5H13" strokeLinecap="round"/><path d="M5.5 8h5M5.5 10.5h5M5.5 13h3" strokeLinecap="round"/></svg>,
  send: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2L7 9M14 2l-4 12-3-5-5-3 12-4Z"/></svg>,
  check: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-6"/></svg>,
  x: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  edit: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3.5l3.5 3.5M3 10.5V14h3.5L14 6.5 10.5 3 3 10.5Z"/></svg>,
  trash: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 4h11M5.5 4V2.5h5V4M6.5 7v4M9.5 7v4M3.5 4l.5 9h8l.5-9"/></svg>,
  copy: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M2 11V2.5h8.5" strokeLinecap="round"/></svg>,
  eye: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"/><circle cx="8" cy="8" r="2"/></svg>,
  download: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2v9M5 8l3 3 3-3M3 13h10"/></svg>,
  invoice: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="1.5" width="12" height="13" rx="1.5"/><path d="M5 5h6M5 7.5h6M5 10h3" strokeLinecap="round"/><path d="M10 10l1 1 2-2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14" strokeLinecap="round"/></svg>,
  clock: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  users: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="5" r="2"/><path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" strokeLinecap="round"/><circle cx="11.5" cy="5.5" r="1.5"/><path d="M11.5 9c1.8 0 3.2 1.2 3.2 3" strokeLinecap="round"/></svg>,
  money: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1v14M5 4c0-1.1 1.3-2 3-2s3 .9 3 2-1.3 2-3 2-3 .9-3 2 1.3 2 3 2 3-.9 3-2" strokeLinecap="round"/></svg>,
  template: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M2 6h12M6 6v8" strokeLinecap="round"/></svg>,
  refresh: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8a6 6 0 0110.5-4M14 8a6 6 0 01-10.5 4"/><path d="M12.5 1v3h-3M3.5 15v-3h3"/></svg>,
  tag: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 1.5h6l7 7-6 6-7-7v-6Z" strokeLinejoin="round"/><circle cx="5" cy="5" r="1" fill="currentColor"/></svg>,
  arrowRight: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>,
  warning: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2L14 13H2L8 2Z" strokeLinejoin="round"/><path d="M8 6.5v3M8 11v.5" strokeLinecap="round"/></svg>,
};

/* ════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════ */
const QUOTE_STATUSES = [
  { id: 'draft',    label: 'Taslak',     color: '#94a3b8', icon: Icons.edit },
  { id: 'sent',     label: 'Gönderildi', color: '#6366f1', icon: Icons.send },
  { id: 'approved', label: 'Onaylandı',  color: '#10b981', icon: Icons.check },
  { id: 'rejected', label: 'Reddedildi', color: '#ef4444', icon: Icons.x },
  { id: 'revised',  label: 'Revize',     color: '#f59e0b', icon: Icons.refresh },
  { id: 'expired',  label: 'Süresi Doldu', color: '#78716c', icon: Icons.clock },
  { id: 'invoiced', label: 'Faturalandı',  color: '#06b6d4', icon: Icons.invoice },
];

const TEMPLATE_STORAGE_KEY = 'sod_quote_templates';
const COMPANY_STORAGE_KEY = 'sod_quote_company_profile';

const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-maintenance-basic',
    name: 'Periyodik Bakım - Temel',
    items: [
      { name: 'Periyodik bakım hizmeti', qty: 1, unit: 'paket', unitPrice: 8500, category: 'hizmet' },
      { name: 'Kontrol checklist ve raporlama', qty: 1, unit: 'adet', unitPrice: 1750, category: 'işçilik' },
    ],
  },
  {
    id: 'tpl-installation',
    name: 'Kurulum Paketi',
    items: [
      { name: 'Saha kurulum ve devreye alma', qty: 1, unit: 'iş', unitPrice: 14500, category: 'hizmet' },
      { name: 'Kablo ve bağlantı sarfı', qty: 1, unit: 'set', unitPrice: 3200, category: 'parça' },
    ],
  },
  {
    id: 'tpl-repair-fast',
    name: 'Arıza Müdahale - Hızlı',
    items: [
      { name: 'Yerinde arıza tespiti', qty: 1, unit: 'adet', unitPrice: 2250, category: 'işçilik' },
      { name: 'Müdahale ve onarım', qty: 2, unit: 'saat', unitPrice: 1200, category: 'hizmet' },
    ],
  },
];

const DEFAULT_COMPANY = {
  name: 'Scor-Pi Servis Operasyonlari',
  address: 'Istanbul / Turkiye',
  phone: '+90 (212) 000 00 00',
  email: 'teklif@scor-pi.com',
  website: 'www.scor-pi.com',
  iban: 'TR00 0000 0000 0000 0000 0000 00',
  logoDataUrl: '',
};

/* ════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════ */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
const fmtMoney = (n) => '₺' + (n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const calcSubtotal = (items) => items.reduce((s, i) => s + (i.qty * i.unitPrice), 0);
const calcTotal = (items, taxRate, discount) => {
  const sub = calcSubtotal(items);
  const disc = sub * (discount / 100);
  const afterDisc = sub - disc;
  const tax = afterDisc * (taxRate / 100);
  return { subtotal: sub, discountAmount: disc, afterDiscount: afterDisc, taxAmount: tax, total: afterDisc + tax };
};

const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function QuotationsPage({ darkMode }) {
  const [quotations, setQuotations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(DEFAULT_COMPANY);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [previewQuote, setPreviewQuote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const templateImportInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('sod_quotations');
    if (saved) { try { setQuotations(JSON.parse(saved)); } catch { setQuotations([]); } }
    else { setQuotations([]); }

    const savedTpl = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (savedTpl) {
      try {
        setTemplates(JSON.parse(savedTpl));
      } catch {
        setTemplates(DEFAULT_TEMPLATES);
      }
    } else {
      setTemplates(DEFAULT_TEMPLATES);
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
    }

    const savedCompany = localStorage.getItem(COMPANY_STORAGE_KEY);
    if (savedCompany) {
      try {
        setCompanyProfile({ ...DEFAULT_COMPANY, ...JSON.parse(savedCompany) });
      } catch {
        setCompanyProfile(DEFAULT_COMPANY);
      }
    }
  }, []);

  const persist = useCallback((data) => { setQuotations(data); localStorage.setItem('sod_quotations', JSON.stringify(data)); }, []);
  const persistTemplates = useCallback((data) => { setTemplates(data); localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(data)); }, []);
  const persistCompany = useCallback((data) => {
    setCompanyProfile(data);
    localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(data));
  }, []);

  /* ── Form State ─────────────────────────────────────────── */
  const emptyForm = { client: '', clientContact: '', notes: '', taxRate: 20, discount: 0, validDays: 15, items: [{ name: '', qty: 1, unit: 'adet', unitPrice: 0, category: 'hizmet' }] };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setForm(emptyForm); setModalMode('create'); setEditingId(null); setShowModal(true); };

  const openEdit = (q) => {
    setForm({ client: q.client, clientContact: q.clientContact, notes: q.notes, taxRate: q.taxRate, discount: q.discount, validDays: 15, items: [...q.items] });
    setModalMode('edit');
    setEditingId(q.id);
    setShowModal(true);
  };

  const applyTemplate = (tpl) => {
    setForm(prev => ({ ...prev, items: [...tpl.items.map(i => ({ ...i }))] }));
    setShowTemplateModal(false);
  };

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { name: '', qty: 1, unit: 'adet', unitPrice: 0, category: 'hizmet' }] }));
  };

  const removeItem = (idx) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const updateItem = (idx, field, value) => {
    setForm(prev => {
      const items = prev.items.map((item, i) => i === idx ? { ...item, [field]: field === 'qty' || field === 'unitPrice' ? Number(value) : value } : item);
      return { ...prev, items };
    });
  };

  const saveQuotation = () => {
    if (!form.client || form.items.length === 0 || !form.items[0].name) return;
    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date(Date.now() + (form.validDays || 15) * 86400000).toISOString().split('T')[0];

    if (modalMode === 'create') {
      const seq = quotations.length + 1;
      const newQ = {
        id: `TKL-2026-${String(seq).padStart(4, '0')}`,
        client: form.client,
        clientContact: form.clientContact,
        source: 'manual',
        status: 'draft',
        version: 1,
        createdAt: today,
        validUntil,
        notes: form.notes,
        taxRate: Number(form.taxRate),
        discount: Number(form.discount),
        items: form.items,
        history: [{ date: today, action: 'Oluşturuldu', user: 'Admin' }],
      };
      persist([newQ, ...quotations]);
    } else {
      persist(quotations.map(q => {
        if (q.id !== editingId) return q;
        return {
          ...q,
          client: form.client,
          clientContact: form.clientContact,
          notes: form.notes,
          taxRate: Number(form.taxRate),
          discount: Number(form.discount),
          validUntil,
          items: form.items,
          history: [...q.history, { date: today, action: 'Düzenlendi', user: 'Admin' }],
        };
      }));
    }
    setShowModal(false);
  };

  const deleteQuotation = (id) => {
    if (!window.confirm('Bu teklifi silmek istediğinize emin misiniz?')) return;
    persist(quotations.filter(q => q.id !== id));
    if (previewQuote?.id === id) setPreviewQuote(null);
  };

  const updateStatus = (id, newStatus) => {
    const today = new Date().toISOString().split('T')[0];
    const actionMap = { sent: 'Müşteriye gönderildi', approved: 'Onaylandı', rejected: 'Reddedildi', revised: 'Revize edildi' };
    const updated = quotations.map(q => {
      if (q.id !== id) return q;
      const version = newStatus === 'revised' ? q.version + 1 : q.version;
      return {
        ...q,
        status: newStatus,
        version,
        history: [...q.history, { date: today, action: actionMap[newStatus] || `Durum: ${newStatus}`, user: 'Admin' }],
      };
    });
    persist(updated);
    if (previewQuote?.id === id) setPreviewQuote(updated.find(q => q.id === id));
  };

  const convertToInvoice = (q) => {
    if (!window.confirm(`"${q.id}" teklifini faturaya dönüştürmek istiyor musunuz?`)) return;
    const today = new Date().toISOString().split('T')[0];
    const updated = quotations.map(qt => {
      if (qt.id !== q.id) return qt;
      return { ...qt, status: 'invoiced', history: [...qt.history, { date: today, action: 'Faturaya dönüştürüldü', user: 'Admin' }] };
    });
    persist(updated);
    if (previewQuote?.id === q.id) setPreviewQuote(updated.find(qt => qt.id === q.id));
    alert(`Fatura oluşturuldu! Teklif ${q.id} → Fatura olarak işlendi.`);
  };

  const duplicateQuotation = (q) => {
    const today = new Date().toISOString().split('T')[0];
    const seq = quotations.length + 1;
    const newQ = {
      ...q,
      id: `TKL-2026-${String(seq).padStart(4, '0')}`,
      status: 'draft',
      version: 1,
      createdAt: today,
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      items: q.items.map(i => ({ ...i })),
      history: [{ date: today, action: `Kopyalandı (${q.id} üzerinden)`, user: 'Admin' }],
    };
    persist([newQ, ...quotations]);
  };

  const saveAsTemplate = () => {
    const name = prompt('Şablon adı:');
    if (!name) return;
    persistTemplates([...templates, { id: 'tpl-' + uid(), name, items: form.items.map(i => ({ ...i })) }]);
    alert('Şablon kaydedildi!');
  };

  const importTemplateFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        const incoming = Array.isArray(parsed) ? parsed : [parsed];
        const normalized = incoming
          .map((tpl) => ({
            id: `tpl-${uid()}`,
            name: String(tpl.name || '').trim(),
            items: Array.isArray(tpl.items) ? tpl.items : [],
          }))
          .filter((tpl) => tpl.name && tpl.items.length > 0)
          .map((tpl) => ({
            ...tpl,
            items: tpl.items.map((item) => ({
              name: String(item.name || 'Kalem').trim(),
              qty: Number(item.qty) || 1,
              unit: String(item.unit || 'adet').trim(),
              unitPrice: Number(item.unitPrice) || 0,
              category: ['hizmet', 'parça', 'işçilik'].includes(item.category) ? item.category : 'hizmet',
            })),
          }));

        if (normalized.length === 0) {
          alert('Gecerli bir sablon bulunamadi. JSON icinde name ve items alanlari olmali.');
          return;
        }

        persistTemplates([...normalized, ...templates]);
        alert(`${normalized.length} sablon ice aktarıldı.`);
      } catch {
        alert('Sablon dosyasi okunamadi. Lutfen gecerli bir JSON dosyasi secin.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const onCompanyLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      persistCompany({ ...companyProfile, logoDataUrl: String(reader.result || '') });
    };
    reader.readAsDataURL(file);
  };

  const downloadQuotePdf = (quote) => {
    const calc = calcTotal(quote.items, quote.taxRate, quote.discount);
    const popup = window.open('', '_blank', 'width=900,height=760');
    if (!popup) {
      alert('Pop-up engellendi. Lutfen pop-up izni verip tekrar deneyin.');
      return;
    }

    const rows = quote.items.map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.category || '-')}</td>
        <td style="text-align:right;">${item.qty}</td>
        <td>${escapeHtml(item.unit || '-')}</td>
        <td style="text-align:right;">${fmtMoney(item.unitPrice)}</td>
        <td style="text-align:right;font-weight:700;">${fmtMoney(item.qty * item.unitPrice)}</td>
      </tr>
    `).join('');

    const logoHtml = companyProfile.logoDataUrl
      ? `<img src="${companyProfile.logoDataUrl}" alt="Logo" style="width:130px;max-height:70px;object-fit:contain;" />`
      : `<div style="font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(companyProfile.name)}</div>`;

    popup.document.write(`
      <!doctype html>
      <html lang="tr">
        <head>
          <meta charset="utf-8" />
          <title>${quote.id}</title>
          <style>
            body { font-family: Arial, sans-serif; color:#0f172a; margin: 22px; }
            .head { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; border-bottom:2px solid #e2e8f0; padding-bottom:12px; }
            .company { font-size:12px; line-height:1.5; color:#334155; }
            .meta { text-align:right; font-size:12px; color:#334155; }
            .meta strong { color:#0f172a; }
            table { width:100%; border-collapse:collapse; margin-top:16px; }
            th { background:#f1f5f9; font-size:11px; text-transform:uppercase; color:#475569; }
            td, th { border:1px solid #e2e8f0; padding:8px; }
            .totals { margin-left:auto; width:300px; margin-top:16px; }
            .totals div { display:flex; justify-content:space-between; border-bottom:1px dashed #cbd5e1; padding:4px 0; font-size:13px; }
            .totals .grand { font-size:16px; font-weight:700; border-bottom:none; margin-top:6px; }
            .notes { margin-top:18px; font-size:12px; color:#334155; }
            .foot { margin-top:24px; font-size:11px; color:#64748b; border-top:1px solid #e2e8f0; padding-top:8px; }
          </style>
        </head>
        <body>
          <div class="head">
            <div>
              ${logoHtml}
              <div class="company">
                <div>${escapeHtml(companyProfile.address)}</div>
                <div>Tel: ${escapeHtml(companyProfile.phone)} · E-posta: ${escapeHtml(companyProfile.email)}</div>
                <div>Web: ${escapeHtml(companyProfile.website)}</div>
                <div>IBAN: ${escapeHtml(companyProfile.iban)}</div>
              </div>
            </div>
            <div class="meta">
              <div><strong>${escapeHtml(quote.id)}</strong></div>
              <div>Musteri: ${escapeHtml(quote.client)}</div>
              <div>Ilgili: ${escapeHtml(quote.clientContact || '-')}</div>
              <div>Tarih: ${fmtDate(quote.createdAt)}</div>
              <div>Gecerlilik: ${fmtDate(quote.validUntil)}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th><th>Kalem</th><th>Kategori</th><th>Miktar</th><th>Birim</th><th>Birim Fiyat</th><th>Toplam</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="totals">
            <div><span>Ara Toplam</span><span>${fmtMoney(calc.subtotal)}</span></div>
            <div><span>Iskonto (%${quote.discount || 0})</span><span>-${fmtMoney(calc.discountAmount)}</span></div>
            <div><span>KDV (%${quote.taxRate || 0})</span><span>${fmtMoney(calc.taxAmount)}</span></div>
            <div class="grand"><span>Genel Toplam</span><span>${fmtMoney(calc.total)}</span></div>
          </div>
          <div class="notes">${escapeHtml(quote.notes || '')}</div>
          <div class="foot">Bu dokuman sistem tarafindan olusturulmustur.</div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    popup.document.close();
  };

  /* ── Filtered ───────────────────────────────────────────── */
  const filtered = quotations.filter(q => {
    const matchSearch = q.client.toLowerCase().includes(searchTerm.toLowerCase()) || q.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || q.status === filterStatus;
    const source = q.source || 'manual';
    const matchSource = filterSource === 'all' || source === filterSource;
    return matchSearch && matchStatus && matchSource;
  });

  /* ── Stats ──────────────────────────────────────────────── */
  const stats = {
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'sent').length,
    approved: quotations.filter(q => q.status === 'approved').length,
    totalValue: quotations.filter(q => q.status !== 'rejected' && q.status !== 'expired').reduce((s, q) => s + calcTotal(q.items, q.taxRate, q.discount).total, 0),
  };

  /* ═══════════════════════════════════════════════════════════
     PREVIEW VIEW
     ═══════════════════════════════════════════════════════════ */
  if (previewQuote) {
    const q = previewQuote;
    const statusInfo = QUOTE_STATUSES.find(s => s.id === q.status);
    const calc = calcTotal(q.items, q.taxRate, q.discount);
    const isExpired = new Date(q.validUntil) < new Date() && q.status === 'sent';

    return (
      <div className={`quotations-page ${darkMode ? 'dark-mode' : ''}`}>
        <div className="qt-preview-header">
          <button className="qt-btn qt-btn-secondary" onClick={() => setPreviewQuote(null)}>← Teklifler</button>
          <div className="qt-preview-actions">
            {q.status === 'draft' && <button className="qt-btn qt-btn-primary qt-btn-sm" onClick={() => updateStatus(q.id, 'sent')}>{Icons.send(14)} Gönder</button>}
            {q.status === 'sent' && (
              <>
                <button className="qt-btn qt-btn-sm" style={{ background: '#d1fae5', color: '#059669', border: '1px solid #a7f3d0' }} onClick={() => updateStatus(q.id, 'approved')}>{Icons.check(14)} Onayla</button>
                <button className="qt-btn qt-btn-sm" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }} onClick={() => updateStatus(q.id, 'rejected')}>{Icons.x(14)} Reddet</button>
                <button className="qt-btn qt-btn-secondary qt-btn-sm" onClick={() => updateStatus(q.id, 'revised')}>{Icons.refresh(14)} Revize</button>
              </>
            )}
            {q.status === 'approved' && <button className="qt-btn qt-btn-primary qt-btn-sm" onClick={() => convertToInvoice(q)}>{Icons.invoice(14)} Faturaya Dönüştür</button>}
            <button className="qt-btn qt-btn-secondary qt-btn-sm" onClick={() => downloadQuotePdf(q)}>{Icons.download(14)} PDF İndir</button>
            <button className="qt-btn qt-btn-secondary qt-btn-sm" onClick={() => duplicateQuotation(q)}>{Icons.copy(14)} Kopyala</button>
            <button className="qt-btn qt-btn-secondary qt-btn-sm" onClick={() => openEdit(q)}>{Icons.edit(14)} Düzenle</button>
          </div>
        </div>

        {/* Quote Document */}
        <div className="qt-document">
          <div className="qt-doc-header">
            <div>
              <h2>{q.id}</h2>
              <p className="qt-doc-subtitle">Teklif Belgesi {q.version > 1 ? `(v${q.version})` : ''}</p>
            </div>
            <div className="qt-doc-status">
              <span className="qt-status-badge" style={{ background: statusInfo?.color + '18', color: statusInfo?.color, borderColor: statusInfo?.color + '40' }}>
                {statusInfo?.label}
              </span>
              {isExpired && <span className="qt-expired-badge">{Icons.warning(11)} Süresi Dolmuş</span>}
            </div>
          </div>

          <div className="qt-doc-info-grid">
            <div className="qt-doc-info-item">
              <span className="qt-doc-info-label">Müşteri</span>
              <span className="qt-doc-info-value">{q.client}</span>
            </div>
            <div className="qt-doc-info-item">
              <span className="qt-doc-info-label">İlgili Kişi</span>
              <span className="qt-doc-info-value">{q.clientContact || '-'}</span>
            </div>
            <div className="qt-doc-info-item">
              <span className="qt-doc-info-label">Oluşturulma</span>
              <span className="qt-doc-info-value">{fmtDate(q.createdAt)}</span>
            </div>
            <div className="qt-doc-info-item">
              <span className="qt-doc-info-label">Geçerlilik</span>
              <span className="qt-doc-info-value">{fmtDate(q.validUntil)}</span>
            </div>
          </div>

          {q.notes && <div className="qt-doc-notes">{q.notes}</div>}

          {/* Items Table */}
          <div className="qt-items-table-wrap">
            <table className="qt-items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Kalem</th>
                  <th>Kategori</th>
                  <th>Miktar</th>
                  <th>Birim</th>
                  <th>Birim Fiyat</th>
                  <th>Toplam</th>
                </tr>
              </thead>
              <tbody>
                {q.items.map((item, i) => (
                  <tr key={i}>
                    <td className="qt-table-num">{i + 1}</td>
                    <td className="qt-table-name">{item.name}</td>
                    <td><span className={`qt-cat-badge qt-cat-${item.category}`}>{item.category === 'hizmet' ? 'Hizmet' : item.category === 'parça' ? 'Parça' : 'İşçilik'}</span></td>
                    <td className="qt-table-right">{item.qty}</td>
                    <td>{item.unit}</td>
                    <td className="qt-table-right">{fmtMoney(item.unitPrice)}</td>
                    <td className="qt-table-right qt-table-bold">{fmtMoney(item.qty * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="qt-totals">
            <div className="qt-total-row"><span>Ara Toplam</span><span>{fmtMoney(calc.subtotal)}</span></div>
            {q.discount > 0 && <div className="qt-total-row qt-discount"><span>İskonto (%{q.discount})</span><span>-{fmtMoney(calc.discountAmount)}</span></div>}
            <div className="qt-total-row"><span>KDV (%{q.taxRate})</span><span>{fmtMoney(calc.taxAmount)}</span></div>
            <div className="qt-total-row qt-grand-total"><span>GENEL TOPLAM</span><span>{fmtMoney(calc.total)}</span></div>
          </div>

          {/* History */}
          <div className="qt-history-section">
            <h4>İşlem Geçmişi</h4>
            <div className="qt-history-list">
              {q.history.map((h, i) => (
                <div key={i} className="qt-history-item">
                  <span className="qt-history-date">{fmtDate(h.date)}</span>
                  <span className="qt-history-action">{h.action}</span>
                  <span className="qt-history-user">{h.user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editing modal from preview */}
        {showModal && renderModal()}
        {showCompanyModal && renderCompanyModal()}
      </div>
    );
  }

  function renderCompanyModal() {
    const profile = companyProfile;
    const setProfileField = (key, value) => persistCompany({ ...profile, [key]: value });

    return (
      <div className="qt-modal-overlay" onClick={() => setShowCompanyModal(false)}>
        <div className="qt-modal qt-modal-sm" onClick={(event) => event.stopPropagation()}>
          <div className="qt-modal-header">
            <h2>{Icons.template(16)} Firma Bilgisi</h2>
            <button className="qt-modal-close" onClick={() => setShowCompanyModal(false)}>×</button>
          </div>
          <div className="qt-form">
            <div className="qt-form-group"><label>Firma Adı</label><input value={profile.name} onChange={(event) => setProfileField('name', event.target.value)} /></div>
            <div className="qt-form-group"><label>Adres</label><input value={profile.address} onChange={(event) => setProfileField('address', event.target.value)} /></div>
            <div className="qt-form-group"><label>Telefon</label><input value={profile.phone} onChange={(event) => setProfileField('phone', event.target.value)} /></div>
            <div className="qt-form-group"><label>E-posta</label><input value={profile.email} onChange={(event) => setProfileField('email', event.target.value)} /></div>
            <div className="qt-form-group"><label>Web Sitesi</label><input value={profile.website} onChange={(event) => setProfileField('website', event.target.value)} /></div>
            <div className="qt-form-group"><label>IBAN</label><input value={profile.iban} onChange={(event) => setProfileField('iban', event.target.value)} /></div>
            <div className="qt-form-group">
              <label>Logo</label>
              <input type="file" accept="image/*" onChange={onCompanyLogoChange} />
              {profile.logoDataUrl && <img src={profile.logoDataUrl} alt="Firma logosu" className="qt-company-logo-preview" />}
            </div>
            <div className="qt-form-actions">
              <button className="qt-btn qt-btn-primary" onClick={() => setShowCompanyModal(false)}>Kapat</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     FORM MODAL (rendered by both views)
     ═══════════════════════════════════════════════════════════ */
  function renderModal() {
    const calc = calcTotal(form.items, form.taxRate, form.discount);
    return (
      <div className="qt-modal-overlay" onClick={() => setShowModal(false)}>
        <div className="qt-modal qt-modal-lg" onClick={e => e.stopPropagation()}>
          <div className="qt-modal-header">
            <h2>{Icons.fileText(16)} {modalMode === 'create' ? 'Yeni Teklif' : 'Teklifi Düzenle'}</h2>
            <button className="qt-modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="qt-form">
            {/* Template bar */}
            <div className="qt-template-bar">
              <button className="qt-btn qt-btn-secondary qt-btn-sm" onClick={() => setShowTemplateModal(true)}>{Icons.template(14)} Şablondan Yükle</button>
              <button className="qt-btn qt-btn-secondary qt-btn-sm" onClick={saveAsTemplate}>{Icons.tag(14)} Şablon Olarak Kaydet</button>
            </div>

            <div className="qt-form-row">
              <div className="qt-form-group">
                <label>Müşteri</label>
                <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Müşteri adı..." />
              </div>
              <div className="qt-form-group">
                <label>İlgili Kişi</label>
                <input value={form.clientContact} onChange={e => setForm({ ...form, clientContact: e.target.value })} placeholder="Kişi adı..." />
              </div>
            </div>

            <div className="qt-form-row qt-form-row-3">
              <div className="qt-form-group">
                <label>KDV (%)</label>
                <input type="number" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: e.target.value })} />
              </div>
              <div className="qt-form-group">
                <label>İskonto (%)</label>
                <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
              </div>
              <div className="qt-form-group">
                <label>Geçerlilik (gün)</label>
                <input type="number" value={form.validDays} onChange={e => setForm({ ...form, validDays: e.target.value })} />
              </div>
            </div>

            <div className="qt-form-group">
              <label>Not</label>
              <textarea rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Teklif notu..." />
            </div>

            {/* Line Items */}
            <div className="qt-items-editor">
              <div className="qt-items-header-row">
                <span className="qt-ie-name">Kalem Adı</span>
                <span className="qt-ie-cat">Kategori</span>
                <span className="qt-ie-qty">Miktar</span>
                <span className="qt-ie-unit">Birim</span>
                <span className="qt-ie-price">Birim Fiyat</span>
                <span className="qt-ie-total">Toplam</span>
                <span className="qt-ie-act"></span>
              </div>
              {form.items.map((item, i) => (
                <div key={i} className="qt-items-row">
                  <input className="qt-ie-name" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Kalem adı..." />
                  <select className="qt-ie-cat" value={item.category} onChange={e => updateItem(i, 'category', e.target.value)}>
                    <option value="hizmet">Hizmet</option>
                    <option value="parça">Parça</option>
                    <option value="işçilik">İşçilik</option>
                  </select>
                  <input className="qt-ie-qty" type="number" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} />
                  <input className="qt-ie-unit" value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} />
                  <input className="qt-ie-price" type="number" min="0" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} />
                  <span className="qt-ie-total">{fmtMoney(item.qty * item.unitPrice)}</span>
                  <button className="qt-ie-remove" onClick={() => removeItem(i)}>{Icons.trash(13)}</button>
                </div>
              ))}
              <button className="qt-btn qt-btn-secondary qt-btn-sm" onClick={addItem}>{Icons.plus(13)} Kalem Ekle</button>
            </div>

            {/* Totals */}
            <div className="qt-form-totals">
              <div className="qt-ft-row"><span>Ara Toplam</span><span>{fmtMoney(calc.subtotal)}</span></div>
              {form.discount > 0 && <div className="qt-ft-row"><span>İskonto (%{form.discount})</span><span>-{fmtMoney(calc.discountAmount)}</span></div>}
              <div className="qt-ft-row"><span>KDV (%{form.taxRate})</span><span>{fmtMoney(calc.taxAmount)}</span></div>
              <div className="qt-ft-row qt-ft-grand"><span>TOPLAM</span><span>{fmtMoney(calc.total)}</span></div>
            </div>

            <div className="qt-form-actions">
              <button className="qt-btn qt-btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button className="qt-btn qt-btn-primary" onClick={saveQuotation}>{modalMode === 'create' ? 'Oluştur' : 'Kaydet'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     LIST VIEW (Main)
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className={`quotations-page ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="qt-page-header">
        <div className="qt-header-left">
          <h1>{Icons.fileText(20)} Teklif Yönetimi</h1>
          <p>Müşterilere teklif hazırlayın, takip edin ve faturaya dönüştürün</p>
        </div>
        <div className="qt-header-actions">
          <button className="qt-btn qt-btn-secondary" onClick={() => setShowCompanyModal(true)}>{Icons.template(14)} Firma Bilgisi</button>
          <button className="qt-btn qt-btn-primary" onClick={openCreate}>{Icons.plus(15)} Yeni Teklif</button>
        </div>
      </div>

      {/* Stats */}
      <div className="qt-stats-row">
        <div className="qt-stat-card">
          <div className="qt-stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>{Icons.fileText(20)}</div>
          <div className="qt-stat-info"><div className="qt-stat-value">{stats.total}</div><div className="qt-stat-label">TOPLAM</div></div>
        </div>
        <div className="qt-stat-card">
          <div className="qt-stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>{Icons.send(20)}</div>
          <div className="qt-stat-info"><div className="qt-stat-value">{stats.pending}</div><div className="qt-stat-label">BEKLEYEN</div></div>
        </div>
        <div className="qt-stat-card">
          <div className="qt-stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>{Icons.check(20)}</div>
          <div className="qt-stat-info"><div className="qt-stat-value">{stats.approved}</div><div className="qt-stat-label">ONAYLANAN</div></div>
        </div>
        <div className="qt-stat-card">
          <div className="qt-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>{Icons.money(20)}</div>
          <div className="qt-stat-info"><div className="qt-stat-value">{fmtMoney(stats.totalValue)}</div><div className="qt-stat-label">TOPLAM DEĞER</div></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="qt-toolbar">
        <div className="qt-search-box">
          {Icons.search(15)}
          <input placeholder="Teklif no veya müşteri ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          {searchTerm && <button className="qt-search-clear" onClick={() => setSearchTerm('')}>×</button>}
        </div>
        <select className="qt-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tüm Durumlar</option>
          {QUOTE_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select className="qt-select" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="all">Tum Kaynaklar</option>
          <option value="manual">Manuel</option>
          <option value="crm">CRM</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="qt-empty-state">
          <div className="qt-empty-icon">{Icons.fileText(40)}</div>
          <p>Teklif bulunamadı</p>
          <button className="qt-btn qt-btn-primary" onClick={openCreate}>{Icons.plus(14)} İlk Teklifi Oluştur</button>
        </div>
      ) : (
        <div className="qt-list">
          <div className="qt-list-header">
            <span className="qt-col-id">Teklif No</span>
            <span className="qt-col-client">Müşteri</span>
            <span className="qt-col-status">Durum</span>
            <span className="qt-col-total">Toplam</span>
            <span className="qt-col-date">Tarih</span>
            <span className="qt-col-valid">Geçerlilik</span>
            <span className="qt-col-actions">İşlem</span>
          </div>
          {filtered.map(q => {
            const statusInfo = QUOTE_STATUSES.find(s => s.id === q.status);
            const calc = calcTotal(q.items, q.taxRate, q.discount);
            const isExpired = new Date(q.validUntil) < new Date() && q.status === 'sent';
            return (
              <div key={q.id} className="qt-list-row" onClick={() => setPreviewQuote(q)}>
                <span className="qt-col-id">
                  <strong>{q.id}</strong>
                  {q.version > 1 && <span className="qt-version-badge">v{q.version}</span>}
                </span>
                <span className="qt-col-client">
                  <span className="qt-client-name">{q.client}</span>
                  <span className="qt-client-contact">{q.clientContact}</span>
                  <span className={`qt-source-badge ${(q.source || 'manual') === 'crm' ? 'crm' : 'manual'}`}>
                    {(q.source || 'manual') === 'crm' ? 'CRM' : 'Manuel'}
                  </span>
                </span>
                <span className="qt-col-status">
                  <span className="qt-status-badge" style={{ background: statusInfo?.color + '18', color: statusInfo?.color, borderColor: statusInfo?.color + '40' }}>
                    {statusInfo?.label}
                  </span>
                  {isExpired && <span className="qt-expired-mini">{Icons.warning(10)}</span>}
                </span>
                <span className="qt-col-total qt-money">{fmtMoney(calc.total)}</span>
                <span className="qt-col-date">{fmtDate(q.createdAt)}</span>
                <span className="qt-col-valid">{fmtDate(q.validUntil)}</span>
                <span className="qt-col-actions" onClick={e => e.stopPropagation()}>
                  <button className="qt-action-btn" onClick={() => setPreviewQuote(q)} title="Görüntüle">{Icons.eye(14)}</button>
                  <button className="qt-action-btn" onClick={() => openEdit(q)} title="Düzenle">{Icons.edit(14)}</button>
                  <button className="qt-action-btn" onClick={() => duplicateQuotation(q)} title="Kopyala">{Icons.copy(14)}</button>
                  <button className="qt-action-btn qt-action-btn-danger" onClick={() => deleteQuotation(q.id)} title="Sil">{Icons.trash(14)}</button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showModal && renderModal()}
      {showCompanyModal && renderCompanyModal()}

      {/* Template Picker Modal */}
      {showTemplateModal && (
        <div className="qt-modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="qt-modal qt-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="qt-modal-header">
              <h2>{Icons.template(16)} Şablon Seç</h2>
              <button className="qt-modal-close" onClick={() => setShowTemplateModal(false)}>×</button>
            </div>
            <div className="qt-template-import">
              <input
                ref={templateImportInputRef}
                type="file"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={importTemplateFile}
              />
              <button className="qt-btn qt-btn-secondary qt-btn-sm" onClick={() => templateImportInputRef.current?.click()}>
                {Icons.download(14)} JSON Şablon İçe Aktar
              </button>
            </div>
            <div className="qt-template-list">
              {templates.map(tpl => (
                <div key={tpl.id} className="qt-template-card" onClick={() => applyTemplate(tpl)}>
                  <div className="qt-tpl-name">{tpl.name}</div>
                  <div className="qt-tpl-meta">{tpl.items.length} kalem · {fmtMoney(calcSubtotal(tpl.items))}</div>
                </div>
              ))}
              {templates.length === 0 && <div className="qt-empty-sm">Henüz şablon yok</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
