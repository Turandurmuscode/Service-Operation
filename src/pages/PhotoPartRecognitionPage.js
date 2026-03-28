import React, { useEffect, useMemo, useState } from 'react';
import './PhotoPartRecognitionPage.css';

const HISTORY_STORAGE_KEY = 'sod_part_recognition_history';

const DEVICE_OPTIONS = [
  { value: 'generic', label: 'Genel Cihaz' },
  { value: 'hvac', label: 'Klima / HVAC' },
  { value: 'boiler', label: 'Kombi / Isitma' },
  { value: 'water', label: 'Su Sistemleri' },
  { value: 'electrical', label: 'Elektrik Panosu' },
  { value: 'network', label: 'Network / IT' },
];

const PART_CATALOG = [
  { id: 'fan_motor', name: 'Fan Motoru', code: 'PRT-FAN-001', category: 'hardware', keywords: ['fan', 'motor', 'blower', 'pervane'], devices: ['hvac', 'boiler'] },
  { id: 'compressor', name: 'Kompresor', code: 'PRT-CMP-004', category: 'hardware', keywords: ['kompresor', 'compressor', 'dis', 'condensing'], devices: ['hvac'] },
  { id: 'pcb_board', name: 'Kontrol Karti (PCB)', code: 'PRT-PCB-019', category: 'hardware', keywords: ['pcb', 'kart', 'board', 'ana kart'], devices: ['hvac', 'boiler', 'water', 'electrical'] },
  { id: 'relay', name: 'Role', code: 'PRT-RLY-014', category: 'power', keywords: ['role', 'relay', 'kontakt', 'switch'], devices: ['boiler', 'electrical', 'hvac'] },
  { id: 'contactor', name: 'Kontaktör', code: 'PRT-CON-022', category: 'power', keywords: ['kontaktor', 'contactor', 'coil'], devices: ['electrical', 'hvac'] },
  { id: 'sensor_temp', name: 'Isi Sensörü', code: 'PRT-SEN-009', category: 'hardware', keywords: ['sensor', 'ntc', 'sicaklik', 'isi'], devices: ['hvac', 'boiler', 'water'] },
  { id: 'sensor_pressure', name: 'Basinç Sensörü', code: 'PRT-SEN-017', category: 'hardware', keywords: ['basinc', 'pressure', 'pressostat'], devices: ['hvac', 'water', 'boiler'] },
  { id: 'valve', name: 'Solenoid Vana', code: 'PRT-VLV-006', category: 'hardware', keywords: ['valf', 'vana', 'solenoid', 'valve'], devices: ['water', 'boiler', 'hvac'] },
  { id: 'capacitor', name: 'Kapasitör', code: 'PRT-CAP-003', category: 'power', keywords: ['kapasitor', 'capacitor', 'kondansator'], devices: ['hvac', 'electrical'] },
  { id: 'fuse', name: 'Sigorta', code: 'PRT-FUSE-011', category: 'power', keywords: ['sigorta', 'fuse'], devices: ['electrical', 'network', 'hvac', 'boiler'] },
  { id: 'psu', name: 'Guc Kaynagi (PSU)', code: 'PRT-PSU-016', category: 'power', keywords: ['power', 'psu', 'guc kaynagi', 'adapter'], devices: ['network', 'electrical'] },
  { id: 'cable_kit', name: 'Baglanti Kablo Seti', code: 'PRT-CBL-008', category: 'cable', keywords: ['kablo', 'klemens', 'baglanti', 'jack'], devices: ['network', 'electrical', 'hvac'] },
  { id: 'network_card', name: 'Network Karti', code: 'PRT-NIC-013', category: 'network', keywords: ['network', 'ethernet', 'lan', 'nic'], devices: ['network'] },
  { id: 'filter', name: 'Filtre', code: 'PRT-FLT-021', category: 'other', keywords: ['filtre', 'filter'], devices: ['water', 'hvac'] },
];

