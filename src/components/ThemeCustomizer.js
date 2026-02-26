import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ThemeCustomizer.css';

const ACCENT_PRESETS = [
  { name: 'Mavi',    hex: '#4f7fff' },
  { name: 'Mor',     hex: '#a855f7' },
  { name: 'Yeşil',   hex: '#34c16a' },
  { name: 'Turuncu', hex: '#f0a332' },
  { name: 'Pembe',   hex: '#ec4899' },
  { name: 'Teal',    hex: '#14b8a6' },
  { name: 'Kırmızı', hex: '#ef4444' },
  { name: 'Amber',   hex: '#eab308' },
  { name: 'Indigo',  hex: '#6366f1' },
  { name: 'Cyan',    hex: '#06b6d4' },
];

const FONT_SIZES = [
  { label: 'Küçük',     value: 12,   key: 'small' },
  { label: 'Varsayılan', value: 13.5, key: 'default' },
  { label: 'Büyük',     value: 15,   key: 'large' },
  { label: 'Çok Büyük', value: 17,   key: 'xlarge' },
];

const DENSITY_MODES = [
  { label: 'Kompakt',  key: 'compact',     icon: 'compact' },
  { label: 'Normal',   key: 'comfortable', icon: 'comfortable' },
  { label: 'Geniş',    key: 'spacious',    icon: 'spacious' },
];

const RADIUS_OPTIONS = [
  { label: 'Keskin',   value: 0,  key: 'sharp' },
  { label: 'Hafif',    value: 6,  key: 'subtle' },
  { label: 'Yuvarlak', value: 12, key: 'rounded' },
  { label: 'Tam',      value: 20, key: 'pill' },
];

const DEFAULT_SETTINGS = {
  accentColor: '#4f7fff',
  fontSize: 'default',
  density: 'comfortable',
  radius: 'rounded',
  animations: true,
  glassEffect: false,
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 79, g: 127, b: 255 };
}

function lightenHex(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.min(255, r + amount);
  const lg = Math.min(255, g + amount);
  const lb = Math.min(255, b + amount);
  return `#${lr.toString(16).padStart(2,'0')}${lg.toString(16).padStart(2,'0')}${lb.toString(16).padStart(2,'0')}`;
}

