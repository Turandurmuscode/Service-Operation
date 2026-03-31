// ──────────────────────────────────────────────────────────────────────────────
// Auto-routing engine
// Supports three modes:
//   manual       — no auto-assignment, user picks manually
//   round_robin  — rotates through all technicians evenly
//   skill_based  — matches technician skills to incident category,
//                  then picks the one with lowest current workload
// ──────────────────────────────────────────────────────────────────────────────

const loadJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

export const ROUTING_MODES = {
  manual:      { label: 'Manuel',       desc: 'Teknisyen her arıza için elle seçilir.',           icon: '' },
  round_robin: { label: 'Round-Robin',  desc: 'Arızalar sırayla tüm teknisyenlere dağıtılır.',    icon: '' },
  skill_based: { label: 'Yetenek Bazlı', desc: 'Kategori eşleşmesine + en az iş yüküne göre atanır.', icon: '' },
};

export const SKILL_OPTIONS = [
  { value: 'software', label: 'Yazılım' },
  { value: 'hardware', label: 'Donanım' },
  { value: 'network',  label: 'Network' },
  { value: 'other',    label: 'Diğer' },
];

/** Get/set current routing mode from localStorage. */
export function getRoutingMode() {
  return localStorage.getItem('routing_mode') || 'manual';
}
export function setRoutingMode(mode) {
  localStorage.setItem('routing_mode', mode);
}

// ── Round-robin ────────────────────────────────────────────────────────────────
export function roundRobinAssign(technicians) {
  if (!technicians.length) return null;
  const lastIdx = parseInt(localStorage.getItem('rr_index') ?? '-1');
  const nextIdx = (lastIdx + 1) % technicians.length;
  localStorage.setItem('rr_index', String(nextIdx));
  return technicians[nextIdx];
}

// ── Skill-based ────────────────────────────────────────────────────────────────
export function skillBasedAssign(technicians, category, incidents) {
  if (!technicians.length) return null;

  // Prefer technicians who have the matching skill listed
  // (if a technician has no skills array, treat them as all-rounder)
  const skilled = technicians.filter(
    t => !t.skills?.length || t.skills.includes(category)
  );
  const pool = skilled.length ? skilled : technicians;

  // Pick the one with fewest active (non-resolved) incidents
  const active = incidents.filter(
    i => i.status !== 'resolved' && i.status !== 'cancelled'
  );
  const workload = pool.map(t => ({
    tech: t,
    count: active.filter(i => i.technicianId === t.id).length,
  }));
  workload.sort((a, b) => a.count - b.count);

  return workload[0]?.tech ?? null;
}

// ── Main entry point ───────────────────────────────────────────────────────────
/**
 * Returns the auto-assigned technician object (or null for manual / no tech).
 * Reads technician list and incidents from localStorage so callers don't need
 * to pass the full lists.
 */
export function autoAssign(category) {
  const technicians = loadJSON('technicians', []);
  const incidents   = loadJSON('incidents',   []);
  if (!technicians.length) return null;

  const mode = getRoutingMode();
  if (mode === 'round_robin') return roundRobinAssign(technicians);
  if (mode === 'skill_based') return skillBasedAssign(technicians, category, incidents);
  return null; // manual
}

/**
 * Returns workload summary for all technicians — used by settings preview.
 */
export function getWorkloadSummary() {
  const technicians = loadJSON('technicians', []);
  const incidents   = loadJSON('incidents',   []);
  const active = incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled');
  return technicians.map(t => ({
    ...t,
    activeCount: active.filter(i => i.technicianId === t.id).length,
  }));
}
