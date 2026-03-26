import React from 'react';

export default function SyncStatusBadge({ status }) {
  const queueSize = status?.queueSize || 0;
  const deadLetterSize = status?.deadLetterSize || 0;
  const hasQueue = queueSize > 0;
  const hasDead = deadLetterSize > 0;

  const color = hasDead ? '#b91c1c' : hasQueue ? '#b45309' : '#166534';
  const text = hasDead
    ? `Sync Sorunu: ${deadLetterSize}`
    : hasQueue
      ? `Kuyruk: ${queueSize}`
      : 'Sync OK';

  return (
    <div
      title="Offline queue and sync status"
      className="sync-status-badge"
      style={{
        borderColor: `${color}33`,
        color,
      }}
    >
      {text}
    </div>
  );
}