function ThemeCustomizer({ darkMode }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('color');
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('themeSettings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('themeProfiles');
    return saved ? JSON.parse(saved) : [];
  });
  const [profileName, setProfileName] = useState('');
  const [customColor, setCustomColor] = useState(settings.accentColor);
  const panelRef = useRef(null);

  // Apply theme settings to CSS variables
  const applyTheme = useCallback((s) => {
    const root = document.documentElement;
    const { r, g, b } = hexToRgb(s.accentColor);

    // Accent colors
    root.style.setProperty('--accent', s.accentColor);
    root.style.setProperty('--accent-hover', lightenHex(s.accentColor, 30));
    root.style.setProperty('--accent-dim', `rgba(${r},${g},${b},0.10)`);
    root.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.18)`);
    root.style.setProperty('--accent-border', `rgba(${r},${g},${b},0.24)`);
    root.style.setProperty('--primary', s.accentColor);
    root.style.setProperty('--primary-dim', `rgba(${r},${g},${b},0.10)`);
    root.style.setProperty('--info', s.accentColor);
    root.style.setProperty('--info-dim', `rgba(${r},${g},${b},0.08)`);
    root.style.setProperty('--shadow-accent', `0 2px 16px rgba(${r},${g},${b},0.18)`);

    // Font size
    const fontSize = FONT_SIZES.find(f => f.key === s.fontSize)?.value || 13.5;
    root.style.setProperty('--font-size-base', `${fontSize}px`);
    document.body.style.fontSize = `${fontSize}px`;

    // Density
    const densityMap = {
      compact:     { pagePad: '16px 20px 24px', cardPad: '14px', gap: '8px',  headerMb: '16px' },
      comfortable: { pagePad: '28px 32px 40px', cardPad: '20px', gap: '16px', headerMb: '28px' },
      spacious:    { pagePad: '40px 48px 56px', cardPad: '28px', gap: '24px', headerMb: '36px' },
    };
    const d = densityMap[s.density] || densityMap.comfortable;
    root.style.setProperty('--page-padding', d.pagePad);
    root.style.setProperty('--card-padding', d.cardPad);
    root.style.setProperty('--content-gap', d.gap);
    root.style.setProperty('--header-margin', d.headerMb);

    // Border radius
    const radiusBase = RADIUS_OPTIONS.find(r => r.key === s.radius)?.value ?? 12;
    root.style.setProperty('--radius-xs', `${Math.max(0, radiusBase - 8)}px`);
    root.style.setProperty('--radius-sm', `${Math.max(0, radiusBase - 6)}px`);
    root.style.setProperty('--radius-md', `${Math.max(0, radiusBase - 4)}px`);
    root.style.setProperty('--radius-lg', `${radiusBase}px`);
    root.style.setProperty('--radius-xl', `${radiusBase + 4}px`);

    // Animations
    if (!s.animations) {
      root.style.setProperty('--transition-speed', '0s');
      root.classList.add('no-animations');
    } else {
      root.style.removeProperty('--transition-speed');
      root.classList.remove('no-animations');
    }

    // Glass effect
    if (s.glassEffect) {
      root.classList.add('glass-mode');
    } else {
      root.classList.remove('glass-mode');
    }
  }, []);

  // Save and apply on change
  useEffect(() => {
    applyTheme(settings);
    localStorage.setItem('themeSettings', JSON.stringify(settings));
  }, [settings, applyTheme]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          !e.target.closest('.theme-fab')) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Profile management
  const saveProfile = () => {
    if (!profileName.trim()) return;
    const profile = { name: profileName.trim(), settings: { ...settings }, id: Date.now() };
    const updated = [...profiles, profile];
    setProfiles(updated);
    localStorage.setItem('themeProfiles', JSON.stringify(updated));
    setProfileName('');
  };

  const loadProfile = (profile) => {
    setSettings({ ...DEFAULT_SETTINGS, ...profile.settings });
    setCustomColor(profile.settings.accentColor || DEFAULT_SETTINGS.accentColor);
  };

  const deleteProfile = (id) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    localStorage.setItem('themeProfiles', JSON.stringify(updated));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setCustomColor(DEFAULT_SETTINGS.accentColor);
  };

  const sections = [
    { key: 'color', label: 'Renkler', icon: 'palette' },
    { key: 'typography', label: 'Yazı', icon: 'type' },
    { key: 'layout', label: 'Düzen', icon: 'layout' },
    { key: 'effects', label: 'Efektler', icon: 'sparkle' },
    { key: 'profiles', label: 'Profiller', icon: 'save' },
  ];

  return (
    <>
      {/* FAB Button */}
      <button
        className={`theme-fab ${open ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
        title="Tema Özelleştir"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div className={`theme-panel ${darkMode ? 'dark' : 'light'}`} ref={panelRef}>
          <div className="theme-panel-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.17-.6-1.61-.36-.43-.58-.98-.58-1.59 0-1.38 1.12-2.5 2.5-2.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9Z"/>
                <circle cx="7.5" cy="11.5" r="1.5" /><circle cx="10.5" cy="7.5" r="1.5" /><circle cx="16.5" cy="9.5" r="1.5" />
              </svg>
              Tema Özelleştirici
            </h3>
            <button className="theme-panel-close" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Section Tabs */}
          <div className="theme-tabs">
            {sections.map(s => (
              <button
                key={s.key}
                className={`theme-tab ${activeSection === s.key ? 'active' : ''}`}
                onClick={() => setActiveSection(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="theme-panel-body">
            {/* ─── COLORS ─── */}
            {activeSection === 'color' && (
              <div className="theme-section">
                <label className="theme-label">Accent Renk</label>
                <div className="color-swatches">
                  {ACCENT_PRESETS.map(c => (
                    <button
                      key={c.hex}
                      className={`color-swatch ${settings.accentColor === c.hex ? 'active' : ''}`}
                      style={{ '--swatch-color': c.hex }}
                      onClick={() => { updateSetting('accentColor', c.hex); setCustomColor(c.hex); }}
                      title={c.name}
                    >
                      {settings.accentColor === c.hex && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="14" height="14">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <div className="custom-color-row">
                  <label className="theme-sublabel">Özel Renk</label>
                  <div className="custom-color-input">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        updateSetting('accentColor', e.target.value);
                      }}
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCustomColor(v);
                        if (/^#[0-9A-Fa-f]{6}$/.test(v)) updateSetting('accentColor', v);
                      }}
                      placeholder="#4f7fff"
                      maxLength={7}
                    />
                  </div>
                </div>
                {/* Live preview */}
                <div className="color-preview">
                  <div className="preview-btn" style={{ background: settings.accentColor, color: '#fff' }}>
                    Önizleme Butonu
                  </div>
                  <div className="preview-badge" style={{ background: `${settings.accentColor}18`, color: settings.accentColor, border: `1px solid ${settings.accentColor}30` }}>
                    Etiket
                  </div>
                </div>
              </div>
            )}

            {/* ─── TYPOGRAPHY ─── */}
            {activeSection === 'typography' && (
              <div className="theme-section">
                <label className="theme-label">Yazı Boyutu</label>
                <div className="font-size-options">
                  {FONT_SIZES.map(f => (
                    <button
                      key={f.key}
                      className={`font-size-btn ${settings.fontSize === f.key ? 'active' : ''}`}
                      onClick={() => updateSetting('fontSize', f.key)}
                    >
                      <span className="font-size-preview" style={{ fontSize: `${f.value}px` }}>Aa</span>
                      <span className="font-size-label">{f.label}</span>
                      <span className="font-size-value">{f.value}px</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── LAYOUT ─── */}
            {activeSection === 'layout' && (
              <div className="theme-section">
                <label className="theme-label">Yoğunluk Modu</label>
                <div className="density-options">
                  {DENSITY_MODES.map(d => (
                    <button
                      key={d.key}
                      className={`density-btn ${settings.density === d.key ? 'active' : ''}`}
                      onClick={() => updateSetting('density', d.key)}
                    >
                      <div className={`density-icon density-${d.icon}`}>
                        <span /><span /><span />
                      </div>
                      <span>{d.label}</span>
                    </button>
                  ))}
                </div>

                <label className="theme-label" style={{ marginTop: 16 }}>Köşe Yuvarlaklığı</label>
                <div className="radius-options">
                  {RADIUS_OPTIONS.map(r => (
                    <button
                      key={r.key}
                      className={`radius-btn ${settings.radius === r.key ? 'active' : ''}`}
                      onClick={() => updateSetting('radius', r.key)}
                    >
                      <div className="radius-preview" style={{ borderRadius: `${r.value}px` }} />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── EFFECTS ─── */}
            {activeSection === 'effects' && (
              <div className="theme-section">
                <div className="effect-toggle">
                  <div>
                    <label className="theme-label" style={{ marginBottom: 0 }}>Animasyonlar</label>
                    <p className="theme-desc">Sayfa geçişleri ve mikro-etkileşimler</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.animations}
                      onChange={(e) => updateSetting('animations', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="effect-toggle">
                  <div>
                    <label className="theme-label" style={{ marginBottom: 0 }}>Cam Efekti</label>
                    <p className="theme-desc">Bulanık arka plan efektleri</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.glassEffect}
                      onChange={(e) => updateSetting('glassEffect', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            )}

            {/* ─── PROFILES ─── */}
            {activeSection === 'profiles' && (
              <div className="theme-section">
                <label className="theme-label">Tema Profili Kaydet</label>
                <div className="profile-save-row">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Profil adı..."
                    onKeyDown={(e) => e.key === 'Enter' && saveProfile()}
                  />
                  <button onClick={saveProfile} disabled={!profileName.trim()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Kaydet
                  </button>
                </div>

                {profiles.length > 0 ? (
                  <div className="profile-list">
                    {profiles.map(p => (
                      <div key={p.id} className="profile-item">
                        <div className="profile-info">
                          <div
                            className="profile-color-dot"
                            style={{ background: p.settings.accentColor }}
                          />
                          <span className="profile-name">{p.name}</span>
                          <span className="profile-meta">
                            {FONT_SIZES.find(f => f.key === p.settings.fontSize)?.label} • {DENSITY_MODES.find(d => d.key === p.settings.density)?.label}
                          </span>
                        </div>
                        <div className="profile-actions">
                          <button onClick={() => loadProfile(p)} title="Yükle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 105.64-12.64L1 10"/>
                            </svg>
                          </button>
                          <button onClick={() => deleteProfile(p.id)} title="Sil" className="delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="profile-empty">Henüz kayıtlı profil yok</p>
                )}

                <button className="reset-btn" onClick={resetToDefaults}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 105.64-12.64L1 10"/>
                  </svg>
                  Varsayılana Sıfırla
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ThemeCustomizer;
