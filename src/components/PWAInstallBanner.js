import React, { useState, useEffect } from 'react';
import './PWAInstallBanner.css';

function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Zaten yüklü mü?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Kullanıcı daha önce kapattı mı?
    if (localStorage.getItem('pwa-dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="pwa-banner">
      <div className="pwa-banner-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2L2 7l10 5 10-5-10-5Z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div className="pwa-banner-content">
        <div className="pwa-banner-title">Uygulamayı Yükle</div>
        <div className="pwa-banner-sub">Ana ekrana ekle, offline çalışır</div>
      </div>
      <div className="pwa-banner-actions">
        <button className="pwa-install-btn" onClick={handleInstall}>Yükle</button>
        <button className="pwa-dismiss-btn" onClick={handleDismiss}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default PWAInstallBanner;