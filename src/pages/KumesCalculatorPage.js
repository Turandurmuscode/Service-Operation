import React, { useState, useEffect, useCallback } from 'react';
import './KumesCalculatorPage.css';

/* ════════════════════════════════════════════════════════════
   SVG ICONS
   ════════════════════════════════════════════════════════════ */
const Icons = {
  calculator: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="1" width="12" height="14" rx="1.5"/><rect x="4" y="3" width="8" height="3" rx="0.5" fill="currentColor" opacity="0.15"/><path d="M5 9h2M9 9h2M5 11.5h2M9 11.5h2" strokeLinecap="round"/></svg>,
  plus: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  trash: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 4h11M5.5 4V2.5h5V4M6.5 7v4M9.5 7v4M3.5 4l.5 9h8l.5-9"/></svg>,
  edit: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3.5l3.5 3.5M3 10.5V14h3.5L14 6.5 10.5 3 3 10.5Z"/></svg>,
  close: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  download: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2v9M5 8l3 3 3-3M3 13h10"/></svg>,
  save: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 14H4a1 1 0 01-1-1V3a1 1 0 011-1h6l3 3v8a1 1 0 01-1 1Z" strokeLinejoin="round"/><path d="M10 2v3h3" strokeLinecap="round"/><rect x="5" y="9" width="6" height="3" rx="0.5"/></svg>,
  box: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M2 5l6-3 6 3v6l-6 3-6-3V5Z"/><path d="M2 5l6 3 6-3M8 8v6" strokeLinecap="round"/></svg>,
  ruler: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="5" width="14" height="6" rx="1"/><path d="M4 5v3M7 5v2M10 5v3M13 5v2" strokeLinecap="round"/></svg>,
  money: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1v14M5 4c0-1.1 1.3-2 3-2s3 .9 3 2-1.3 2-3 2-3 .9-3 2 1.3 2 3 2 3-.9 3-2" strokeLinecap="round"/></svg>,
  search: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14" strokeLinecap="round"/></svg>,
};

/* ════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════ */
const UNITS = ['adet', 'metre', 'm²', 'kg', 'paket', 'rulo', 'ton', 'litre', 'takım'];
const FORMULA_TYPES = [
  { id: 'per_length',     label: 'Uzunluğa göre',       desc: 'Her X metrede 1 adet' },
  { id: 'per_width',      label: 'Ene göre',            desc: 'Her X metrede 1 adet' },
  { id: 'per_perimeter',  label: 'Çevreye göre',        desc: 'Her X metrede 1 adet' },
  { id: 'floor_area',     label: 'Taban alanı (m²)',    desc: 'Uzunluk × En × katsayı' },
  { id: 'wall_area',      label: 'Duvar alanı (m²)',    desc: '(U×Y×2 + E×Y×2) × katsayı' },
  { id: 'roof_area',      label: 'Çatı alanı (m²)',     desc: 'Uzunluk × En × katsayı' },
  { id: 'volume',         label: 'Hacme göre',          desc: 'U×E×Y × katsayı' },
  { id: 'fixed',          label: 'Sabit miktar',        desc: 'Her kümes için sabit adet' },
];

const STORAGE_KEY_MAT = 'sod_kumes_materials';
const STORAGE_KEY_CALC = 'sod_kumes_calculations';

