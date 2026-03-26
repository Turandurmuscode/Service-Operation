import { checkRule, processWorkflowRules } from './workflowEngine';

describe('workflowEngine', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('checkRule returns false when rule is disabled', () => {
    const rule = {
      id: 1,
      enabled: false,
      trigger: 'incident_created',
      conditions: ['any'],
    };

    const result = checkRule(rule, 'incident_created', { id: 10 }, null, 0);
    expect(result).toBe(false);
  });

  test('checkRule matches critical incident condition', () => {
    const rule = {
      id: 2,
      enabled: true,
      trigger: 'incident_critical',
      conditions: ['priority_critical'],
    };

    const incident = { id: 20, priority: 'critical' };
    const result = checkRule(rule, 'incident_critical', incident, null, 0);

    expect(result).toBe(true);
  });

  test('processWorkflowRules executes actions and updates logs/counts', () => {
    const rule = {
      id: 3,
      name: 'Critical Incident Rule',
      enabled: true,
      trigger: 'incident_created',
      conditions: ['any'],
      actions: ['add_note', 'log_event'],
      triggerCount: 0,
    };

    localStorage.setItem('workflowRules', JSON.stringify([rule]));
    localStorage.setItem(
      'incidents',
      JSON.stringify([{ id: 99, status: 'new' }, { id: 100, status: 'resolved' }])
    );

    const addIncidentNote = jest.fn();
    const showToast = jest.fn();
    const incident = {
      id: 501,
      description: 'Server timeout',
      status: 'new',
      priority: 'critical',
    };

    const triggered = processWorkflowRules('incident_created', incident, null, {
      addIncidentNote,
      showToast,
    });

    expect(triggered).toHaveLength(1);
    expect(triggered[0].id).toBe(3);
    expect(addIncidentNote).toHaveBeenCalledWith(
      501,
      expect.stringContaining('Critical Incident Rule')
    );

    const workflowLog = JSON.parse(localStorage.getItem('workflowLog'));
    expect(workflowLog).toHaveLength(1);
    expect(workflowLog[0].ruleId).toBe(3);
    expect(workflowLog[0].trigger).toBe('incident_created');

    const updatedRules = JSON.parse(localStorage.getItem('workflowRules'));
    expect(updatedRules[0].triggerCount).toBe(1);
  });
});
