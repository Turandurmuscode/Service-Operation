// ──────────────────────────────────────────────────────────────────────────────
// SLA Tier definitions
// Each tier defines response-time limits (minutes) per priority, the % elapsed
// at which a warning fires, and escalation rules.
// ──────────────────────────────────────────────────────────────────────────────

export const SLA_TIERS = {
  gold: {
    key: 'gold',
    label: 'Gold',
    color: '#f59e0b',
    bgColor: '#f59e0b18',
    borderColor: '#f59e0b40',
    icon: '',
    // SLA limits in minutes
    limits: { critical: 60, medium: 240, low: 480 },
    // Warn when this % of the SLA window has elapsed
    warningAt: 75,
    features: [
      'Öncelikli destek',
      '7/24 erişim',
      'Telefon + E-posta eskalasyon',
      'Garantili SLA — Critical: 1sa, Medium: 4sa, Low: 8sa',
    ],
  },
  silver: {
    key: 'silver',
    label: 'Silver',
    color: '#94a3b8',
    bgColor: '#94a3b818',
    borderColor: '#94a3b840',
    icon: '',
    limits: { critical: 120, medium: 480, low: 960 },
    warningAt: 80,
    features: [
      'Standart destek',
      'Mesai saatleri',
      'E-posta eskalasyon',
      'Critical: 2sa, Medium: 8sa, Low: 16sa',
    ],
  },
  bronze: {
    key: 'bronze',
    label: 'Bronze',
    color: '#cd7f32',
    bgColor: '#cd7f3218',
    borderColor: '#cd7f3240',
    icon: '',
    limits: { critical: 240, medium: 960, low: 2880 },
    warningAt: 85,
    features: [
      'Temel destek',
      'Mesai saatleri',
      'Ticket sistemi',
      'Critical: 4sa, Medium: 16sa, Low: 48sa',
    ],
  },
};

export const TIER_KEYS = ['gold', 'silver', 'bronze'];

/** Returns the full tier object for a client (defaults to bronze). */
export function getTierForClient(client) {
  if (!client?.slaTier) return SLA_TIERS.bronze;
  return SLA_TIERS[client.slaTier] || SLA_TIERS.bronze;
}

/**
 * Returns the SLA limit (minutes) for a given incident,
 * using the assigned client's tier from the provided clients array.
 * Falls back to hardcoded defaults when client / tier is unknown.
 */
export function getSLALimit(incident, clients = []) {
  const client = clients.find(c => c.id === incident.clientId);
  const tier = getTierForClient(client);
  return tier.limits[incident.priority] ?? tier.limits.low;
}

/**
 * Returns warning threshold % for a given incident's client tier.
 */
export function getSLAWarningThreshold(incident, clients = []) {
  const client = clients.find(c => c.id === incident.clientId);
  const tier = getTierForClient(client);
  return tier.warningAt;
}

/**
 * Given a priority and a tier key, returns deadline ISO string from now.
 */
export function deadlineFromTier(priority, tierKey) {
  const tier = SLA_TIERS[tierKey] || SLA_TIERS.bronze;
  const minutes = tier.limits[priority] ?? tier.limits.low;
  const d = new Date(Date.now() + minutes * 60000);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
