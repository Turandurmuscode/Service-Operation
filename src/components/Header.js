import React from 'react';
import './Header.css';

const SunIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="3"/>
    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1 1M11.8 11.8l1 1M12.8 3.2l-1 1M4.2 11.8l-1 1" strokeLinecap="round"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 9.5A6 6 0 016.5 3a6 6 0 100 10A6 6 0 0013 9.5z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round"/>
  </svg>
);

function Header({ darkMode, toggleDarkMode, notifications, onMenuClick, searchComponent, performanceMonitor, quickNotes, breadcrumb }) {
  return (
    <>
      <header className="top-header">
        <div className="top-header-content">
          <button className="mobile-menu-btn" onClick={onMenuClick}>
            <MenuIcon />
          </button>

          {searchComponent && (
            <div className="header-search">
              {searchComponent}
            </div>
          )}

          <div className="header-actions">
            {quickNotes}
            {performanceMonitor}
            {notifications}

            <button onClick={toggleDarkMode} className="theme-toggle-btn" title={darkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}>
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      {breadcrumb && (
        <div className="breadcrumb-wrapper">
          {breadcrumb}
        </div>
      )}
    </>
  );
}

export default Header;