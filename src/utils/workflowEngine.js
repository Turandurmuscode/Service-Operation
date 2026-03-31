/**
 * Workflow Rules Auto-Execution Engine
 * Monitors events and triggers matching workflow rules automatically.
 */

const TRIGGER_MATCHERS = {
  incident_created: (incident) => !!incident,
  incident_critical: (incident) => incident?.priority === 'critical',
  incident_resolved: (incident) => incident?.status === 'resolved',
  incident_status_change: (incident) => !!incident,
  incident_overdue: (incident) => {
    if (!incident?.deadline) return false;
    return new Date(incident.deadline) < new Date();
  },
  client_added: (_, client) => !!client,
  no_update_24h: (incident) => {
    if (!incident?.startTime) return false;
    const lastUpdate = incident.lastUpdated || incident.startTime;
    const hoursSince = (Date.now() - new Date(lastUpdate)) / (1000 * 60 * 60);
    return hoursSince >= 24;
  },
  high_incident_count: (_, __, activeCount) => activeCount > 10,
};

const CONDITION_MATCHERS = {
  any: () => true,
  priority_critical: (incident) => incident?.priority === 'critical',
  priority_medium: (incident) => incident?.priority === 'medium',
  priority_low: (incident) => incident?.priority === 'low',
  status_new: (incident) => incident?.status === 'new',
  status_in_progress: (incident) => incident?.status === 'in_progress',
  status_on_hold: (incident) => incident?.status === 'on_hold',
};

/**
 * Check if a workflow rule matches given an event and context
 */
export function checkRule(rule, eventType, incident, client, activeIncidentCount) {
  if (!rule.enabled) return false;
  if (rule.trigger !== eventType) return false;
  
  // Check trigger
  const triggerFn = TRIGGER_MATCHERS[eventType];
  if (triggerFn && !triggerFn(incident, client, activeIncidentCount)) return false;

  // Check conditions
  const conditions = rule.conditions || ['any'];
  return conditions.some(cond => {
    const condFn = CONDITION_MATCHERS[cond];
    return condFn ? condFn(incident) : true;
  });
}

/**
 * Execute a workflow rule's actions
 * Returns array of action descriptions executed
 */
export function executeRuleActions(rule, incident, options = {}) {
  const { showToast, addIncidentNote } = options;
  const executed = [];

  (rule.actions || []).forEach(action => {
    switch (action) {
      case 'notify_admin':
      case 'notify_manager':
      case 'notify_all': {
        const labels = {
          notify_admin: 'Admin',
          notify_manager: 'Yönetici',
          notify_all: 'Tüm Ekip',
        };
        if (showToast) {
          showToast(` [Otomasyon] ${rule.name}: ${labels[action]}'e bildirim gönderildi`, 'info');
        }
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Otomasyon: ${rule.name}`, {
            body: `${labels[action]}'e bildirim — ${incident?.description || ''}`,
            tag: `workflow-${rule.id}-${Date.now()}`,
          });
        }
        executed.push(`${labels[action]} bildirim`);
        break;
      }
      case 'add_note': {
        if (addIncidentNote && incident?.id) {
          addIncidentNote(incident.id, `[Otomasyon] ${rule.name} kuralı tetiklendi.`);
        }
        executed.push('Not eklendi');
        break;
      }
      case 'escalate': {
        if (showToast) {
          showToast(` [Otomasyon] ${rule.name}: Arıza üst seviyeye yükseltildi`, 'warning');
        }
        executed.push('Yükseltildi');
        break;
      }
      case 'log_event': {
        executed.push('Olay kaydı');
        break;
      }
      case 'auto_assign': {
        executed.push('Otomatik atama');
        break;
      }
      case 'change_priority': {
        executed.push('Öncelik değiştirildi');
        break;
      }
      default:
        executed.push(action);
    }
  });

  return executed;
}

/**
 * Process all workflow rules for a given event.
 * Call this from App.js whenever a relevant event occurs.
 */
export function processWorkflowRules(eventType, incident, client, options = {}) {
  try {
    const rulesJson = localStorage.getItem('workflowRules');
    if (!rulesJson) return [];

    const rules = JSON.parse(rulesJson);
    const incidentsJson = localStorage.getItem('incidents');
    const allIncidents = incidentsJson ? JSON.parse(incidentsJson) : [];
    const activeCount = allIncidents.filter(i => 
      i.status !== 'resolved' && i.status !== 'cancelled'
    ).length;

    const triggered = [];

    rules.forEach(rule => {
      if (checkRule(rule, eventType, incident, client, activeCount)) {
        const executed = executeRuleActions(rule, incident, options);
        
        // Log execution
        const logJson = localStorage.getItem('workflowLog');
        const log = logJson ? JSON.parse(logJson) : [];
        log.unshift({
          id: Date.now() + Math.random(),
          ruleId: rule.id,
          ruleName: rule.name,
          trigger: eventType,
          actions: executed.join(', '),
          result: 'auto-executed',
          date: new Date().toISOString(),
          simulatedBy: 'Sistem (Otomatik)',
          incidentId: incident?.id,
        });
        localStorage.setItem('workflowLog', JSON.stringify(log.slice(0, 200)));

        // Update trigger count
        rule.triggerCount = (rule.triggerCount || 0) + 1;
        triggered.push(rule);
      }
    });

    // Save updated trigger counts
    if (triggered.length > 0) {
      const updatedRules = rules.map(r => {
        const t = triggered.find(tr => tr.id === r.id);
        return t ? { ...r, triggerCount: t.triggerCount } : r;
      });
      localStorage.setItem('workflowRules', JSON.stringify(updatedRules));
    }

    return triggered;
  } catch (err) {
    console.warn('Workflow engine error:', err);
    return [];
  }
}
