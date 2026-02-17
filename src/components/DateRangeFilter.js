import React, { useState } from 'react';
import './DateRangeFilter.css';

const CalIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1.5" y="2.5" width="13" height="12" rx="1.5"/>
    <path d="M5 1.5v2M11 1.5v2M1.5 6.5h13" strokeLinecap="round"/>
  </svg>
);

const ranges = [
  { label: 'Tümü',     days: null },
  { label: '7 Gün',   days: 7 },
  { label: '30 Gün',  days: 30 },
  { label: '90 Gün',  days: 90 },
];

function DateRangeFilter({ onFilterChange }) {
  const [active, setActive] = useState(null);

  const handleSelect = (days) => {
    setActive(days);
    if (!days) { onFilterChange(null); return; }
    const d = new Date();
    d.setDate(d.getDate() - days);
    onFilterChange(d);
  };

  return (
    <div className="date-range-filter">
      {ranges.map(r => (
        <button
          key={r.label}
          className={`date-range-btn ${active === r.days ? 'active' : ''}`}
          onClick={() => handleSelect(r.days)}
        >
          <CalIcon />
          {r.label}
        </button>
      ))}
    </div>
  );
}

export default DateRangeFilter;