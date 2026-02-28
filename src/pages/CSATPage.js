import { useState, useEffect, useMemo } from 'react';
import './CSATPage.css';

const CSATPage = ({ incidents, clients, currentUser, showToast, darkMode }) => {
  const [surveys, setSurveys] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    incidentId: '',
    clientId: '',
    technicianName: '',
    starRating: 0,
    npsScore: null,
    categories: { response: 0, quality: 0, communication: 0, professionalism: 0 },
    comment: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('csatSurveys');
    if (saved) {
      setSurveys(JSON.parse(saved));
    } else {
      // Seed sample data
      const seed = generateSeedData(incidents, clients);
      setSurveys(seed);
      localStorage.setItem('csatSurveys', JSON.stringify(seed));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveSurveys = (data) => {
    setSurveys(data);
    localStorage.setItem('csatSurveys', JSON.stringify(data));
  };

  // Filter by period
  const filteredSurveys = useMemo(() => {
    if (filterPeriod === 'all') return surveys;
    const now = new Date();
    const cutoff = new Date();
    if (filterPeriod === '7d') cutoff.setDate(now.getDate() - 7);
    else if (filterPeriod === '30d') cutoff.setDate(now.getDate() - 30);
    else if (filterPeriod === '90d') cutoff.setDate(now.getDate() - 90);
    return surveys.filter(s => new Date(s.createdAt) >= cutoff);
  }, [surveys, filterPeriod]);

  // Stats
  const stats = useMemo(() => {
    if (filteredSurveys.length === 0) return { avgRating: 0, nps: 0, totalSurveys: 0, responseRate: 0 };
    const avgRating = filteredSurveys.reduce((s, v) => s + v.starRating, 0) / filteredSurveys.length;
    const npsResponses = filteredSurveys.filter(s => s.npsScore !== null && s.npsScore !== undefined);
    let nps = 0;
    if (npsResponses.length > 0) {
      const promoters = npsResponses.filter(s => s.npsScore >= 9).length;
      const detractors = npsResponses.filter(s => s.npsScore <= 6).length;
      nps = Math.round(((promoters - detractors) / npsResponses.length) * 100);
    }
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed');
    const responseRate = resolvedIncidents.length > 0 
      ? Math.round((filteredSurveys.length / resolvedIncidents.length) * 100) 
      : 0;
    return { avgRating: avgRating.toFixed(1), nps, totalSurveys: filteredSurveys.length, responseRate: Math.min(responseRate, 100) };
  }, [filteredSurveys, incidents]);

  // Per-technician ranking
  const techRanking = useMemo(() => {
    const map = {};
    filteredSurveys.forEach(s => {
      if (!s.technicianName) return;
      if (!map[s.technicianName]) map[s.technicianName] = { name: s.technicianName, total: 0, count: 0, scores: [] };
      map[s.technicianName].total += s.starRating;
      map[s.technicianName].count += 1;
      map[s.technicianName].scores.push(s.starRating);
    });
    return Object.values(map)
      .map(t => ({ ...t, avg: (t.total / t.count).toFixed(2) }))
      .sort((a, b) => b.avg - a.avg);
  }, [filteredSurveys]);

  // Per-client ranking
  const clientRanking = useMemo(() => {
    const map = {};
    filteredSurveys.forEach(s => {
      const client = clients.find(c => c.id === s.clientId);
      const name = client ? client.name : 'Bilinmeyen';
      if (!map[name]) map[name] = { name, total: 0, count: 0 };
      map[name].total += s.starRating;
      map[name].count += 1;
    });
    return Object.values(map)
      .map(c => ({ ...c, avg: (c.total / c.count).toFixed(2) }))
      .sort((a, b) => b.avg - a.avg);
  }, [filteredSurveys, clients]);

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const map = {};
    surveys.forEach(s => {
      const d = new Date(s.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { month: key, total: 0, count: 0 };
      map[key].total += s.starRating;
      map[key].count += 1;
    });
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map(m => ({ ...m, avg: (m.total / m.count).toFixed(1) }));
  }, [surveys]);

  const handleSubmit = () => {
    if (!formData.clientId || formData.starRating === 0) {
      showToast('Müşteri ve puan zorunludur', 'error');
      return;
    }
    const newSurvey = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.username || 'admin',
    };
    saveSurveys([newSurvey, ...surveys]);
    setFormData({ incidentId: '', clientId: '', technicianName: '', starRating: 0, npsScore: null, categories: { response: 0, quality: 0, communication: 0, professionalism: 0 }, comment: '' });
    setShowForm(false);
    showToast('Anket kaydedildi', 'success');
  };

  const deleteSurvey = (id) => {
    if (!window.confirm('Bu anketi silmek istediğinize emin misiniz?')) return;
    saveSurveys(surveys.filter(s => s.id !== id));
    showToast('Anket silindi', 'info');
  };

  const exportCSV = () => {
    const header = 'Tarih,Müşteri,Teknisyen,Puan,NPS,Yorum\n';
    const rows = filteredSurveys.map(s => {
      const client = clients.find(c => c.id === s.clientId);
      return `"${new Date(s.createdAt).toLocaleDateString('tr-TR')}","${client?.name || ''}","${s.technicianName || ''}",${s.starRating},${s.npsScore ?? ''},${JSON.stringify(s.comment || '')}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `memnuniyet_anketi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('CSV dışa aktarıldı', 'success');
  };

  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed');
  const technicians = [...new Set(incidents.map(i => i.assignedTo).filter(Boolean))];

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'excellent';
    if (rating >= 3.5) return 'good';
    if (rating >= 2.5) return 'warning';
    return 'danger';
  };

  const getNPSClass = (nps) => {
    if (nps > 50) return 'excellent';
    if (nps > 0) return 'good';
    if (nps > -30) return 'warning';
    return 'danger';
  };

  return (
    <div className={`csat-page ${darkMode ? 'dark' : ''}`}>
      <h2>📊 Müşteri Memnuniyeti (CSAT)</h2>
      <p className="page-subtitle">Hizmet kalitesini ölçün, müşteri geri bildirimlerini takip edin</p>

      {/* Stats */}
      <div className="csat-stats">
        <div className="csat-stat-card">
          <div className={`stat-value ${getRatingColor(stats.avgRating)}`}>⭐ {stats.avgRating}</div>
          <div className="stat-label">Ortalama Puan (5 üzerinden)</div>
        </div>
        <div className="csat-stat-card">
          <div className={`stat-value ${getNPSClass(stats.nps)}`}>{stats.nps > 0 ? '+' : ''}{stats.nps}</div>
          <div className="stat-label">NPS Skoru</div>
        </div>
        <div className="csat-stat-card">
          <div className="stat-value good">{stats.totalSurveys}</div>
          <div className="stat-label">Toplam Anket</div>
        </div>
        <div className="csat-stat-card">
          <div className={`stat-value ${stats.responseRate >= 50 ? 'good' : 'warning'}`}>%{stats.responseRate}</div>
          <div className="stat-label">Yanıt Oranı</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="csat-tabs">
        {[
          { id: 'overview', label: '📋 Genel Bakış' },
          { id: 'surveys', label: '📝 Anketler' },
          { id: 'technicians', label: '👨‍🔧 Teknisyen Sıralaması' },
          { id: 'clients', label: '🏢 Müşteri Sıralaması' },
          { id: 'trends', label: '📈 Trendler' },
        ].map(tab => (
          <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions bar */}
      <div className="csat-actions">
        <button className="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Kapat' : '+ Yeni Anket'}
        </button>
        <button onClick={exportCSV}>📥 CSV İndir</button>
        <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
          <option value="all">Tüm Zamanlar</option>
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
          <option value="90d">Son 90 Gün</option>
        </select>
      </div>

      {/* Survey Form */}
      {showForm && (
        <div className="csat-survey-form">
          <h3>Yeni Memnuniyet Anketi</h3>
          <div className="csat-form-row">
            <div className="csat-form-group">
              <label>Müşteri *</label>
              <select value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })}>
                <option value="">Seçiniz...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="csat-form-group">
              <label>İlgili Arıza</label>
              <select value={formData.incidentId} onChange={e => setFormData({ ...formData, incidentId: e.target.value })}>
                <option value="">Seçiniz (opsiyonel)...</option>
                {resolvedIncidents.slice(-30).map(i => <option key={i.id} value={i.id}>#{i.id} - {i.title}</option>)}
              </select>
            </div>
          </div>
          <div className="csat-form-row">
            <div className="csat-form-group">
              <label>Teknisyen</label>
              <select value={formData.technicianName} onChange={e => setFormData({ ...formData, technicianName: e.target.value })}>
                <option value="">Seçiniz...</option>
                {technicians.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="csat-form-group">
              <label>Genel Memnuniyet Puanı *</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className={`star ${formData.starRating >= star ? 'filled' : ''}`} onClick={() => setFormData({ ...formData, starRating: star })}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Category ratings */}
          <div className="csat-form-row">
            {[
              { key: 'response', label: 'Yanıt Süresi' },
              { key: 'quality', label: 'Çözüm Kalitesi' },
            ].map(cat => (
              <div className="csat-form-group" key={cat.key}>
                <label>{cat.label}</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`star ${formData.categories[cat.key] >= star ? 'filled' : ''}`}
                      onClick={() => setFormData({ ...formData, categories: { ...formData.categories, [cat.key]: star } })}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="csat-form-row">
            {[
              { key: 'communication', label: 'İletişim' },
              { key: 'professionalism', label: 'Profesyonellik' },
            ].map(cat => (
              <div className="csat-form-group" key={cat.key}>
                <label>{cat.label}</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`star ${formData.categories[cat.key] >= star ? 'filled' : ''}`}
                      onClick={() => setFormData({ ...formData, categories: { ...formData.categories, [cat.key]: star } })}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* NPS */}
          <div className="csat-form-row full">
            <div className="csat-form-group">
              <label>NPS: Bu hizmeti bir başkasına önerir misiniz? (0-10)</label>
              <div className="nps-rating">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button key={n} type="button"
                    className={`${formData.npsScore === n ? 'selected' : ''} ${n <= 6 ? 'detractor' : n <= 8 ? 'passive' : 'promoter'}`}
                    onClick={() => setFormData({ ...formData, npsScore: n })}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="nps-labels">
                <span>Kesinlikle önermem</span>
                <span>Kesinlikle öneririm</span>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="csat-form-row full">
            <div className="csat-form-group">
              <label>Yorum / Geri Bildirim</label>
              <textarea value={formData.comment} onChange={e => setFormData({ ...formData, comment: e.target.value })} placeholder="Müşterinin yorumu..." />
            </div>
          </div>

          <div className="csat-form-actions">
            <button className="btn-save" onClick={handleSubmit}>💾 Kaydet</button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>İptal</button>
          </div>
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'overview' && (
        <>
          {/* Monthly trend mini chart */}
          {monthlyTrend.length > 0 && (
            <div className="csat-trend-chart">
              <h3>Aylık Memnuniyet Trendi</h3>
              <div className="mini-bar-chart">
                {monthlyTrend.map(m => {
                  const pct = (parseFloat(m.avg) / 5) * 100;
                  const color = parseFloat(m.avg) >= 4 ? '#10b981' : parseFloat(m.avg) >= 3 ? '#3b82f6' : '#f59e0b';
                  return (
                    <div key={m.month} className="mini-bar" style={{ height: `${pct}%`, background: color }} title={`${m.month}: ${m.avg}`}>
                      <span className="bar-value">{m.avg}</span>
                      <span className="bar-label">{m.month.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Recent surveys */}
          <h3 style={{ marginBottom: 12 }}>Son Anketler</h3>
          <div className="csat-survey-list">
            {filteredSurveys.slice(0, 10).map(s => {
              const client = clients.find(c => c.id === s.clientId);
              return (
                <div key={s.id} className="csat-survey-item">
                  <div className={`score-badge score-${s.starRating}`}>{s.starRating}</div>
                  <div className="survey-details">
                    <h4>{client?.name || 'Bilinmeyen Müşteri'}</h4>
                    <p>Teknisyen: {s.technicianName || '-'} | NPS: {s.npsScore ?? '-'} | Arıza: #{s.incidentId || '-'}</p>
                    {s.comment && <div className="survey-comment">"{s.comment}"</div>}
                  </div>
                  <div className="survey-meta">
                    <div>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</div>
                    <button onClick={() => deleteSurvey(s.id)} style={{ marginTop: 8, border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              );
            })}
            {filteredSurveys.length === 0 && (
              <div className="empty-state"><div className="icon">📊</div><p>Henüz anket bulunmuyor</p></div>
            )}
          </div>
        </>
      )}

      {activeTab === 'surveys' && (
        <div className="csat-survey-list">
          {filteredSurveys.map(s => {
            const client = clients.find(c => c.id === s.clientId);
            return (
              <div key={s.id} className="csat-survey-item">
                <div className={`score-badge score-${s.starRating}`}>{s.starRating}</div>
                <div className="survey-details">
                  <h4>{client?.name || 'Bilinmeyen Müşteri'}</h4>
                  <p>
                    Teknisyen: {s.technicianName || '-'} | NPS: {s.npsScore ?? '-'} | 
                    Yanıt: {'⭐'.repeat(s.categories?.response || 0)} | 
                    Kalite: {'⭐'.repeat(s.categories?.quality || 0)}
                  </p>
                  {s.comment && <div className="survey-comment">"{s.comment}"</div>}
                </div>
                <div className="survey-meta">
                  <div>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</div>
                  <div>#{s.incidentId || '-'}</div>
                  <button onClick={() => deleteSurvey(s.id)} style={{ marginTop: 4, border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            );
          })}
          {filteredSurveys.length === 0 && (
            <div className="empty-state"><div className="icon">📝</div><p>Filtreye uygun anket bulunamadı</p></div>
          )}
        </div>
      )}

      {activeTab === 'technicians' && (
        <div className="csat-ranking">
          <h3>👨‍🔧 Teknisyen Memnuniyet Sıralaması</h3>
          <table>
            <thead>
              <tr><th>#</th><th>Teknisyen</th><th>Ort. Puan</th><th>Anket Sayısı</th><th>Memnuniyet</th></tr>
            </thead>
            <tbody>
              {techRanking.map((t, i) => (
                <tr key={t.name}>
                  <td><span className="rank-medal">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span></td>
                  <td><strong>{t.name}</strong></td>
                  <td>⭐ {t.avg}</td>
                  <td>{t.count}</td>
                  <td>
                    <div className="satisfaction-bar">
                      <div className="fill" style={{ width: `${(t.avg / 5) * 100}%`, background: t.avg >= 4 ? '#10b981' : t.avg >= 3 ? '#3b82f6' : '#f59e0b' }} />
                    </div>
                  </td>
                </tr>
              ))}
              {techRanking.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>Veri bulunamadı</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="csat-ranking">
          <h3>🏢 Müşteri Memnuniyet Sıralaması</h3>
          <table>
            <thead>
              <tr><th>#</th><th>Müşteri</th><th>Ort. Puan</th><th>Anket Sayısı</th><th>Memnuniyet</th></tr>
            </thead>
            <tbody>
              {clientRanking.map((c, i) => (
                <tr key={c.name}>
                  <td><span className="rank-medal">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span></td>
                  <td><strong>{c.name}</strong></td>
                  <td>⭐ {c.avg}</td>
                  <td>{c.count}</td>
                  <td>
                    <div className="satisfaction-bar">
                      <div className="fill" style={{ width: `${(c.avg / 5) * 100}%`, background: c.avg >= 4 ? '#10b981' : c.avg >= 3 ? '#3b82f6' : '#f59e0b' }} />
                    </div>
                  </td>
                </tr>
              ))}
              {clientRanking.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>Veri bulunamadı</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="csat-trend-chart">
          <h3>📈 Memnuniyet Trendi (Son 6 Ay)</h3>
          {monthlyTrend.length > 0 ? (
            <div className="mini-bar-chart">
              {monthlyTrend.map(m => {
                const pct = (parseFloat(m.avg) / 5) * 100;
                const color = parseFloat(m.avg) >= 4 ? '#10b981' : parseFloat(m.avg) >= 3 ? '#3b82f6' : '#f59e0b';
                return (
                  <div key={m.month} className="mini-bar" style={{ height: `${pct}%`, background: color }}>
                    <span className="bar-value">{m.avg}</span>
                    <span className="bar-label">{m.month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state"><div className="icon">📈</div><p>Trend verisi için yeterli anket bulunamadı</p></div>
          )}
          <div style={{ marginTop: 24 }}>
            <h3>Kategori Ortalamaları</h3>
            <div className="csat-stats" style={{ marginTop: 12 }}>
              {[
                { key: 'response', label: 'Yanıt Süresi', icon: '⏱️' },
                { key: 'quality', label: 'Çözüm Kalitesi', icon: '✅' },
                { key: 'communication', label: 'İletişim', icon: '💬' },
                { key: 'professionalism', label: 'Profesyonellik', icon: '👔' },
              ].map(cat => {
                const vals = filteredSurveys.filter(s => s.categories && s.categories[cat.key] > 0).map(s => s.categories[cat.key]);
                const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-';
                return (
                  <div key={cat.key} className="csat-stat-card">
                    <div className={`stat-value ${typeof avg === 'number' || !isNaN(avg) ? getRatingColor(avg) : ''}`}>{cat.icon} {avg}</div>
                    <div className="stat-label">{cat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function generateSeedData(incidents, clients) {
  const techNames = [...new Set(incidents.map(i => i.assignedTo).filter(Boolean))];
  if (techNames.length === 0) techNames.push('Ahmet Yılmaz', 'Mehmet Demir');
  const clientIds = clients.map(c => c.id);
  if (clientIds.length === 0) return [];

  const seed = [];
  const comments = [
    'Çok hızlı çözüm sağlandı, teşekkürler!',
    'Genel olarak memnunum ama iletişim biraz geç oldu.',
    'Harika bir hizmet, kesinlikle tavsiye ederim.',
    'Sorun çözüldü ama tekrar yaşanmaması için önlem alınmalı.',
    'Profesyonel ve güler yüzlü bir ekip.',
    'Beklentilerimin üzerinde bir hizmet aldım.',
    'Yanıt süresi biraz uzundu ama sonuç iyi.',
    '',
  ];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 90));
    seed.push({
      id: Date.now() - i * 1000 - Math.floor(Math.random() * 10000),
      clientId: clientIds[Math.floor(Math.random() * clientIds.length)],
      technicianName: techNames[Math.floor(Math.random() * techNames.length)],
      incidentId: incidents.length > 0 ? incidents[Math.floor(Math.random() * incidents.length)]?.id : '',
      starRating: Math.floor(Math.random() * 3) + 3, // 3-5
      npsScore: Math.floor(Math.random() * 5) + 6, // 6-10
      categories: {
        response: Math.floor(Math.random() * 3) + 3,
        quality: Math.floor(Math.random() * 3) + 3,
        communication: Math.floor(Math.random() * 3) + 3,
        professionalism: Math.floor(Math.random() * 3) + 3,
      },
      comment: comments[Math.floor(Math.random() * comments.length)],
      createdAt: d.toISOString(),
      createdBy: 'admin',
    });
  }
  return seed;
}

export default CSATPage;
