import React from 'react';

// Simple icon component that renders minimal, neutral SVGs using currentColor.
// Usage: <Icon name="search" size={18} className="..." />
export default function Icon({ name, size = 18, className = '', title }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', className };

  switch (name) {
    case 'search':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M12 17.3L7.24 20l1.12-5.18L4 11.47l5.4-.47L12 6l2.6 4v0l5.4.47-4.36 3.35L16.76 20z" fill="currentColor" />
        </svg>
      );
    case 'star-outline':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M12 17.3L7.24 20l1.12-5.18L4 11.47l5.4-.47L12 6l2.6 4v0l5.4.47-4.36 3.35L16.76 20z" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
      );
    case 'edit':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor" />
          <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M9 3h6l1 2h4v2H4V5h4l1-2z" fill="currentColor" />
          <path d="M6 7h12l-1 13H7L6 7z" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M12 2c-1.1 0-2 .9-2 2 0 .6.3 1.2.8 1.6L12 10l1.2-4.4c.5-.4.8-1 .8-1.6 0-1.1-.9-2-2-2z" fill="currentColor" />
          <path d="M7 13c0 2.8 3.1 5 5 7 1.9-1.9 5-4.2 5-7 0-3-3-5-6-5s-4 2-4 5z" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l1.9-1.9a1 1 0 0 1 1-.2c1.1.4 2.3.6 3.5.6a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.1 22 2 13.9 2 3a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1c0 1.2.2 2.4.6 3.5.2.4 0 .9-.2 1L6.6 10.8z" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
          <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'clipboard':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <rect x="7" y="3" width="10" height="4" rx="1" fill="currentColor" />
          <rect x="5" y="7" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1" fill="none" />
          <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1" fill="none" />
          <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1" fill="none" />
          <rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      );
    case 'list':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'save':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M5 21h14v-8H5v8zM7 3h10v6H7V3z" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M15 17H9a3 3 0 0 0 6 0z" fill="currentColor" />
          <path d="M18 13v-3a6 6 0 1 0-12 0v3l-2 2v1h18v-1l-2-2z" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M12 3l9 16H3L12 3z" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M12 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
        </svg>
      );
      case 'user':
        return (
          <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
            {title ? <title>{title}</title> : null}
            <circle cx="12" cy="8" r="3" fill="currentColor" />
            <path d="M5 20c1.5-4 5-6 7-6s5.5 2 7 6" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
        );
      case 'tool':
        return (
          <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
            {title ? <title>{title}</title> : null}
            <path d="M21 7l-4-4-7 7 4 4 7-7z" fill="currentColor" />
            <path d="M3 21l6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        );
      case 'download':
        return (
          <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
            {title ? <title>{title}</title> : null}
            <path d="M12 3v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="4" y="17" width="16" height="3" rx="1" fill="currentColor" />
          </svg>
        );
      case 'chart':
        return (
          <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
            {title ? <title>{title}</title> : null}
            <rect x="3" y="10" width="3" height="7" fill="currentColor" />
            <rect x="9" y="6" width="3" height="11" fill="currentColor" />
            <rect x="15" y="3" width="3" height="14" fill="currentColor" />
          </svg>
        );
      case 'laptop':
        return (
          <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
            {title ? <title>{title}</title> : null}
            <rect x="3" y="4" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M2 18h20" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        );
      case 'desktop':
        return (
          <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
            {title ? <title>{title}</title> : null}
            <rect x="3" y="3" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
            <rect x="8" y="16" width="8" height="2" fill="currentColor" />
          </svg>
        );
      case 'network':
        return (
          <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
            {title ? <title>{title}</title> : null}
            <circle cx="6" cy="8" r="2" fill="currentColor" />
            <circle cx="18" cy="8" r="2" fill="currentColor" />
            <path d="M8 8h8M12 10v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        );
      case 'box':
        return (
          <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
            {title ? <title>{title}</title> : null}
            <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M12 14v6" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        );
      case 'clock':
        return (
          <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
            {title ? <title>{title}</title> : null}
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        );
    case 'bolt':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="currentColor" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common} aria-hidden={!title} role={title ? 'img' : 'presentation'}>
          {title ? <title>{title}</title> : null}
          <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