const fmtMoney = (n) => '₺' + (n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

/* ════════════════════════════════════════════════════════════
   FORMULA CALCULATOR
   ════════════════════════════════════════════════════════════ */
function calcQuantity(formula, interval, multiplier, dims) {
  const { length, width, height } = dims;
  const perimeter = 2 * (length + width);
  const floorArea = length * width;
  const wallArea = 2 * (length * height) + 2 * (width * height);
  const roofArea = length * width;
  const volume = length * width * height;
  const k = multiplier || 1;
  const inv = interval || 1;

  switch (formula) {
    case 'per_length':    return Math.ceil(length / inv) * k;
    case 'per_width':     return Math.ceil(width / inv) * k;
    case 'per_perimeter': return Math.ceil(perimeter / inv) * k;
    case 'floor_area':    return Math.ceil(floorArea * k);
    case 'wall_area':     return Math.ceil(wallArea * k);
    case 'roof_area':     return Math.ceil(roofArea * k);
    case 'volume':        return Math.ceil(volume * k);
    case 'fixed':         return Math.ceil(k);
    default: return 0;
  }
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function KumesCalculatorPage({ darkMode }) {
  const [materials, setMaterials] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [activeTab, setActiveTab] = useState('calculate'); // calculate | materials | history

  // Dimensions
  const [dims, setDims] = useState({ length: '', width: '', height: '' });
  const [calcResult, setCalcResult] = useState(null);
  const [taxRate, setTaxRate] = useState(20);
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');

  // Material modal
  const [showMatModal, setShowMatModal] = useState(false);
  const [matForm, setMatForm] = useState({ name: '', unit: 'adet', unitPrice: '', formula: 'per_length', interval: '', multiplier: '1', category: '' });
  const [editingMat, setEditingMat] = useState(null);

  useEffect(() => {
    try {
      const savedMat = localStorage.getItem(STORAGE_KEY_MAT);
      if (savedMat) setMaterials(JSON.parse(savedMat));
    } catch {}
    try {
      const savedCalc = localStorage.getItem(STORAGE_KEY_CALC);
      if (savedCalc) setCalculations(JSON.parse(savedCalc));
    } catch {}
  }, []);

  const persistMaterials = useCallback((data) => {
    setMaterials(data);
    localStorage.setItem(STORAGE_KEY_MAT, JSON.stringify(data));
  }, []);

  const persistCalculations = useCallback((data) => {
    setCalculations(data);
    localStorage.setItem(STORAGE_KEY_CALC, JSON.stringify(data));
  }, []);

  /* ── Material CRUD ──────────────────────────────────────── */
  const openAddMaterial = () => {
    setMatForm({ name: '', unit: 'adet', unitPrice: '', formula: 'per_length', interval: '', multiplier: '1', category: '' });
    setEditingMat(null);
    setShowMatModal(true);
  };

  const openEditMaterial = (mat) => {
    setMatForm({ name: mat.name, unit: mat.unit, unitPrice: mat.unitPrice, formula: mat.formula, interval: mat.interval, multiplier: mat.multiplier, category: mat.category || '' });
    setEditingMat(mat.id);
    setShowMatModal(true);
  };

  const saveMaterial = () => {
    if (!matForm.name || !matForm.unitPrice) return;
    const entry = { ...matForm, unitPrice: Number(matForm.unitPrice), interval: Number(matForm.interval) || 1, multiplier: Number(matForm.multiplier) || 1 };
    if (editingMat) {
      persistMaterials(materials.map(m => m.id === editingMat ? { ...entry, id: editingMat } : m));
    } else {
      persistMaterials([...materials, { ...entry, id: Date.now().toString(36) }]);
    }
    setShowMatModal(false);
  };

  const deleteMaterial = (id) => {
    if (!window.confirm('Bu malzemeyi silmek istediğinize emin misiniz?')) return;
    persistMaterials(materials.filter(m => m.id !== id));
  };

  /* ── Calculation ────────────────────────────────────────── */
  const calculate = () => {
    const d = { length: Number(dims.length), width: Number(dims.width), height: Number(dims.height) };
    if (!d.length || !d.width || !d.height) return;
    if (materials.length === 0) { alert('Önce malzeme tanımlayın!'); setActiveTab('materials'); return; }

    const items = materials.map(mat => {
      const qty = calcQuantity(mat.formula, mat.interval, mat.multiplier, d);
      const total = qty * mat.unitPrice;
      return { ...mat, quantity: qty, lineTotal: total };
    });

    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const discAmount = subtotal * (discount / 100);
    const afterDisc = subtotal - discAmount;
    const taxAmount = afterDisc * (taxRate / 100);
    const grandTotal = afterDisc + taxAmount;

    const result = {
      dims: d,
      floorArea: d.length * d.width,
      wallArea: 2 * (d.length * d.height) + 2 * (d.width * d.height),
      perimeter: 2 * (d.length + d.width),
      volume: d.length * d.width * d.height,
      items,
      subtotal,
      discAmount,
      afterDisc,
      taxAmount,
      grandTotal,
      taxRate,
      discount,
      customerName,
      date: new Date().toISOString(),
    };

    setCalcResult(result);
  };

  const saveCalculation = () => {
    if (!calcResult) return;
    const entry = { ...calcResult, id: Date.now().toString(36) };
    persistCalculations([entry, ...calculations]);
  };

  const deleteCalculation = (id) => {
    persistCalculations(calculations.filter(c => c.id !== id));
  };

  const loadCalculation = (calc) => {
    setDims({ length: calc.dims.length, width: calc.dims.width, height: calc.dims.height });
    setTaxRate(calc.taxRate);
    setDiscount(calc.discount);
    setCustomerName(calc.customerName || '');
    setCalcResult(calc);
    setActiveTab('calculate');
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className={`kumes-page ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="km-page-header">
        <div className="km-header-left">
          <h1>{Icons.calculator(22)} Kümes Hesaplayıcı</h1>
          <p>Kümes boyutlarını girin, malzeme miktarı ve maliyet otomatik hesaplansın</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="km-tabs">
        <button className={`km-tab ${activeTab === 'calculate' ? 'active' : ''}`} onClick={() => setActiveTab('calculate')}>
          {Icons.ruler(14)} Hesapla
        </button>
        <button className={`km-tab ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>
          {Icons.box(14)} Malzemeler ({materials.length})
        </button>
        <button className={`km-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          {Icons.save(14)} Kayıtlar ({calculations.length})
        </button>
      </div>

      {/* ══ TAB: Calculate ══ */}
      {activeTab === 'calculate' && (
        <div className="km-calculate-tab">
          {/* Dimension inputs */}
          <div className="km-dims-card">
            <h3>{Icons.ruler(16)} Kümes Boyutları</h3>
            <div className="km-dims-row">
              <div className="km-dim-group">
                <label>Uzunluk (m)</label>
                <input type="number" value={dims.length} onChange={e => setDims({...dims, length: e.target.value})} placeholder="110" min="0" step="0.1" />
              </div>
              <div className="km-dim-group">
                <label>En (m)</label>
                <input type="number" value={dims.width} onChange={e => setDims({...dims, width: e.target.value})} placeholder="16" min="0" step="0.1" />
              </div>
              <div className="km-dim-group">
                <label>Yükseklik (m)</label>
                <input type="number" value={dims.height} onChange={e => setDims({...dims, height: e.target.value})} placeholder="3.5" min="0" step="0.1" />
              </div>
            </div>
            <div className="km-dims-row km-dims-extras">
              <div className="km-dim-group">
                <label>Müşteri Adı</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Firma adı..." />
              </div>
              <div className="km-dim-group">
                <label>KDV (%)</label>
                <input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} min="0" max="100" />
              </div>
              <div className="km-dim-group">
                <label>İskonto (%)</label>
                <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} min="0" max="100" />
              </div>
            </div>

            {/* Quick info */}
            {dims.length && dims.width && dims.height && (
              <div className="km-quick-info">
                <span>Taban: <strong>{(Number(dims.length) * Number(dims.width)).toLocaleString('tr-TR')} m²</strong></span>
                <span>Duvar: <strong>{(2*(Number(dims.length)*Number(dims.height)) + 2*(Number(dims.width)*Number(dims.height))).toLocaleString('tr-TR')} m²</strong></span>
                <span>Çevre: <strong>{(2*(Number(dims.length)+Number(dims.width))).toLocaleString('tr-TR')} m</strong></span>
                <span>Hacim: <strong>{(Number(dims.length)*Number(dims.width)*Number(dims.height)).toLocaleString('tr-TR')} m³</strong></span>
              </div>
            )}

            <button className="km-btn km-btn-primary km-btn-lg" onClick={calculate}>
              {Icons.calculator(16)} Hesapla
            </button>
          </div>

          {/* Result */}
          {calcResult && (
            <div className="km-result-card">
              <div className="km-result-header">
                <h3>{Icons.money(16)} Hesaplama Sonucu</h3>
                <div className="km-result-actions">
                  <button className="km-btn km-btn-sm km-btn-secondary" onClick={saveCalculation}>{Icons.save(14)} Kaydet</button>
                </div>
              </div>

              {customerName && <div className="km-result-customer">Müşteri: <strong>{customerName}</strong></div>}
              <div className="km-result-dims">
                {calcResult.dims.length}m × {calcResult.dims.width}m × {calcResult.dims.height}m
                <span className="km-result-area">({calcResult.floorArea.toLocaleString('tr-TR')} m² taban)</span>
              </div>

              {/* Items table */}
              <div className="km-items-table-wrap">
                <table className="km-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Malzeme</th>
                      <th>Hesaplama</th>
                      <th className="km-right">Miktar</th>
                      <th>Birim</th>
                      <th className="km-right">Birim Fiyat</th>
                      <th className="km-right">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calcResult.items.map((item, i) => (
                      <tr key={item.id || i}>
                        <td className="km-table-num">{i + 1}</td>
                        <td className="km-table-name">{item.name}</td>
                        <td className="km-table-formula">{FORMULA_TYPES.find(f => f.id === item.formula)?.label || item.formula}</td>
                        <td className="km-right km-table-bold">{item.quantity.toLocaleString('tr-TR')}</td>
                        <td>{item.unit}</td>
                        <td className="km-right">{fmtMoney(item.unitPrice)}</td>
                        <td className="km-right km-table-bold">{fmtMoney(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="km-totals">
                <div className="km-total-row">
                  <span>Ara Toplam</span>
                  <span>{fmtMoney(calcResult.subtotal)}</span>
                </div>
                {calcResult.discount > 0 && (
                  <div className="km-total-row km-discount">
                    <span>İskonto (%{calcResult.discount})</span>
                    <span>-{fmtMoney(calcResult.discAmount)}</span>
                  </div>
                )}
                <div className="km-total-row">
                  <span>KDV (%{calcResult.taxRate})</span>
                  <span>{fmtMoney(calcResult.taxAmount)}</span>
                </div>
                <div className="km-total-row km-grand-total">
                  <span>Genel Toplam</span>
                  <span>{fmtMoney(calcResult.grandTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {!calcResult && materials.length === 0 && (
            <div className="km-empty-state">
              <p>Hesaplama yapabilmek için önce <strong>"Malzemeler"</strong> sekmesinden malzeme tanımlayın.</p>
              <button className="km-btn km-btn-primary" onClick={() => setActiveTab('materials')}>
                {Icons.plus(14)} Malzeme Ekle
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: Materials ══ */}
      {activeTab === 'materials' && (
        <div className="km-materials-tab">
          <div className="km-mat-toolbar">
            <button className="km-btn km-btn-primary" onClick={openAddMaterial}>
              {Icons.plus(14)} Yeni Malzeme
            </button>
            <span className="km-mat-count">{materials.length} malzeme tanımlı</span>
          </div>

          {materials.length === 0 ? (
            <div className="km-empty-state">
              <p>Henüz malzeme tanımlı değil. Kümes yapımında kullanılan tüm malzemeleri ekleyin.</p>
              <button className="km-btn km-btn-primary" onClick={openAddMaterial}>
                {Icons.plus(14)} İlk Malzemeyi Ekle
              </button>
            </div>
          ) : (
            <div className="km-mat-list">
              <div className="km-mat-header">
                <span className="km-mat-col-name">Malzeme</span>
                <span className="km-mat-col-formula">Formül</span>
                <span className="km-mat-col-unit">Birim</span>
                <span className="km-mat-col-price">Birim Fiyat</span>
                <span className="km-mat-col-actions"></span>
              </div>
              {materials.map(mat => {
                const fType = FORMULA_TYPES.find(f => f.id === mat.formula);
                return (
                  <div key={mat.id} className="km-mat-row">
                    <div className="km-mat-col-name">
                      <strong>{mat.name}</strong>
                      {mat.category && <span className="km-mat-cat">{mat.category}</span>}
                    </div>
                    <div className="km-mat-col-formula">
                      <span className="km-formula-badge">{fType?.label || mat.formula}</span>
                      {mat.formula !== 'fixed' && mat.formula !== 'floor_area' && mat.formula !== 'wall_area' && mat.formula !== 'roof_area' && mat.formula !== 'volume' && (
                        <span className="km-formula-detail">her {mat.interval}m'de {mat.multiplier} adet</span>
                      )}
                      {(mat.formula === 'floor_area' || mat.formula === 'wall_area' || mat.formula === 'roof_area' || mat.formula === 'volume') && mat.multiplier !== 1 && (
                        <span className="km-formula-detail">×{mat.multiplier} katsayı</span>
                      )}
                      {mat.formula === 'fixed' && (
                        <span className="km-formula-detail">{mat.multiplier} adet sabit</span>
                      )}
                    </div>
                    <div className="km-mat-col-unit">{mat.unit}</div>
                    <div className="km-mat-col-price">{fmtMoney(mat.unitPrice)}</div>
                    <div className="km-mat-col-actions">
                      <button className="km-icon-btn" onClick={() => openEditMaterial(mat)} title="Düzenle">{Icons.edit(14)}</button>
                      <button className="km-icon-btn km-icon-btn-danger" onClick={() => deleteMaterial(mat.id)} title="Sil">{Icons.trash(14)}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: History ══ */}
      {activeTab === 'history' && (
        <div className="km-history-tab">
          {calculations.length === 0 ? (
            <div className="km-empty-state">
              <p>Henüz kaydedilmiş hesaplama yok.</p>
            </div>
          ) : (
            <div className="km-history-list">
              {calculations.map(calc => (
                <div key={calc.id} className="km-history-card">
                  <div className="km-history-header">
                    <div>
                      <strong>{calc.customerName || 'İsimsiz'}</strong>
                      <span className="km-history-date">{new Date(calc.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="km-history-actions">
                      <button className="km-btn km-btn-sm km-btn-secondary" onClick={() => loadCalculation(calc)}>Yükle</button>
                      <button className="km-icon-btn km-icon-btn-danger" onClick={() => deleteCalculation(calc.id)}>{Icons.trash(14)}</button>
                    </div>
                  </div>
                  <div className="km-history-body">
                    <span>{calc.dims.length}m × {calc.dims.width}m × {calc.dims.height}m</span>
                    <span>{calc.items.length} malzeme</span>
                    <span className="km-history-total">{fmtMoney(calc.grandTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ Material Modal ══ */}
      {showMatModal && (
        <div className="km-modal-overlay" onClick={() => setShowMatModal(false)}>
          <div className="km-modal" onClick={e => e.stopPropagation()}>
            <div className="km-modal-header">
              <h2>{editingMat ? 'Malzeme Düzenle' : 'Yeni Malzeme'}</h2>
              <button className="km-modal-close" onClick={() => setShowMatModal(false)}>×</button>
            </div>
            <div className="km-modal-body">
              <div className="km-form-group">
                <label>Malzeme Adı *</label>
                <input type="text" value={matForm.name} onChange={e => setMatForm({...matForm, name: e.target.value})} placeholder="Örn: Işıklık, Suluk, Panel..." />
              </div>
              <div className="km-form-group">
                <label>Kategori</label>
                <input type="text" value={matForm.category} onChange={e => setMatForm({...matForm, category: e.target.value})} placeholder="Örn: Yapısal, Donanım..." />
              </div>
              <div className="km-form-row">
                <div className="km-form-group">
                  <label>Birim</label>
                  <select value={matForm.unit} onChange={e => setMatForm({...matForm, unit: e.target.value})}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="km-form-group">
                  <label>Birim Fiyat (₺) *</label>
                  <input type="number" value={matForm.unitPrice} onChange={e => setMatForm({...matForm, unitPrice: e.target.value})} placeholder="0.00" min="0" step="0.01" />
                </div>
              </div>
              <div className="km-form-group">
                <label>Hesaplama Formülü</label>
                <select value={matForm.formula} onChange={e => setMatForm({...matForm, formula: e.target.value})}>
                  {FORMULA_TYPES.map(f => <option key={f.id} value={f.id}>{f.label} — {f.desc}</option>)}
                </select>
              </div>
              {['per_length', 'per_width', 'per_perimeter'].includes(matForm.formula) && (
                <div className="km-form-row">
                  <div className="km-form-group">
                    <label>Her kaç metrede bir?</label>
                    <input type="number" value={matForm.interval} onChange={e => setMatForm({...matForm, interval: e.target.value})} placeholder="3" min="0.1" step="0.1" />
                  </div>
                  <div className="km-form-group">
                    <label>Her noktada kaç adet?</label>
                    <input type="number" value={matForm.multiplier} onChange={e => setMatForm({...matForm, multiplier: e.target.value})} placeholder="1" min="0.01" step="0.01" />
                  </div>
                </div>
              )}
              {['floor_area', 'wall_area', 'roof_area', 'volume'].includes(matForm.formula) && (
                <div className="km-form-group">
                  <label>Katsayı (çarpan)</label>
                  <input type="number" value={matForm.multiplier} onChange={e => setMatForm({...matForm, multiplier: e.target.value})} placeholder="1" min="0.01" step="0.01" />
                </div>
              )}
              {matForm.formula === 'fixed' && (
                <div className="km-form-group">
                  <label>Sabit miktar</label>
                  <input type="number" value={matForm.multiplier} onChange={e => setMatForm({...matForm, multiplier: e.target.value})} placeholder="1" min="1" />
                </div>
              )}
            </div>
            <div className="km-modal-footer">
              <button className="km-btn km-btn-secondary" onClick={() => setShowMatModal(false)}>İptal</button>
              <button className="km-btn km-btn-primary" onClick={saveMaterial}>
                {editingMat ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
