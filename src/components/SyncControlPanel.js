import React from 'react';

export default function SyncControlPanel({
  status,
  deadLetters,
  onFlush,
  onRequeueDead,
  onClearDead,
}) {
  const queueSize = status?.queueSize || 0;
  const deadLetterSize = status?.deadLetterSize || 0;

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 58,
        zIndex: 1001,
        width: 320,
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        background: '#fff',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: 13 }}>
        Sync Kontrol Merkezi
      </div>

      <div style={{ padding: 12, display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span>Kuyruk</span>
          <strong>{queueSize}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span>Dead-letter</span>
          <strong>{deadLetterSize}</strong>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button style={btnStyle} onClick={onFlush}>Retry Now</button>
          <button style={btnStyle} onClick={onRequeueDead} disabled={deadLetterSize === 0}>Requeue Dead</button>
          <button style={dangerBtnStyle} onClick={onClearDead} disabled={deadLetterSize === 0}>Clear Dead</button>
        </div>
      </div>

      {deadLetterSize > 0 && (
        <div style={{ borderTop: '1px solid #e2e8f0', maxHeight: 160, overflowY: 'auto' }}>
          {deadLetters.slice(0, 5).map((item) => (
            <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 11 }}>
              <div style={{ fontWeight: 700 }}>{item.type}</div>
              <div style={{ color: '#64748b' }}>retries: {item.retries || 0}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  background: '#f8fafc',
  color: '#1e293b',
  padding: '6px 8px',
  fontSize: 11,
  cursor: 'pointer',
};

const dangerBtnStyle = {
  ...btnStyle,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#b91c1c',
};
