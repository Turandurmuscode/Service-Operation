import React, { useState, useEffect, useCallback, useRef } from 'react';
import './DocumentsPage.css';

// ── SVG İkon Bileşenleri ───────────────────────────────────────
const SvgIcon = ({ children, size = 18, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round"
    width={size} height={size} className={`docs-svg-icon ${className}`} {...props}>
    {children}
  </svg>
);

const Icons = {
  file: (s = 18) => <SvgIcon size={s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></SvgIcon>,
  folder: (s = 18) => <SvgIcon size={s}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></SvgIcon>,
  folderPlus: (s = 18) => <SvgIcon size={s}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></SvgIcon>,
  upload: (s = 18) => <SvgIcon size={s}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></SvgIcon>,
  download: (s = 18) => <SvgIcon size={s}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></SvgIcon>,
  search: (s = 16) => <SvgIcon size={s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></SvgIcon>,
  star: (s = 16) => <SvgIcon size={s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></SvgIcon>,
  starFilled: (s = 16) => <SvgIcon size={s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/></SvgIcon>,
  trash: (s = 16) => <SvgIcon size={s}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></SvgIcon>,
  edit: (s = 16) => <SvgIcon size={s}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></SvgIcon>,
  grid: (s = 14) => <SvgIcon size={s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></SvgIcon>,
  list: (s = 14) => <SvgIcon size={s}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></SvgIcon>,
  home: (s = 14) => <SvgIcon size={s}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></SvgIcon>,
  chevronRight: (s = 12) => <SvgIcon size={s}><polyline points="9 18 15 12 9 6"/></SvgIcon>,
  close: (s = 18) => <SvgIcon size={s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></SvgIcon>,
  paperclip: (s = 18) => <SvgIcon size={s}><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></SvgIcon>,
  save: (s = 16) => <SvgIcon size={s}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></SvgIcon>,
  hdd: (s = 18) => <SvgIcon size={s}><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></SvgIcon>,
  clock: (s = 16) => <SvgIcon size={s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></SvgIcon>,
  user: (s = 16) => <SvgIcon size={s}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></SvgIcon>,
  building: (s = 16) => <SvgIcon size={s}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9.01" y2="6"/><line x1="15" y1="6" x2="15.01" y2="6"/><line x1="9" y1="10" x2="9.01" y2="10"/><line x1="15" y1="10" x2="15.01" y2="10"/><line x1="9" y1="14" x2="9.01" y2="14"/><line x1="15" y1="14" x2="15.01" y2="14"/><path d="M9 22v-4h6v4"/></SvgIcon>,
  wrench: (s = 16) => <SvgIcon size={s}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></SvgIcon>,
  info: (s = 18) => <SvgIcon size={s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></SvgIcon>,
  inbox: (s = 18) => <SvgIcon size={s}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></SvgIcon>,
  // File type icons
  filePdf: (s = 18) => <SvgIcon size={s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15v-2h2a1 1 0 110 2H9z" strokeWidth="1.5"/></SvgIcon>,
  fileSpreadsheet: (s = 18) => <SvgIcon size={s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="12" y1="9" x2="12" y2="21"/></SvgIcon>,
  fileImage: (s = 18) => <SvgIcon size={s}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></SvgIcon>,
  fileText: (s = 18) => <SvgIcon size={s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></SvgIcon>,
  fileArchive: (s = 18) => <SvgIcon size={s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><rect x="10" y="12" width="4" height="6" rx="1"/><line x1="12" y1="12" x2="12" y2="10"/></SvgIcon>,
  contract: (s = 18) => <SvgIcon size={s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/><circle cx="15" cy="17" r="1.5" strokeWidth="1.5"/></SvgIcon>,
  book: (s = 18) => <SvgIcon size={s}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></SvgIcon>,
  barChart: (s = 18) => <SvgIcon size={s}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></SvgIcon>,
  receipt: (s = 18) => <SvgIcon size={s}><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2V2l-3 2-3-2-3 2-3-2-3 2z" strokeWidth="1.5"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/></SvgIcon>,
  clipboard: (s = 18) => <SvgIcon size={s}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></SvgIcon>,
  award: (s = 18) => <SvgIcon size={s}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></SvgIcon>,
  camera: (s = 18) => <SvgIcon size={s}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></SvgIcon>,
  box: (s = 18) => <SvgIcon size={s}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></SvgIcon>,
};

// ── Sabitler ──────────────────────────────────────────────────
const DOC_CATEGORIES = [
  { value: 'contract', label: 'Sözleşme', iconKey: 'contract', color: '#6366f1' },
  { value: 'manual', label: 'Kullanım Kılavuzu', iconKey: 'book', color: '#0ea5e9' },
  { value: 'report', label: 'Rapor', iconKey: 'barChart', color: '#22c55e' },
  { value: 'invoice', label: 'Fatura', iconKey: 'receipt', color: '#f59e0b' },
  { value: 'procedure', label: 'Prosedür', iconKey: 'clipboard', color: '#8b5cf6' },
  { value: 'certificate', label: 'Sertifika', iconKey: 'award', color: '#ec4899' },
  { value: 'photo', label: 'Fotoğraf', iconKey: 'camera', color: '#14b8a6' },
  { value: 'other', label: 'Diğer', iconKey: 'box', color: '#64748b' },
];

const getCategoryIcon = (iconKey, size = 16) => Icons[iconKey] ? Icons[iconKey](size) : Icons.file(size);

const FILE_TYPE_MAP = {
  pdf: { iconFn: 'filePdf', color: '#ef4444' },
  doc: { iconFn: 'fileText', color: '#3b82f6' },
  docx: { iconFn: 'fileText', color: '#3b82f6' },
  xls: { iconFn: 'fileSpreadsheet', color: '#22c55e' },
  xlsx: { iconFn: 'fileSpreadsheet', color: '#22c55e' },
  ppt: { iconFn: 'fileText', color: '#f97316' },
  pptx: { iconFn: 'fileText', color: '#f97316' },
  jpg: { iconFn: 'fileImage', color: '#8b5cf6' },
  jpeg: { iconFn: 'fileImage', color: '#8b5cf6' },
  png: { iconFn: 'fileImage', color: '#8b5cf6' },
  gif: { iconFn: 'fileImage', color: '#8b5cf6' },
  txt: { iconFn: 'fileText', color: '#64748b' },
  csv: { iconFn: 'fileSpreadsheet', color: '#14b8a6' },
  zip: { iconFn: 'fileArchive', color: '#78716c' },
  rar: { iconFn: 'fileArchive', color: '#78716c' },
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileExtension = (filename) => {
  return filename?.split('.').pop()?.toLowerCase() || '';
};

const getFileIcon = (filename, size = 20) => {
  const ext = getFileExtension(filename);
  const mapped = FILE_TYPE_MAP[ext];
  if (mapped && Icons[mapped.iconFn]) {
    return <span className="docs-file-type-icon" style={{ color: mapped.color }}>{Icons[mapped.iconFn](size)}</span>;
  }
  return <span className="docs-file-type-icon" style={{ color: '#94a3b8' }}>{Icons.file(size)}</span>;
};

const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return date.toLocaleDateString('tr-TR');
};

// ── Örnek Dokümanlar ──────────────────────────────────────────
const getSampleDocuments = () => [
  {
    id: 1, name: 'Servis_Sozlesmesi_2025.pdf', category: 'contract',
    size: 245760, tags: ['sözleşme', 'yıllık', '2025'],
    description: '2025 yılı servis bakım sözleşmesi',
    clientId: null, incidentId: null, folderId: 'root',
    uploadedBy: 'Admin', createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z', downloads: 12, version: 1,
    starred: true,
  },
  {
    id: 2, name: 'UPS_Kullanim_Kilavuzu.pdf', category: 'manual',
    size: 1572864, tags: ['ups', 'kılavuz', 'donanım'],
    description: 'APC Smart-UPS 3000 kullanım kılavuzu',
    clientId: null, incidentId: null, folderId: 'root',
    uploadedBy: 'Admin', createdAt: '2025-02-10T14:00:00Z',
    updatedAt: '2025-02-10T14:00:00Z', downloads: 8, version: 1,
    starred: false,
  },
  {
    id: 3, name: 'Aylik_Rapor_Ocak2025.xlsx', category: 'report',
    size: 102400, tags: ['rapor', 'aylık', 'ocak'],
    description: 'Ocak 2025 servis operasyonları aylık raporu',
    clientId: null, incidentId: null, folderId: 'root',
    uploadedBy: 'Admin', createdAt: '2025-02-01T09:00:00Z',
    updatedAt: '2025-02-01T09:00:00Z', downloads: 5, version: 2,
    starred: false,
  },
  {
    id: 4, name: 'Network_Topoloji_Sema.png', category: 'other',
    size: 524288, tags: ['network', 'topoloji', 'şema'],
    description: 'Merkez ofis ağ topoloji şeması',
    clientId: null, incidentId: null, folderId: 'root',
    uploadedBy: 'Ahmet Yılmaz', createdAt: '2025-03-05T16:20:00Z',
    updatedAt: '2025-03-05T16:20:00Z', downloads: 15, version: 3,
    starred: true,
  },
  {
    id: 5, name: 'Bakim_Proseduru_Sunucu.pdf', category: 'procedure',
    size: 327680, tags: ['bakım', 'sunucu', 'prosedür'],
    description: 'Sunucu odası periyodik bakım prosedürü',
    clientId: null, incidentId: null, folderId: 'root',
    uploadedBy: 'Mehmet Kaya', createdAt: '2025-04-12T11:10:00Z',
    updatedAt: '2025-04-12T11:10:00Z', downloads: 22, version: 1,
    starred: false,
  },
  {
    id: 6, name: 'Fatura_2025_001.pdf', category: 'invoice',
    size: 156000, tags: ['fatura', 'ocak'],
    description: 'Ocak 2025 servis hizmet faturası',
    clientId: null, incidentId: null, folderId: 'root',
    uploadedBy: 'Admin', createdAt: '2025-01-31T17:00:00Z',
    updatedAt: '2025-01-31T17:00:00Z', downloads: 3, version: 1,
    starred: false,
  },
];

const getSampleFolders = () => [
  { id: 'folder-1', name: 'Sözleşmeler', parentId: 'root', color: '#6366f1', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'folder-2', name: 'Teknik Dokümanlar', parentId: 'root', color: '#0ea5e9', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'folder-3', name: 'Raporlar', parentId: 'root', color: '#22c55e', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'folder-4', name: 'Faturalar', parentId: 'root', color: '#f59e0b', createdAt: '2025-01-01T00:00:00Z' },
];

// ══════════════════════════════════════════════════════════════
// ── ANA COMPONENT ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function DocumentsPage({ clients, incidents, currentUser, showToast }) {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [sortBy, setSortBy] = useState('newest');
  const [currentFolder, setCurrentFolder] = useState('root');
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [dragActive, setDragActive] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const fileInputRef = useRef(null);

  // ── Veri Yükle ────────────────────────────
  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem('documents');
      const savedFolders = localStorage.getItem('documentFolders');
      if (savedDocs) {
        setDocuments(JSON.parse(savedDocs));
      } else {
        const samples = getSampleDocuments();
        setDocuments(samples);
        localStorage.setItem('documents', JSON.stringify(samples));
      }
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders));
      } else {
        const sampleFolders = getSampleFolders();
        setFolders(sampleFolders);
        localStorage.setItem('documentFolders', JSON.stringify(sampleFolders));
      }
    } catch { /* */ }
  }, []);

  const saveDocs = useCallback((data) => {
    setDocuments(data);
    localStorage.setItem('documents', JSON.stringify(data));
  }, []);

  const saveFolders = useCallback((data) => {
    setFolders(data);
    localStorage.setItem('documentFolders', JSON.stringify(data));
  }, []);

  // ── Doküman İşlemleri ─────────────────────
  const addDocument = (formData) => {
    const newDoc = {
      id: Date.now(),
      ...formData,
      tags: typeof formData.tags === 'string'
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : formData.tags || [],
      folderId: currentFolder,
      uploadedBy: currentUser?.name || 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloads: 0,
      version: 1,
      starred: false,
    };
    saveDocs([newDoc, ...documents]);
    showToast('Doküman yüklendi!', 'success');
    setShowUpload(false);
  };

  const updateDocument = (formData) => {
    const updated = documents.map(d =>
      d.id === editingDoc.id
        ? {
            ...d,
            ...formData,
            tags: typeof formData.tags === 'string'
              ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
              : formData.tags || [],
            updatedAt: new Date().toISOString(),
            version: (d.version || 1) + 1,
          }
        : d
    );
    saveDocs(updated);
    showToast('Doküman güncellendi!', 'success');
    setEditingDoc(null);
  };

  const deleteDocument = (id) => {
    if (!window.confirm('Bu dokümanı silmek istediğinize emin misiniz?')) return;
    saveDocs(documents.filter(d => d.id !== id));
    showToast('Doküman silindi.', 'info');
  };

  const toggleStar = (id) => {
    saveDocs(documents.map(d => d.id === id ? { ...d, starred: !d.starred } : d));
  };

  const downloadDoc = (doc) => {
    saveDocs(documents.map(d => d.id === doc.id ? { ...d, downloads: (d.downloads || 0) + 1 } : d));
    showToast(`"${doc.name}" indiriliyor...`, 'info');
  };

  const bulkDelete = () => {
    if (selectedDocs.size === 0) return;
    if (!window.confirm(`${selectedDocs.size} doküman silinecek. Emin misiniz?`)) return;
    saveDocs(documents.filter(d => !selectedDocs.has(d.id)));
    setSelectedDocs(new Set());
    showToast(`${selectedDocs.size} doküman silindi.`, 'info');
  };

  const bulkMove = (folderId) => {
    if (selectedDocs.size === 0) return;
    saveDocs(documents.map(d => selectedDocs.has(d.id) ? { ...d, folderId } : d));
    setSelectedDocs(new Set());
    showToast('Dokümanlar taşındı.', 'success');
  };

  // ── Klasör İşlemleri ──────────────────────
  const addFolder = (name) => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name,
      parentId: currentFolder,
      color: DOC_CATEGORIES[Math.floor(Math.random() * DOC_CATEGORIES.length)].color,
      createdAt: new Date().toISOString(),
    };
    saveFolders([...folders, newFolder]);
    showToast('Klasör oluşturuldu!', 'success');
    setShowFolderForm(false);
  };

  const deleteFolder = (folderId) => {
    if (!window.confirm('Bu klasör ve içindeki dokümanlar silinecek. Emin misiniz?')) return;
    saveFolders(folders.filter(f => f.id !== folderId));
    saveDocs(documents.map(d => d.folderId === folderId ? { ...d, folderId: 'root' } : d));
    showToast('Klasör silindi.', 'info');
  };

  // ── Drag & Drop ───────────────────────────
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList);
    files.forEach(file => {
      addDocument({
        name: file.name,
        size: file.size,
        category: guessCategory(file.name),
        description: '',
        tags: '',
        clientId: null,
        incidentId: null,
      });
    });
  };

  const guessCategory = (filename) => {
    const ext = getFileExtension(filename);
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'photo';
    if (['pdf'].includes(ext)) return 'other';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'report';
    if (['doc', 'docx'].includes(ext)) return 'other';
    return 'other';
  };

  // ── Filtre & Sıralama ────────────────────
  const currentFolderDocs = documents.filter(d => (d.folderId || 'root') === currentFolder);
  const currentSubFolders = folders.filter(f => (f.parentId || 'root') === currentFolder);

  const filteredDocs = currentFolderDocs
    .filter(d => {
      if (showStarredOnly && !d.starred) return false;
      if (filterCategory !== 'all' && d.category !== filterCategory) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          d.name?.toLowerCase().includes(s) ||
          d.description?.toLowerCase().includes(s) ||
          d.tags?.some(t => t.toLowerCase().includes(s)) ||
          d.uploadedBy?.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name': return (a.name || '').localeCompare(b.name || '');
        case 'size': return (b.size || 0) - (a.size || 0);
        case 'downloads': return (b.downloads || 0) - (a.downloads || 0);
        default: return 0;
      }
    });

  const toggleSelect = (id) => {
    setSelectedDocs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedDocs.size === filteredDocs.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocs.map(d => d.id)));
    }
  };

  // ── Breadcrumb (klasör yolu) ──────────────
  const getBreadcrumb = () => {
    const path = [{ id: 'root', name: 'Ana Klasör' }];
    const folderMap = new Map(folders.map(f => [f.id, f]));
    let current = currentFolder;
    const visited = new Set();
    while (current !== 'root') {
      if (visited.has(current)) break;
      visited.add(current);
      const folder = folderMap.get(current);
      if (folder) {
        path.push({ id: folder.id, name: folder.name });
        current = folder.parentId || 'root';
      } else break;
    }
    return path;
  };

  // ── İstatistikler ────────────────────────
  const stats = {
    total: documents.length,
    totalSize: documents.reduce((sum, d) => sum + (d.size || 0), 0),
    categories: DOC_CATEGORIES.map(cat => ({
      ...cat,
      count: documents.filter(d => d.category === cat.value).length,
    })),
    recentUploads: documents.filter(d => {
      const dayAgo = new Date(Date.now() - 7 * 86400000);
      return new Date(d.createdAt) > dayAgo;
    }).length,
  };

  // ══════════════════════════════════════════
  // ── RENDER ────────────────────────────────
  // ══════════════════════════════════════════
  return (
    <div className="documents-page">
      {/* ── Header ─────────────── */}
      <div className="docs-page-header">
        <div className="docs-header-left">
          <h1>{Icons.file(22)} Doküman Yönetimi</h1>
          <p>Dosya ve dokümanları yükleyin, kategorileyin ve yönetin</p>
        </div>
        <div className="docs-header-actions">
          <button className="docs-btn docs-btn-secondary" onClick={() => setShowFolderForm(true)}>
            {Icons.folderPlus(16)} Yeni Klasör
          </button>
          <button className="docs-btn docs-btn-primary" onClick={() => setShowUpload(true)}>
            {Icons.upload(16)} Doküman Yükle
          </button>
        </div>
      </div>

      {/* ── Stat Cards ─────────── */}
      <div className="docs-stats-row">
        <div className="docs-stat-card">
          <div className="docs-stat-icon" style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>{Icons.file(20)}</div>
          <div className="docs-stat-info">
            <span className="docs-stat-value">{stats.total}</span>
            <span className="docs-stat-label">Toplam Doküman</span>
          </div>
        </div>
        <div className="docs-stat-card">
          <div className="docs-stat-icon" style={{ background: 'rgba(14,165,233,0.08)', color: '#0ea5e9' }}>{Icons.hdd(20)}</div>
          <div className="docs-stat-info">
            <span className="docs-stat-value">{formatFileSize(stats.totalSize)}</span>
            <span className="docs-stat-label">Toplam Boyut</span>
          </div>
        </div>
        <div className="docs-stat-card">
          <div className="docs-stat-icon" style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e' }}>{Icons.folder(20)}</div>
          <div className="docs-stat-info">
            <span className="docs-stat-value">{folders.length}</span>
            <span className="docs-stat-label">Klasör</span>
          </div>
        </div>
        <div className="docs-stat-card">
          <div className="docs-stat-icon" style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}>{Icons.download(20)}</div>
          <div className="docs-stat-info">
            <span className="docs-stat-value">{stats.recentUploads}</span>
            <span className="docs-stat-label">Bu Hafta Yüklenen</span>
          </div>
        </div>
      </div>

      {/* ── Kategori Çipleri ──── */}
      <div className="docs-category-chips">
        {stats.categories.filter(c => c.count > 0).map(cat => (
          <button
            key={cat.value}
            className={`docs-chip ${filterCategory === cat.value ? 'active' : ''}`}
            style={{ '--chip-color': cat.color }}
            onClick={() => setFilterCategory(filterCategory === cat.value ? 'all' : cat.value)}
          >
            <span className="docs-chip-svg">{getCategoryIcon(cat.iconKey, 14)}</span>
            <span>{cat.label}</span>
            <span className="docs-chip-count">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* ── Toolbar ────────────── */}
      <div className="docs-toolbar">
        <div className="docs-toolbar-left">
          <div className="docs-search-box">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
              <circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Doküman ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="docs-search-clear" onClick={() => setSearch('')}>×</button>
            )}
          </div>

          <select
            className="docs-select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="all">Tüm Kategoriler</option>
            {DOC_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>

          <select
            className="docs-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
            <option value="name">İsme Göre</option>
            <option value="size">Boyuta Göre</option>
            <option value="downloads">İndirmeye Göre</option>
          </select>

          <button
            className={`docs-toolbar-btn ${showStarredOnly ? 'active' : ''}`}
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            title="Yıldızlı dokümanlar"
          >
            {showStarredOnly ? Icons.starFilled(16) : Icons.star(16)}
          </button>
        </div>

        <div className="docs-toolbar-right">
          {selectedDocs.size > 0 && (
            <div className="docs-bulk-actions">
              <span className="docs-selected-count">{selectedDocs.size} seçili</span>
              <select
                className="docs-select docs-select-sm"
                onChange={e => { if (e.target.value) bulkMove(e.target.value); e.target.value = ''; }}
                defaultValue=""
              >
                <option value="" disabled>Taşı...</option>
                <option value="root">Ana Klasör</option>
                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <button className="docs-btn docs-btn-danger docs-btn-sm" onClick={bulkDelete}>
                {Icons.trash(14)} Sil
              </button>
            </div>
          )}

          <div className="docs-view-toggle">
            <button
              className={`docs-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Izgara Görünümü"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            </button>
            <button
              className={`docs-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Liste Görünümü"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <rect x="1" y="2" width="14" height="2.5" rx="0.5" />
                <rect x="1" y="6.75" width="14" height="2.5" rx="0.5" />
                <rect x="1" y="11.5" width="14" height="2.5" rx="0.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ─────────── */}
      <div className="docs-breadcrumb">
        {getBreadcrumb().map((item, i) => (
          <React.Fragment key={item.id}>
            {i > 0 && <span className="docs-breadcrumb-sep">/</span>}
            <button
              className={`docs-breadcrumb-item ${item.id === currentFolder ? 'active' : ''}`}
              onClick={() => setCurrentFolder(item.id)}
            >
              {i === 0 ? Icons.home(13) : Icons.folder(13)} {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* ── Drag & Drop Zone ──── */}
      <div
        className={`docs-drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {dragActive && (
          <div className="docs-drop-overlay">
            <div className="docs-drop-content">
              <span className="docs-drop-icon">{Icons.upload(48)}</span>
              <p>Dosyaları buraya bırakın</p>
            </div>
          </div>
        )}

        {/* ── Klasörler ─────────── */}
        {currentSubFolders.length > 0 && (
          <div className="docs-folders-section">
            <h3 className="docs-section-title">{Icons.folder(16)} Klasörler</h3>
            <div className="docs-folders-grid">
              {currentSubFolders.map(folder => (
                <div
                  key={folder.id}
                  className="docs-folder-card"
                  onDoubleClick={() => setCurrentFolder(folder.id)}
                  onClick={() => setCurrentFolder(folder.id)}
                >
                  <div className="docs-folder-icon" style={{ color: folder.color }}>{Icons.folder(28)}</div>
                  <div className="docs-folder-name">{folder.name}</div>
                  <div className="docs-folder-count">
                    {documents.filter(d => d.folderId === folder.id).length} dosya
                  </div>
                  <button
                    className="docs-folder-delete"
                    onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                    title="Klasörü Sil"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Dokümanlar ─────────── */}
        <div className="docs-files-section">
          <div className="docs-section-header">
            <h3 className="docs-section-title">{Icons.file(16)} Dokümanlar ({filteredDocs.length})</h3>
            {filteredDocs.length > 0 && (
              <button className="docs-select-all" onClick={selectAll}>
                {selectedDocs.size === filteredDocs.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
            )}
          </div>

          {filteredDocs.length === 0 ? (
            <div className="docs-empty-state">
              <span className="docs-empty-icon">{Icons.inbox(48)}</span>
              <p>{search ? 'Aramanızla eşleşen doküman bulunamadı.' : 'Bu klasörde henüz doküman yok.'}</p>
              <button className="docs-btn docs-btn-primary" onClick={() => setShowUpload(true)}>
                {Icons.upload(16)} Doküman Yükle
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="docs-grid">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className={`docs-card ${selectedDocs.has(doc.id) ? 'selected' : ''}`}
                  onClick={() => setPreviewDoc(doc)}
                >
                  <div className="docs-card-header">
                    <input
                      type="checkbox"
                      className="docs-checkbox"
                      checked={selectedDocs.has(doc.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(doc.id); }}
                      onClick={e => e.stopPropagation()}
                    />
                    <button
                      className="docs-star-btn"
                      onClick={(e) => { e.stopPropagation(); toggleStar(doc.id); }}
                    >
                      {doc.starred ? Icons.starFilled(14) : Icons.star(14)}
                    </button>
                  </div>
                  <div className="docs-card-icon">{getFileIcon(doc.name, 32)}</div>
                  <div className="docs-card-name" title={doc.name}>
                    {doc.name}
                  </div>
                  <div className="docs-card-meta">
                    <span className="docs-card-size">{formatFileSize(doc.size)}</span>
                    <span className="docs-card-dot">·</span>
                    <span className="docs-card-date">{timeAgo(doc.createdAt)}</span>
                  </div>
                  <div className="docs-card-category">
                    <span
                      className="docs-category-badge"
                      style={{ background: DOC_CATEGORIES.find(c => c.value === doc.category)?.color + '12', color: DOC_CATEGORIES.find(c => c.value === doc.category)?.color }}
                    >
                      {getCategoryIcon(DOC_CATEGORIES.find(c => c.value === doc.category)?.iconKey, 12)}
                      {DOC_CATEGORIES.find(c => c.value === doc.category)?.label}
                    </span>
                  </div>
                  {doc.tags?.length > 0 && (
                    <div className="docs-card-tags">
                      {doc.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="docs-tag">#{tag}</span>
                      ))}
                      {doc.tags.length > 3 && <span className="docs-tag-more">+{doc.tags.length - 3}</span>}
                    </div>
                  )}
                  <div className="docs-card-footer">
                    <span className="docs-card-uploader">{Icons.user(12)} {doc.uploadedBy}</span>
                    <span className="docs-card-downloads">{Icons.download(12)} {doc.downloads}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="docs-list">
              <div className="docs-list-header">
                <span className="docs-list-col docs-list-check">
                  <input
                    type="checkbox"
                    checked={selectedDocs.size === filteredDocs.length && filteredDocs.length > 0}
                    onChange={selectAll}
                  />
                </span>
                <span className="docs-list-col docs-list-name">Dosya Adı</span>
                <span className="docs-list-col docs-list-cat">Kategori</span>
                <span className="docs-list-col docs-list-size">Boyut</span>
                <span className="docs-list-col docs-list-date">Tarih</span>
                <span className="docs-list-col docs-list-by">Yükleyen</span>
                <span className="docs-list-col docs-list-actions">İşlem</span>
              </div>
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className={`docs-list-row ${selectedDocs.has(doc.id) ? 'selected' : ''}`}
                  onClick={() => setPreviewDoc(doc)}
                >
                  <span className="docs-list-col docs-list-check">
                    <input
                      type="checkbox"
                      checked={selectedDocs.has(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                      onClick={e => e.stopPropagation()}
                    />
                  </span>
                  <span className="docs-list-col docs-list-name">
                    <span className="docs-list-icon">{getFileIcon(doc.name, 18)}</span>
                    <span className="docs-list-filename">{doc.name}</span>
                    {doc.starred && <span className="docs-list-star">{Icons.starFilled(12)}</span>}
                  </span>
                  <span className="docs-list-col docs-list-cat">
                    <span
                      className="docs-category-badge-sm"
                      style={{ background: DOC_CATEGORIES.find(c => c.value === doc.category)?.color + '12', color: DOC_CATEGORIES.find(c => c.value === doc.category)?.color }}
                    >
                      {DOC_CATEGORIES.find(c => c.value === doc.category)?.label}
                    </span>
                  </span>
                  <span className="docs-list-col docs-list-size">{formatFileSize(doc.size)}</span>
                  <span className="docs-list-col docs-list-date">{timeAgo(doc.createdAt)}</span>
                  <span className="docs-list-col docs-list-by">{doc.uploadedBy}</span>
                  <span className="docs-list-col docs-list-actions" onClick={e => e.stopPropagation()}>
                    <button className="docs-action-btn" onClick={() => downloadDoc(doc)} title="İndir">{Icons.download(15)}</button>
                    <button className="docs-action-btn" onClick={() => setEditingDoc(doc)} title="Düzenle">{Icons.edit(15)}</button>
                    <button className="docs-action-btn docs-action-btn-danger" onClick={() => deleteDocument(doc.id)} title="Sil">{Icons.trash(15)}</button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Doküman Yükleme Modalı ── */}
      {(showUpload || editingDoc) && (
        <DocumentFormModal
          doc={editingDoc}
          clients={clients}
          incidents={incidents}
          onSave={editingDoc ? updateDocument : addDocument}
          onClose={() => { setShowUpload(false); setEditingDoc(null); }}
          fileInputRef={fileInputRef}
        />
      )}

      {/* ── Klasör Oluşturma Modalı ── */}
      {showFolderForm && (
        <FolderFormModal
          onSave={addFolder}
          onClose={() => setShowFolderForm(false)}
        />
      )}

      {/* ── Doküman Önizleme Modalı ── */}
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          clients={clients}
          incidents={incidents}
          onClose={() => setPreviewDoc(null)}
          onEdit={() => { setEditingDoc(previewDoc); setPreviewDoc(null); }}
          onDownload={() => downloadDoc(previewDoc)}
          onDelete={() => { deleteDocument(previewDoc.id); setPreviewDoc(null); }}
          onToggleStar={() => toggleStar(previewDoc.id)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── DOKÜMAN FORMU MODALI ─────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function DocumentFormModal({ doc, clients, incidents, onSave, onClose, fileInputRef }) {
  const [form, setForm] = useState({
    name: doc?.name || '',
    category: doc?.category || 'other',
    description: doc?.description || '',
    tags: doc?.tags?.join(', ') || '',
    clientId: doc?.clientId || '',
    incidentId: doc?.incidentId || '',
    size: doc?.size || 0,
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        name: file.name,
        size: file.size,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      clientId: form.clientId || null,
      incidentId: form.incidentId || null,
    });
  };

  return (
    <div className="docs-modal-overlay" onClick={onClose}>
      <div className="docs-modal" onClick={e => e.stopPropagation()}>
        <div className="docs-modal-header">
          <h2>{doc ? Icons.edit(18) : Icons.upload(18)} {doc ? 'Doküman Düzenle' : 'Doküman Yükle'}</h2>
          <button className="docs-modal-close" onClick={onClose}>{Icons.close(18)}</button>
        </div>
        <form className="docs-form" onSubmit={handleSubmit}>
          {!doc && (
            <div className="docs-form-group">
              <label>Dosya Seç</label>
              <div className="docs-file-input-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="docs-file-input"
                />
                <div className="docs-file-input-label">
                  {Icons.paperclip(18)}
                  <span>{form.name || 'Dosya seçin veya sürükleyip bırakın'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="docs-form-group">
            <label>Dosya Adı</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="dosya_adi.pdf"
              required
            />
          </div>

          <div className="docs-form-row">
            <div className="docs-form-group">
              <label>Kategori</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {DOC_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div className="docs-form-group">
              <label>Boyut</label>
              <input type="text" value={formatFileSize(form.size)} readOnly className="docs-input-readonly" />
            </div>
          </div>

          <div className="docs-form-group">
            <label>Açıklama</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Doküman hakkında kısa açıklama..."
              rows={3}
            />
          </div>

          <div className="docs-form-group">
            <label>Etiketler (virgülle ayırın)</label>
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="sözleşme, yıllık, 2025"
            />
          </div>

          <div className="docs-form-row">
            <div className="docs-form-group">
              <label>İlişkili Müşteri</label>
              <select
                value={form.clientId}
                onChange={e => setForm({ ...form, clientId: e.target.value ? Number(e.target.value) : '' })}
              >
                <option value="">-- Seçilmedi --</option>
                {clients?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="docs-form-group">
              <label>İlişkili Arıza</label>
              <select
                value={form.incidentId}
                onChange={e => setForm({ ...form, incidentId: e.target.value ? Number(e.target.value) : '' })}
              >
                <option value="">-- Seçilmedi --</option>
                {incidents?.slice(0, 50).map(inc => (
                  <option key={inc.id} value={inc.id}>#{inc.id} - {inc.description?.slice(0, 40)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="docs-form-actions">
            <button type="button" className="docs-btn docs-btn-secondary" onClick={onClose}>İptal</button>
            <button type="submit" className="docs-btn docs-btn-primary">
              {doc ? Icons.save(15) : Icons.upload(15)} {doc ? 'Kaydet' : 'Yükle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── KLASÖR FORMU MODALI ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function FolderFormModal({ onSave, onClose }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
  };

  return (
    <div className="docs-modal-overlay" onClick={onClose}>
      <div className="docs-modal docs-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="docs-modal-header">
          <h2>{Icons.folderPlus(18)} Yeni Klasör</h2>
          <button className="docs-modal-close" onClick={onClose}>{Icons.close(18)}</button>
        </div>
        <form className="docs-form" onSubmit={handleSubmit}>
          <div className="docs-form-group">
            <label>Klasör Adı</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Klasör adı girin..."
              autoFocus
              required
            />
          </div>
          <div className="docs-form-actions">
            <button type="button" className="docs-btn docs-btn-secondary" onClick={onClose}>İptal</button>
            <button type="submit" className="docs-btn docs-btn-primary">{Icons.folderPlus(15)} Oluştur</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── DOKÜMAN ÖNİZLEME MODALI ─────────────────────────────────
// ══════════════════════════════════════════════════════════════
function DocumentPreviewModal({ doc, clients, incidents, onClose, onEdit, onDownload, onDelete, onToggleStar }) {
  const client = clients?.find(c => c.id === doc.clientId);
  const incident = incidents?.find(i => i.id === doc.incidentId);
  const category = DOC_CATEGORIES.find(c => c.value === doc.category);

  return (
    <div className="docs-modal-overlay" onClick={onClose}>
      <div className="docs-modal docs-modal-preview" onClick={e => e.stopPropagation()}>
        <div className="docs-modal-header">
          <h2>{Icons.info(18)} Doküman Detayı</h2>
          <button className="docs-modal-close" onClick={onClose}>{Icons.close(18)}</button>
        </div>

        <div className="docs-preview-content">
          <div className="docs-preview-hero">
            <div className="docs-preview-icon">{getFileIcon(doc.name, 36)}</div>
            <div className="docs-preview-title">
              <h3>{doc.name}</h3>
              <span className="docs-preview-version">v{doc.version || 1}</span>
            </div>
            <button className="docs-star-btn-lg" onClick={onToggleStar}>
              {doc.starred ? Icons.starFilled(20) : Icons.star(20)}
            </button>
          </div>

          {doc.description && (
            <div className="docs-preview-desc">
              <p>{doc.description}</p>
            </div>
          )}

          <div className="docs-preview-info-grid">
            <div className="docs-preview-info-item">
              <span className="docs-info-label">Kategori</span>
              <span className="docs-info-value">
                <span
                  className="docs-category-badge"
                  style={{ background: category?.color + '12', color: category?.color }}
                >
                  {getCategoryIcon(category?.iconKey, 14)} {category?.label}
                </span>
              </span>
            </div>
            <div className="docs-preview-info-item">
              <span className="docs-info-label">Boyut</span>
              <span className="docs-info-value">{formatFileSize(doc.size)}</span>
            </div>
            <div className="docs-preview-info-item">
              <span className="docs-info-label">Yükleyen</span>
              <span className="docs-info-value">{Icons.user(14)} {doc.uploadedBy}</span>
            </div>
            <div className="docs-preview-info-item">
              <span className="docs-info-label">Yüklenme Tarihi</span>
              <span className="docs-info-value">{new Date(doc.createdAt).toLocaleDateString('tr-TR')} {new Date(doc.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="docs-preview-info-item">
              <span className="docs-info-label">Son Güncelleme</span>
              <span className="docs-info-value">{timeAgo(doc.updatedAt)}</span>
            </div>
            <div className="docs-preview-info-item">
              <span className="docs-info-label">İndirme</span>
              <span className="docs-info-value">{Icons.download(14)} {doc.downloads} kez</span>
            </div>
            {client && (
              <div className="docs-preview-info-item">
                <span className="docs-info-label">İlişkili Müşteri</span>
                <span className="docs-info-value">{Icons.building(14)} {client.name}</span>
              </div>
            )}
            {incident && (
              <div className="docs-preview-info-item">
                <span className="docs-info-label">İlişkili Arıza</span>
                <span className="docs-info-value">{Icons.wrench(14)} #{incident.id} - {incident.description?.slice(0, 30)}</span>
              </div>
            )}
          </div>

          {doc.tags?.length > 0 && (
            <div className="docs-preview-tags">
              <span className="docs-info-label">Etiketler</span>
              <div className="docs-tag-list">
                {doc.tags.map((tag, i) => (
                  <span key={i} className="docs-tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="docs-preview-actions">
            <button className="docs-btn docs-btn-primary" onClick={onDownload}>
              {Icons.download(15)} İndir
            </button>
            <button className="docs-btn docs-btn-secondary" onClick={onEdit}>
              {Icons.edit(15)} Düzenle
            </button>
            <button className="docs-btn docs-btn-danger" onClick={onDelete}>
              {Icons.trash(15)} Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;
