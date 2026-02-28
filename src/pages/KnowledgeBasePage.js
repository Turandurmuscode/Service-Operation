import React, { useState, useEffect, useCallback } from 'react';
import './KnowledgeBasePage.css';

const KB_CATEGORIES = [
  { value: 'software', label: 'Yazılım', icon: '💻' },
  { value: 'hardware', label: 'Donanım', icon: '🖥️' },
  { value: 'network', label: 'Ağ', icon: '🌐' },
  { value: 'printer', label: 'Yazıcı', icon: '🖨️' },
  { value: 'security', label: 'Güvenlik', icon: '🛡️' },
  { value: 'email', label: 'E-posta', icon: '✉️' },
  { value: 'os', label: 'İşletim Sistemi', icon: '🖥️' },
  { value: 'procedure', label: 'Prosedür', icon: '📋' },
  { value: 'other', label: 'Diğer', icon: '📦' },
];

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Kolay', color: '#22c55e' },
  { value: 'medium', label: 'Orta', color: '#f59e0b' },
  { value: 'hard', label: 'Zor', color: '#ef4444' },
];

const ensureArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

function KnowledgeBasePage({ currentUser, showToast }) {
  const [articles, setArticles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest | popular | rating

  useEffect(() => {
    try {
      const saved = localStorage.getItem('knowledgeBase');
      if (saved) {
        setArticles(JSON.parse(saved));
      } else {
        // Seed with sample articles
        const samples = getSampleArticles();
        setArticles(samples);
        localStorage.setItem('knowledgeBase', JSON.stringify(samples));
      }
    } catch { /* ignore */ }
  }, []);

  const saveArticles = useCallback((data) => {
    setArticles(data);
    localStorage.setItem('knowledgeBase', JSON.stringify(data));
  }, []);

  // ── CRUD ──────────────────────────
  const addArticle = (formData) => {
    const newArticle = {
      id: Date.now(),
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      views: 0,
      rating: 0,
      ratingCount: 0,
      helpful: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
      updatedAt: new Date().toISOString(),
    };
    saveArticles([newArticle, ...articles]);
    showToast('Makale eklendi!', 'success');
    setShowForm(false);
  };

  const updateArticle = (formData) => {
    const updated = articles.map(a =>
      a.id === editingArticle.id
        ? {
            ...a,
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    saveArticles(updated);
    showToast('Makale güncellendi!', 'success');
    setEditingArticle(null);
    setShowForm(false);
  };

  const deleteArticle = (id) => {
    if (!window.confirm('Bu makaleyi silmek istediğinize emin misiniz?')) return;
    saveArticles(articles.filter(a => a.id !== id));
    if (selectedArticle?.id === id) setSelectedArticle(null);
    showToast('Makale silindi!', 'success');
  };

  const viewArticle = (article) => {
    // Increment view count
    const updated = articles.map(a =>
      a.id === article.id ? { ...a, views: (a.views || 0) + 1 } : a
    );
    saveArticles(updated);
    setSelectedArticle({ ...article, views: (article.views || 0) + 1 });
  };

  const rateArticle = (articleId, isHelpful) => {
    const updated = articles.map(a => {
      if (a.id !== articleId) return a;
      const newCount = (a.ratingCount || 0) + 1;
      const newHelpful = (a.helpful || 0) + (isHelpful ? 1 : 0);
      return {
        ...a,
        ratingCount: newCount,
        helpful: newHelpful,
        rating: Math.round((newHelpful / newCount) * 100),
      };
    });
    saveArticles(updated);
    const updatedArticle = updated.find(a => a.id === articleId);
    if (selectedArticle?.id === articleId) setSelectedArticle(updatedArticle);
    showToast(isHelpful ? 'Teşekkürler! 👍' : 'Geri bildiriminiz alındı.', 'success');
  };

  // ── FILTERS ────────────────────────
  const filteredArticles = articles.filter(a => {
    if (search) {
      const q = search.toLowerCase();
      if (!a.title?.toLowerCase().includes(q) &&
          !a.content?.toLowerCase().includes(q) &&
          !ensureArray(a.tags).some(t => t.toLowerCase().includes(q)) &&
          !a.problem?.toLowerCase().includes(q) &&
          !a.solution?.toLowerCase().includes(q)) return false;
    }
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    if (filterDifficulty !== 'all' && a.difficulty !== filterDifficulty) return false;
    return true;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'popular': return (b.views || 0) - (a.views || 0);
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      default: return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // ── STATS ──────────────────────────
  const totalArticles = articles.length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const avgRating = articles.filter(a => a.ratingCount > 0).length > 0
    ? Math.round(articles.filter(a => a.ratingCount > 0).reduce((sum, a) => sum + a.rating, 0) / articles.filter(a => a.ratingCount > 0).length)
    : 0;
  const categoryCounts = KB_CATEGORIES.map(c => ({
    ...c,
    count: articles.filter(a => a.category === c.value).length,
  })).sort((a, b) => b.count - a.count);

  if (selectedArticle) {
    return (
      <div className="page-content">
        <ArticleViewer
          article={selectedArticle}
          onBack={() => setSelectedArticle(null)}
          onRate={rateArticle}
          onEdit={() => { setEditingArticle(selectedArticle); setShowForm(true); setSelectedArticle(null); }}
          onDelete={() => { deleteArticle(selectedArticle.id); }}
        />
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">📚 Bilgi Bankası</h1>
          <p className="page-subtitle">Teknik çözümler, prosedürler ve rehberler</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingArticle(null); setShowForm(true); }}>
          + Makale Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="kb-stats">
        <div className="kb-stat-card">
          <div className="kb-stat-value">{totalArticles}</div>
          <div className="kb-stat-label">Toplam Makale</div>
        </div>
        <div className="kb-stat-card">
          <div className="kb-stat-value">{totalViews}</div>
          <div className="kb-stat-label">Toplam Görüntülenme</div>
        </div>
        <div className="kb-stat-card">
          <div className="kb-stat-value">%{avgRating}</div>
          <div className="kb-stat-label">Ort. Faydalılık</div>
        </div>
        <div className="kb-stat-card">
          <div className="kb-stat-value">{categoryCounts[0]?.count || 0}</div>
          <div className="kb-stat-label">En Çok: {categoryCounts[0]?.label || '-'}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="kb-search-bar">
        <div className="kb-search-icon">🔍</div>
        <input
          type="text" className="kb-search-input"
          placeholder="Sorun, çözüm, anahtar kelime ara..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="kb-filters">
        <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">Tüm Kategoriler</option>
          {KB_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
        </select>
        <select className="filter-select" value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
          <option value="all">Tüm Zorluklar</option>
          {DIFFICULTY_LEVELS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">En Yeni</option>
          <option value="popular">En Çok Görüntülenen</option>
          <option value="rating">En Faydalı</option>
        </select>
      </div>

      {/* Category quick filters */}
      <div className="kb-category-pills">
        {categoryCounts.filter(c => c.count > 0).map(c => (
          <button
            key={c.value}
            className={`kb-pill ${filterCategory === c.value ? 'active' : ''}`}
            onClick={() => setFilterCategory(filterCategory === c.value ? 'all' : c.value)}>
            {c.icon} {c.label} ({c.count})
          </button>
        ))}
      </div>

      {/* Articles */}
      {sortedArticles.length === 0 ? (
        <div className="empty-state"><p>Arama kriterlerine uygun makale bulunamadı.</p></div>
      ) : (
        <div className="kb-articles">
          {sortedArticles.map(article => {
            const cat = KB_CATEGORIES.find(c => c.value === article.category);
            const diff = DIFFICULTY_LEVELS.find(d => d.value === article.difficulty);
            return (
              <div key={article.id} className="kb-article-card" onClick={() => viewArticle(article)}>
                <div className="kb-article-header">
                  <span className="kb-cat-badge">{cat?.icon} {cat?.label}</span>
                  {diff && <span className="kb-diff-badge" style={{ color: diff.color }}>{diff.label}</span>}
                </div>
                <h3 className="kb-article-title">{article.title}</h3>
                <p className="kb-article-preview">{article.problem?.substring(0, 120)}...</p>
                <div className="kb-article-tags">
                  {ensureArray(article.tags).slice(0, 4).map((tag, i) => (
                    <span key={i} className="kb-tag">{tag}</span>
                  ))}
                </div>
                <div className="kb-article-meta">
                  <span>👁️ {article.views || 0}</span>
                  {article.ratingCount > 0 && <span>👍 %{article.rating}</span>}
                  <span>📅 {new Date(article.createdAt).toLocaleDateString('tr-TR')}</span>
                  <span>✍️ {article.createdBy}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ArticleFormModal
          article={editingArticle}
          onSave={editingArticle ? updateArticle : addArticle}
          onClose={() => { setShowForm(false); setEditingArticle(null); }}
        />
      )}
    </div>
  );
}

// ── Article Viewer ─────────────────
function ArticleViewer({ article, onBack, onRate, onEdit, onDelete }) {
  const cat = KB_CATEGORIES.find(c => c.value === article.category);
  const diff = DIFFICULTY_LEVELS.find(d => d.value === article.difficulty);

  return (
    <div className="kb-viewer">
      <div className="kb-viewer-nav">
        <button className="btn btn-ghost" onClick={onBack}>← Geri</button>
        <div className="kb-viewer-actions">
          <button className="btn btn-ghost" onClick={onEdit}>✏️ Düzenle</button>
          <button className="btn btn-ghost" onClick={onDelete} style={{ color: '#ef4444' }}>🗑️ Sil</button>
        </div>
      </div>

      <div className="kb-viewer-header">
        <div className="kb-viewer-badges">
          <span className="kb-cat-badge">{cat?.icon} {cat?.label}</span>
          {diff && <span className="kb-diff-badge" style={{ color: diff.color, border: `1px solid ${diff.color}33` }}>{diff.label}</span>}
          <span className="kb-meta-badge">👁️ {article.views || 0} görüntülenme</span>
          {article.ratingCount > 0 && <span className="kb-meta-badge">👍 %{article.rating} faydalı</span>}
        </div>
        <h1 className="kb-viewer-title">{article.title}</h1>
        <div className="kb-viewer-meta">
          ✍️ {article.createdBy} | 📅 {new Date(article.createdAt).toLocaleDateString('tr-TR')}
          {article.updatedAt !== article.createdAt && ` | Güncellendi: ${new Date(article.updatedAt).toLocaleDateString('tr-TR')}`}
        </div>
      </div>

      <div className="kb-viewer-section">
        <h2>🔴 Problem</h2>
        <div className="kb-viewer-content">{article.problem}</div>
      </div>

      <div className="kb-viewer-section">
        <h2>✅ Çözüm</h2>
        <div className="kb-viewer-content kb-solution">
          {article.solution?.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>

      {article.steps && (
        <div className="kb-viewer-section">
          <h2>📝 Adımlar</h2>
          <div className="kb-viewer-content">
            <ol className="kb-steps">
              {article.steps.split('\n').filter(Boolean).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {article.notes && (
        <div className="kb-viewer-section">
          <h2>💡 Notlar</h2>
          <div className="kb-viewer-content kb-notes">{article.notes}</div>
        </div>
      )}

      {ensureArray(article.tags).length > 0 && (
        <div className="kb-viewer-tags">
          {ensureArray(article.tags).map((tag, i) => <span key={i} className="kb-tag">{tag}</span>)}
        </div>
      )}

      <div className="kb-feedback">
        <p>Bu makale faydalı oldu mu?</p>
        <div className="kb-feedback-buttons">
          <button className="btn btn-success" onClick={() => onRate(article.id, true)}>👍 Evet, Faydalı</button>
          <button className="btn btn-ghost" onClick={() => onRate(article.id, false)}>👎 Hayır</button>
        </div>
      </div>
    </div>
  );
}

// ── Article Form Modal ─────────────
function ArticleFormModal({ article, onSave, onClose }) {
  const [form, setForm] = useState({
    title: article?.title || '',
    category: article?.category || 'software',
    difficulty: article?.difficulty || 'easy',
    problem: article?.problem || '',
    solution: article?.solution || '',
    steps: article?.steps || '',
    notes: article?.notes || '',
    tags: article?.tags?.join(', ') || '',
  });
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal kb-modal">
        <div className="modal-header">
          <h2>{article ? 'Makale Düzenle' : 'Yeni Makale'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Başlık *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="ör: Windows 11'de Yazıcı Paylaşım Sorunu" />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Kategori</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {KB_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Zorluk</label>
              <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                {DIFFICULTY_LEVELS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Problem Tanımı *</label>
            <textarea value={form.problem} onChange={e => set('problem', e.target.value)} rows="3"
              placeholder="Sorunun ne olduğunu açıklayın..." />
          </div>
          <div className="form-group">
            <label>Çözüm *</label>
            <textarea value={form.solution} onChange={e => set('solution', e.target.value)} rows="5"
              placeholder="Çözüm yöntemini detaylı açıklayın..." />
          </div>
          <div className="form-group">
            <label>Adımlar (her satır bir adım)</label>
            <textarea value={form.steps} onChange={e => set('steps', e.target.value)} rows="4"
              placeholder="1. İlk adım&#10;2. İkinci adım&#10;3. Üçüncü adım" />
          </div>
          <div className="form-group">
            <label>Ek Notlar</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows="2"
              placeholder="Dikkat edilmesi gereken noktalar, alternatif çözümler..." />
          </div>
          <div className="form-group">
            <label>Etiketler (virgülle ayırın)</label>
            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder="ör: windows, yazıcı, ağ, vpn" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>İptal</button>
          <button className="btn btn-primary"
            onClick={() => form.title.trim() && form.problem.trim() && form.solution.trim() && onSave(form)}
            disabled={!form.title.trim() || !form.problem.trim() || !form.solution.trim()}>
            {article ? 'Güncelle' : 'Yayınla'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sample Articles ────────────────
function getSampleArticles() {
  return [
    {
      id: 1,
      title: 'Windows 11 Ağ Yazıcısı Bulunamıyor Sorunu',
      category: 'printer',
      difficulty: 'medium',
      problem: 'Windows 11 güncellemesi sonrası ağ üzerindeki paylaşımlı yazıcıya bağlanılamıyor. "Windows, yazıcıya bağlanamıyor" hatası alınıyor.',
      solution: 'Windows 11 KB5005565 güncellemesi ile gelen güvenlik değişikliği nedeniyle SMBv1 protokolü devre dışı bırakılmıştır. Bu sorunu çözmek için yazıcı sunucusunda yeni bir port oluşturulması veya İnternet Yazdırma (IPP) özelliğinin etkinleştirilmesi gerekmektedir.',
      steps: 'Denetim Masası > Programlar > Windows özelliklerini aç kapat yolunu izleyin\n"İnternet Yazdırma İstemcisi" seçeneğini işaretleyin\nBilgisayarı yeniden başlatın\nYazıcıyı IP adresi üzerinden http://[ip]:631/ipp/print şeklinde ekleyin\nTest sayfası yazdırarak doğrulayın',
      notes: 'Bu çözüm Windows 10 21H2 ve üzeri için de geçerlidir. Sorun devam ederse Print Spooler servisini yeniden başlatmayı deneyin.',
      tags: ['windows 11', 'yazıcı', 'ağ', 'smb', 'yazdırma'],
      views: 45,
      rating: 87,
      ratingCount: 15,
      helpful: 13,
      createdAt: '2025-12-15T10:00:00Z',
      createdBy: 'Admin',
      updatedAt: '2025-12-15T10:00:00Z',
    },
    {
      id: 2,
      title: 'VPN Bağlantı Kopma Sorunu Çözümü',
      category: 'network',
      difficulty: 'hard',
      problem: 'Kullanıcılar VPN bağlantısının 5-10 dakika sonra düzenli olarak koptuğunu bildiriyor. Yeniden bağlanma genellikle başarılı oluyor ama veri kaybına neden oluyor.',
      solution: 'Sorunun temel nedeni ağ adaptörünün güç yönetimi ayarlarıdır. Windows, güç tasarrufu için ağ adaptörünü uyku moduna alıyor ve bu VPN tünelini koparıyor.\n\nAyrıca MTU boyutu optimize edilmeli ve keep-alive süreleri artırılmalıdır.',
      steps: 'Aygıt Yöneticisi > Ağ Bağdaştırıcıları > Kullanılan adaptöre sağ tık > Özellikler\nGüç Yönetimi sekmesinde "Güç tasarrufu için bu aygıtı kapat" seçeneğini kaldırın\nKomut İstemi (Yönetici): netsh interface ipv4 set subinterface "Ethernet" mtu=1400 store=persistent\nVPN istemcisi ayarlarında Keep-Alive süresini 30 saniyeye düşürün\nBağlantıyı test edin',
      notes: 'Kurumsal firewall kurallarının VPN trafiğini engellemediğinden emin olun. Fortinet/Sophos gibi UTM cihazlarında IPS modülü bazen VPN paketlerini yanlışlıkla engelleyebilir.',
      tags: ['vpn', 'ağ', 'bağlantı', 'kopma', 'mtu'],
      views: 32,
      rating: 92,
      ratingCount: 12,
      helpful: 11,
      createdAt: '2025-11-20T14:00:00Z',
      createdBy: 'Admin',
      updatedAt: '2025-11-20T14:00:00Z',
    },
    {
      id: 3,
      title: 'Outlook E-posta Gönderememe Hatası (0x800CCC13)',
      category: 'email',
      difficulty: 'easy',
      problem: 'Outlook\'ta e-posta gönderirken "0x800CCC13 - Ağ bağlantısı kesildi" hatası alınıyor. E-posta alma sorunsuz çalışıyor.',
      solution: 'Bu hata genellikle antivirüs programının SMTP trafiğini engellemesinden kaynaklanır. Antivirüs programının e-posta tarama özelliğini devre dışı bırakmak veya SMTP portunu değiştirmek sorunu çözer.',
      steps: 'Antivirüs programında e-posta tarama/e-posta koruma özelliğini geçici olarak devre dışı bırakın\nOutlook\'u yeniden başlatarak test edin\nSorun çözüldüyse antivirüs ayarlarında SMTP portunu (587) istisna listesine ekleyin\nGönderme/Alma ayarlarında SMTP portunu 587 ve şifreleme türünü STARTTLS olarak ayarlayın',
      notes: 'Kaspersky, ESET ve Avast bu soruna en çok neden olan antivirüs yazılımlarıdır. Windows Defender genellikle bu sorunu oluşturmaz.',
      tags: ['outlook', 'email', 'smtp', 'hata', 'antivirüs'],
      views: 28,
      rating: 78,
      ratingCount: 9,
      helpful: 7,
      createdAt: '2026-01-05T09:00:00Z',
      createdBy: 'Admin',
      updatedAt: '2026-01-05T09:00:00Z',
    },
    {
      id: 4,
      title: 'Yeni Müşteri Kurulum Prosedürü',
      category: 'procedure',
      difficulty: 'medium',
      problem: 'Yeni müşteri sisteme dahil edilirken yapılması gereken adımlar ve kontrol listesi.',
      solution: 'Aşağıdaki adımların sırasıyla tamamlanması gerekmektedir. Her adım tamamlandığında ilgili checklist\'te işaretlenmelidir.',
      steps: 'Müşteri bilgilerini CRM sistemine girin (firma adı, adres, yetkili kişi, telefon, e-posta)\nSLA seviyesini belirleyin ve sözleşmeyi oluşturun\nMüşteri ağını keşfet: IP aralığı, sunucular, switch/router bilgilerini kaydedin\nUzak erişim araçlarını kurun (AnyDesk/TeamViewer) ve bilgileri kaydedin\nAntivirüs lisanslarını aktive edin\nYedekleme planını oluşturun ve test edin\nMüşteriye kullanım eğitimi verin\nAcil durum iletişim bilgilerini paylaşın',
      notes: 'İlk 30 gün içinde haftalık kontrol yapılmalıdır. SLA şartları müşteriye yazılı olarak bildirilmelidir.',
      tags: ['prosedür', 'yeni müşteri', 'kurulum', 'onboarding'],
      views: 56,
      rating: 95,
      ratingCount: 20,
      helpful: 19,
      createdAt: '2025-10-10T08:00:00Z',
      createdBy: 'Admin',
      updatedAt: '2025-10-10T08:00:00Z',
    },
  ];
}

export default KnowledgeBasePage;
