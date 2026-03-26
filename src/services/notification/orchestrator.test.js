import { createNotificationOrchestrator } from './orchestrator';

describe('notification orchestrator', () => {
  test('sends toast notification', () => {
    const toast = jest.fn();
    const orchestrator = createNotificationOrchestrator({ showToast: toast });

    const sent = orchestrator.notify({ message: 'hello', type: 'success' });

    expect(sent).toBe(true);
    expect(toast).toHaveBeenCalledWith('hello', 'success');
  });

  test('suppresses duplicates during cooldown window', () => {
    const toast = jest.fn();
    let time = 1000;
    const orchestrator = createNotificationOrchestrator({
      showToast: toast,
      now: () => time,
    });

    expect(
      orchestrator.notify({ message: 'A', dedupeKey: 'k1', cooldownMs: 5000 })
    ).toBe(true);
    expect(
      orchestrator.notify({ message: 'A', dedupeKey: 'k1', cooldownMs: 5000 })
    ).toBe(false);

    time = 7000;
    expect(
      orchestrator.notify({ message: 'A', dedupeKey: 'k1', cooldownMs: 5000 })
    ).toBe(true);
  });

  test('sends browser notification when permission is granted', () => {
    const browserFn = jest.fn();
    const orchestrator = createNotificationOrchestrator({
      showToast: jest.fn(),
      notifyBrowser: browserFn,
      getBrowserPermission: () => 'granted',
    });

    orchestrator.notify({
      title: 'Title',
      body: 'Body',
      message: 'Toast text',
      channels: ['browser'],
    });

    expect(browserFn).toHaveBeenCalledWith(
      'Title',
      expect.objectContaining({ body: 'Body' })
    );
  });

  test('queues browser notification during quiet hours when requested', () => {
    const browserFn = jest.fn();
    const toastFn = jest.fn();
    const orchestrator = createNotificationOrchestrator({
      showToast: toastFn,
      notifyBrowser: browserFn,
      getBrowserPermission: () => 'granted',
      now: () => new Date('2026-03-25T23:00:00').getTime(),
      quietHours: { startHour: 22, endHour: 7 },
    });

    orchestrator.notify({
      title: 'Quiet',
      body: 'Queued',
      message: 'Queued toast',
      channels: ['browser'],
      queueIfSuppressed: true,
      priority: 'normal',
    });

    expect(browserFn).not.toHaveBeenCalled();
    expect(orchestrator.getQueueSize()).toBe(1);
  });

  test('flushQueue sends queued items in priority order', () => {
    const browserFn = jest.fn();
    const toastFn = jest.fn();
    let currentTime = new Date('2026-03-25T23:00:00').getTime();

    const orchestrator = createNotificationOrchestrator({
      showToast: toastFn,
      notifyBrowser: browserFn,
      getBrowserPermission: () => 'granted',
      now: () => currentTime,
      quietHours: { startHour: 22, endHour: 7 },
    });

    orchestrator.notify({
      title: 'Low',
      body: 'low',
      channels: ['browser'],
      queueIfSuppressed: true,
      priority: 'low',
    });
    orchestrator.notify({
      title: 'Critical',
      body: 'critical',
      channels: ['browser'],
      queueIfSuppressed: true,
      priority: 'critical',
    });

    // Critical notifications bypass quiet-hours suppression.
    expect(browserFn).toHaveBeenCalledWith('Critical', expect.any(Object));
    expect(orchestrator.getQueueSize()).toBe(1);

    currentTime = new Date('2026-03-26T10:00:00').getTime();
    const flushed = orchestrator.flushQueue();

    expect(flushed).toBe(1);
    expect(browserFn).toHaveBeenNthCalledWith(2, 'Low', expect.any(Object));
    expect(orchestrator.getQueueSize()).toBe(0);
  });
});