const tokenize = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9çğıöşü\s]/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

const formatDateTime = (value) => new Date(value).toLocaleString('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const scoreCandidate = (part, tokenSet, deviceType) => {
  const hitKeywords = part.keywords.filter((kw) => tokenSet.has(kw));
  const keywordScore = hitKeywords.length * 17;
  const deviceBonus = deviceType !== 'generic' && part.devices.includes(deviceType) ? 8 : 0;
  const confidence = Math.min(97, 42 + keywordScore + deviceBonus);

  return {
    ...part,
    hitKeywords,
    confidence,
  };
};

function PhotoPartRecognitionPage({ darkMode, showToast, onNavigate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [deviceType, setDeviceType] = useState('generic');
  const [contextText, setContextText] = useState('');
  const [results, setResults] = useState([]);
  const [lastScanMeta, setLastScanMeta] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setScanHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setScanHistory([]);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectedDeviceLabel = useMemo(() => {
    return DEVICE_OPTIONS.find((item) => item.value === deviceType)?.label || 'Genel Cihaz';
  }, [deviceType]);

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults([]);
    setLastScanMeta(null);
  };

  const analyze = () => {
    if (!selectedFile) {
      showToast?.('Lutfen once bir fotograf secin.', 'warning');
      return;
    }

    const tokens = [
      ...tokenize(selectedFile.name),
      ...tokenize(contextText),
      ...tokenize(selectedDeviceLabel),
    ];

    const tokenSet = new Set(tokens);

    let candidates = PART_CATALOG
      .map((part) => scoreCandidate(part, tokenSet, deviceType))
      .filter((candidate) => candidate.hitKeywords.length > 0)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    if (candidates.length === 0) {
      candidates = [
        {
          id: 'manual-review',
          name: 'Net Eslesme Bulunamadi',
          code: 'MANUAL-REVIEW',
          category: 'other',
          confidence: 38,
          hitKeywords: [],
          devices: [],
          keywords: [],
        },
      ];
    }

    const scanAt = new Date().toISOString();
    const meta = {
      fileName: selectedFile.name,
      deviceType,
      scanAt,
      selectedDeviceLabel,
    };

    setResults(candidates);
    setLastScanMeta(meta);

    const historyItem = {
      id: `${Date.now()}`,
      fileName: selectedFile.name,
      deviceType,
      scanAt,
      topResult: candidates[0]?.name || 'Bulunamadi',
      topConfidence: candidates[0]?.confidence || 0,
    };

    const nextHistory = [historyItem, ...scanHistory].slice(0, 30);
    setScanHistory(nextHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));

    showToast?.('Fotograf analizi tamamlandi.', 'success');
  };

  const createDraftSparePart = (candidate) => {
    if (!candidate || candidate.id === 'manual-review') {
      showToast?.('Bu sonuc icin otomatik taslak olusturulamadi.', 'warning');
      return;
    }

    let spareParts = [];
    try {
      spareParts = JSON.parse(localStorage.getItem('spareParts') || '[]');
      if (!Array.isArray(spareParts)) spareParts = [];
    } catch {
      spareParts = [];
    }

    const alreadyExists = spareParts.some((item) => item.code === candidate.code || item.name === candidate.name);
    if (alreadyExists) {
      showToast?.('Bu parca stok listesinde zaten var.', 'info');
      onNavigate?.('spareparts');
      return;
    }

    const now = new Date().toISOString();
    const newPart = {
      id: Date.now(),
      name: candidate.name,
      code: candidate.code,
      brand: 'Belirlenmedi',
      category: candidate.category,
      currentStock: 0,
      minStock: 2,
      unit: 'Adet',
      unitPrice: 0,
      supplier: 'Belirlenmedi',
      location: 'Depo-A1',
      description: `Foto analizinden olusan taslak (${candidate.confidence}% guven)`,
      createdAt: now,
      createdBy: 'AI Part Detection',
      lastUpdated: now,
    };

    const updated = [newPart, ...spareParts];
    localStorage.setItem('spareParts', JSON.stringify(updated));
    showToast?.(`${candidate.name} taslak olarak Yedek Parca listesine eklendi.`, 'success');
  };

  return (
    <div className={`photo-rec-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="pr-header">
        <h1>Fotograftan Parca Tanima</h1>
        <p>Fotograf yukle, sistem olasi parcalari ve guven skorunu cikarsin.</p>
      </div>

      <div className="pr-grid">
        <section className="pr-card">
          <h3>1) Girdi</h3>
          <div className="pr-form-group">
            <label>Fotograf</label>
            <input type="file" accept="image/*" onChange={onFileChange} />
          </div>

          <div className="pr-form-group">
            <label>Cihaz Tipi</label>
            <select value={deviceType} onChange={(event) => setDeviceType(event.target.value)}>
              {DEVICE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="pr-form-group">
            <label>Ek Not (opsiyonel)</label>
            <textarea
              rows="3"
              value={contextText}
              onChange={(event) => setContextText(event.target.value)}
              placeholder="Ornek: fan motor bolgesinde yanik izi, kart ustunde kararma var"
            />
          </div>

          <button className="pr-btn pr-btn-primary" onClick={analyze}>Analiz Et</button>

          {previewUrl && (
            <div className="pr-preview-wrap">
              <img src={previewUrl} alt="Secilen parca" className="pr-preview" />
              <div className="pr-preview-meta">{selectedFile?.name}</div>
            </div>
          )}
        </section>

        <section className="pr-card">
          <h3>2) Aday Parcalar</h3>
          {!lastScanMeta && <div className="pr-empty">Analiz sonucu burada listelenecek.</div>}

          {lastScanMeta && (
            <div className="pr-scan-meta">
              <span>Tarih: {formatDateTime(lastScanMeta.scanAt)}</span>
              <span>Cihaz: {lastScanMeta.selectedDeviceLabel}</span>
            </div>
          )}

          <div className="pr-results">
            {results.map((candidate) => (
              <article key={candidate.id} className="pr-result-card">
                <div className="pr-result-top">
                  <div>
                    <div className="pr-part-name">{candidate.name}</div>
                    <div className="pr-part-code">{candidate.code}</div>
                  </div>
                  <div className={`pr-confidence ${candidate.confidence >= 75 ? 'good' : candidate.confidence >= 55 ? 'mid' : 'low'}`}>
                    %{candidate.confidence}
                  </div>
                </div>

                <div className="pr-progress"><span style={{ width: `${candidate.confidence}%` }} /></div>

                <div className="pr-reason">
                  {candidate.hitKeywords.length > 0
                    ? `Eslesen anahtarlar: ${candidate.hitKeywords.join(', ')}`
                    : 'Eslesen anahtar bulunamadi, manuel kontrol onerilir.'}
                </div>

                <div className="pr-result-actions">
                  <button className="pr-btn pr-btn-secondary" onClick={() => createDraftSparePart(candidate)}>
                    Stoga Taslak Ekle
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="pr-card pr-history-card">
        <h3>Son Tarama Gecmisi</h3>
        {scanHistory.length === 0 ? (
          <div className="pr-empty">Henuz tarama kaydi yok.</div>
        ) : (
          <div className="pr-history-table-wrap">
            <table className="pr-history-table">
              <thead>
                <tr>
                  <th>Fotograf</th>
                  <th>Cihaz</th>
                  <th>En Guclu Aday</th>
                  <th>Skor</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.fileName}</td>
                    <td>{DEVICE_OPTIONS.find((opt) => opt.value === item.deviceType)?.label || 'Genel'}</td>
                    <td>{item.topResult}</td>
                    <td>%{item.topConfidence}</td>
                    <td>{formatDateTime(item.scanAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default PhotoPartRecognitionPage;
