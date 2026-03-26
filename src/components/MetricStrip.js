import React from 'react';

export default function MetricStrip({ items = [] }) {
  return (
    <section className="metric-strip" aria-label="Özet metrikler">
      {items.map((item) => (
        <article key={item.label} className="metric-tile">
          <div className="metric-tile-label">{item.label}</div>
          <div className="metric-tile-value" style={item.valueColor ? { color: item.valueColor } : undefined}>
            {item.value}
          </div>
          {item.meta ? <div className="metric-tile-meta">{item.meta}</div> : null}
        </article>
      ))}
    </section>
  );
}
