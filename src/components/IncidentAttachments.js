import React, { useState, useRef, useCallback, useEffect } from 'react';

// ── Inline SVG Icons ───────────────────────────────────────────────────────
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const IconFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const STORAGE_KEY   = (id) => `incident_attachments_${id}`;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
const MAX_FILES     = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];

const isImage = (mime) => mime && mime.startsWith('image/');

// ── Component ──────────────────────────────────────────────────────────────
function IncidentAttachments({ incidentId, showToast }) {
  const [attachments, setAttachments] = useState([]);
  const [dragOver, setDragOver]       = useState(false);
  const [lightbox, setLightbox]       = useState(null);
  const [loading, setLoading]         = useState(false);
  const fileInputRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    if (!incidentId) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY(incidentId));
      setAttachments(saved ? JSON.parse(saved) : []);
    } catch {
      setAttachments([]);
    }
  }, [incidentId]);

  // Persist
  const persist = useCallback((list) => {
    try {
      localStorage.setItem(STORAGE_KEY(incidentId), JSON.stringify(list));
      setAttachments(list);
    } catch {
      showToast?.('Depolama alanı yetersiz. Küçük dosyalar deneyin.', 'error');
    }
  }, [incidentId, showToast]);

  // Read file as base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload  = (e) => resolve(e.target.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  // Process dropped / selected files
  const processFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);

    if (attachments.length + arr.length > MAX_FILES) {
      showToast?.(`En fazla ${MAX_FILES} dosya eklenebilir.`, 'error');
      return;
    }

    setLoading(true);
    const added = [];

    for (const file of arr) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        showToast?.(`${file.name}: Desteklenmeyen tür.`, 'error');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast?.(`${file.name}: Maksimum 4 MB.`, 'error');
        continue;
      }
      try {
        const data = await toBase64(file);
        added.push({
          id:      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name:    file.name,
          size:    file.size,
          type:    file.type,
          data,
          addedAt: new Date().toISOString(),
        });
      } catch {
        showToast?.(`${file.name}: Okunamadı.`, 'error');
      }
    }

    if (added.length) {
      persist([...attachments, ...added]);
      showToast?.(`${added.length} dosya eklendi.`, 'success');
    }

    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [attachments, persist, showToast]);

  // Drag handlers
  const onDragOver  = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = ()  => setDragOver(false);
  const onDrop      = (e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); };

  // Delete
  const handleDelete = (id) => {
    persist(attachments.filter(a => a.id !== id));
    showToast?.('Dosya silindi.', 'success');
  };

  // Download
  const handleDownload = (att) => {
    const a = document.createElement('a');
    a.href     = att.data;
    a.download = att.name;
    a.click();
  };

  // Escape to close lightbox
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setLightbox(null); };
    if (lightbox) window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [lightbox]);

  if (!incidentId) return null;

  const isEmpty = attachments.length === 0;

  return (
    <div>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex' }}><IconFile /></span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Ekler
          </span>
          {attachments.length > 0 && (
            <span style={{
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-border)',
              borderRadius: '4px',
              fontSize: '10.5px',
              fontWeight: '700',
              padding: '1px 6px',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {attachments.length}
            </span>
          )}
        </div>

        <button
          className="btn btn-secondary"
          style={{ fontSize: '12px', padding: '5px 10px' }}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || attachments.length >= MAX_FILES}
        >
          <IconUpload />
          {loading ? 'Yükleniyor...' : 'Dosya Ekle'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(',')}
        onChange={(e) => processFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      {/* Drop zone (full when empty, compact strip when files exist) */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        style={isEmpty
          ? {}
          : { padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', marginBottom: '10px' }
        }
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {isEmpty ? (
          <>
            <div className="drop-zone-icon"><IconUpload /></div>
            <p style={{ fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '3px' }}>
              Dosyaları sürükle bırak veya tıkla
            </p>
            <p>PNG, JPG, GIF, PDF, TXT &nbsp;·&nbsp; Maks. 4 MB &nbsp;·&nbsp; En fazla {MAX_FILES} dosya</p>
          </>
        ) : (
          <>
            <span style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex' }}><IconUpload /></span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {loading ? 'Yükleniyor...' : 'Daha fazla dosya eklemek için sürükle veya tıkla'}
            </span>
          </>
        )}
      </div>

      {/* File list */}
      {attachments.length > 0 && (
        <>
          <div className="attachment-list">
            {attachments.map((att) => (
              <div key={att.id} className="attachment-item">
                {/* Preview or icon */}
                {isImage(att.type) ? (
                  <img
                    src={att.data}
                    alt={att.name}
                    className="attachment-thumb"
                    onClick={() => setLightbox({ src: att.data, name: att.name })}
                    title="Büyütmek için tıkla"
                  />
                ) : (
                  <div className="attachment-file-icon">
                    <IconFile />
                  </div>
                )}

                {/* Meta */}
                <div className="attachment-info">
                  <div className="attachment-name" title={att.name}>{att.name}</div>
                  <div className="attachment-meta">
                    <span>{formatBytes(att.size)}</span>
                    <span>·</span>
                    <span>
                      {new Date(att.addedAt).toLocaleDateString('tr-TR', {
                        day: '2-digit', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {isImage(att.type) && (
                      <>
                        <span>·</span>
                        <span
                          style={{ color: 'var(--accent)', cursor: 'pointer' }}
                          onClick={() => setLightbox({ src: att.data, name: att.name })}
                        >
                          önizleme
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="attachment-actions">
                  <button
                    className="btn btn-ghost btn-icon"
                    title="İndir"
                    onClick={() => handleDownload(att)}
                  >
                    <IconDownload />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    title="Sil"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => handleDelete(att.id)}
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
            {attachments.length} / {MAX_FILES} dosya
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>
            <IconX />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.name}
            onClick={(e) => e.stopPropagation()}
          />
          <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '12.5px',
            maxWidth: '80vw',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {lightbox.name}
          </div>
        </div>
      )}
    </div>
  );
}

export default IncidentAttachments;