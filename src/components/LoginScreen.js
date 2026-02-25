import React, { useState } from 'react';
import './LoginScreen.css';
import { useAuth, DEMO_USERS, ROLE_PERMISSIONS } from '../context/AuthContext';
import { useI18n } from '../context/i18nContext';
import { useAudit } from '../context/AuditContext';

function LoginScreen() {
  const { login } = useAuth();
  const { t, lang, setLanguage } = useI18n();
  const { addAuditEntry } = useAudit();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 400));

    const result = login(username, password);
    if (result.success) {
      addAuditEntry(result.user, 'LOGIN', 'auth', result.user.id, `${result.user.name} giriş yaptı`);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const quickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password);
  };

  return (
    <div className="login-screen">
      {/* Lang toggle */}
      <div className="login-lang">
        <button
          className={`login-lang-btn ${lang === 'tr' ? 'active' : ''}`}
          onClick={() => setLanguage('tr')}
        >TR</button>
        <button
          className={`login-lang-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >EN</button>
      </div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div className="login-logo-text">
            <span className="login-app-name">{t('app.name')}</span>
            <span className="login-app-sub">v1.2.0</span>
          </div>
        </div>

        <h1 className="login-title">{t('auth.login')}</h1>

        {error && (
          <div className="login-error">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
              <path d="M8 2L14 13H2L8 2Z"/><path d="M8 6v4M8 11.5v.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">{t('auth.username')}</label>
            <input
              className="login-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin / yonetici / teknisyen"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label className="login-label">{t('auth.password')}</label>
            <div className="login-input-wrap">
              <input
                className="login-input"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPwd(v => !v)}
                tabIndex={-1}
              >
                {showPwd ? (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                    <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/><circle cx="8" cy="8" r="1.5"/>
                    <path d="M2 2l12 12" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                    <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/><circle cx="8" cy="8" r="1.5"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading || !username || !password}
          >
            {loading ? (
              <svg className="login-spinner" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M8 2a6 6 0 00-6 6" strokeLinecap="round"/>
              </svg>
            ) : t('auth.loginBtn')}
          </button>
        </form>

        {/* Demo hesaplar */}
        <div className="login-demo">
          <div className="login-demo-title">{t('auth.demoAccounts')}</div>
          <div className="login-demo-cards">
            {DEMO_USERS.map(user => (
              <button
                key={user.id}
                className="login-demo-card"
                type="button"
                onClick={() => quickLogin(user)}
              >
                <div className="login-demo-avatar">{user.avatar}</div>
                <div className="login-demo-info">
                  <div className="login-demo-name">{user.name}</div>
                  <div className="login-demo-role">
                    {ROLE_PERMISSIONS[user.role].label} · {user.username}
                  </div>
                  <div className="login-demo-pages">
                    {ROLE_PERMISSIONS[user.role].pages.length} sayfa erişimi
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
