import React from 'react';
import Icon from './Icon';
import './PageShell.css';

export default function PageShell({ title, subtitle, icon = 'grid', actions, children }) {
  return (
    <div className="page-shell">
      <header className="page-shell-header">
        <div className="page-shell-heading">
          <span className="page-shell-icon" aria-hidden="true">
            <Icon name={icon} size={18} />
          </span>
          <div>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </div>
        {actions ? <div className="page-shell-actions">{actions}</div> : null}
      </header>

      <div className="page-shell-content">{children}</div>
    </div>
  );
}
