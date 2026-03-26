import { clearDeadLetterQueue, clearOfflineQueue, readDeadLetterQueue, readOfflineQueue, writeOfflineQueue } from './offlineQueue';
import { createSyncEngine } from './syncEngine';

describe('syncEngine', () => {
  beforeEach(() => {
    localStorage.clear();
    clearOfflineQueue();
    clearDeadLetterQueue();
  });

  test('queues operation when api call fails', async () => {
    const engine = createSyncEngine({
      clientsApi: { create: jest.fn().mockRejectedValue(new Error('offline')), update: jest.fn() },
      incidentsApi: { create: jest.fn(), update: jest.fn(), updateStatus: jest.fn() },
    });

    const result = await engine.syncClientCreate({ id: 1, name: 'A' });

    expect(result.status).toBe('queued');
    expect(readOfflineQueue()).toHaveLength(1);
    expect(readOfflineQueue()[0].type).toBe('client.create');
  });

  test('flushQueue retries and clears successful operations', async () => {
    writeOfflineQueue([
      { id: 'q1', type: 'client.create', payload: { id: 11, name: 'X' }, retries: 0 },
      { id: 'q2', type: 'incident.status', payload: { id: 22, status: 'resolved' }, retries: 0 },
    ]);

    const clientsApi = { create: jest.fn().mockResolvedValue({ ok: true }), update: jest.fn() };
    const incidentsApi = { create: jest.fn(), update: jest.fn(), updateStatus: jest.fn().mockRejectedValue(new Error('still offline')) };

    const engine = createSyncEngine({ clientsApi, incidentsApi });
    const report = await engine.flushQueue();

    expect(report.processed).toBe(2);
    expect(report.succeeded).toBe(1);
    expect(report.failed).toBe(1);
    expect(report.deadLettered).toBe(0);
    expect(readOfflineQueue()).toHaveLength(1);
    expect(readOfflineQueue()[0].retries).toBe(1);
  });

  test('moves items to dead-letter when max retries reached', async () => {
    writeOfflineQueue([
      { id: 'q3', type: 'incident.status', payload: { id: 30, status: 'resolved' }, retries: 2 },
    ]);

    const engine = createSyncEngine({
      clientsApi: { create: jest.fn(), update: jest.fn() },
      incidentsApi: {
        create: jest.fn(),
        update: jest.fn(),
        updateStatus: jest.fn().mockRejectedValue(new Error('still offline')),
      },
      maxRetries: 3,
    });

    const report = await engine.flushQueue();

    expect(report.deadLettered).toBe(1);
    expect(readOfflineQueue()).toEqual([]);
    expect(readDeadLetterQueue()).toHaveLength(1);
    expect(engine.getSyncStats()).toEqual({ queueSize: 0, deadLetterSize: 1 });
  });

  test('requeues and clears dead-letter via sync engine helpers', () => {
    writeOfflineQueue([]);
    const dead = [{ id: 'd1', type: 'client.create', payload: { id: 1 }, retries: 5 }];
    localStorage.setItem('sod_offline_sync_dead_letter', JSON.stringify(dead));

    const engine = createSyncEngine({
      clientsApi: { create: jest.fn(), update: jest.fn() },
      incidentsApi: { create: jest.fn(), update: jest.fn(), updateStatus: jest.fn() },
    });

    expect(engine.getDeadLetters()).toHaveLength(1);
    const moved = engine.requeueDeadLetters();
    expect(moved).toBe(1);
    expect(readOfflineQueue()).toHaveLength(1);

    engine.clearDeadLetters();
    expect(engine.getDeadLetters()).toEqual([]);
  });
});
