import {
  clearDeadLetterQueue,
  clearOfflineQueue,
  enqueueDeadLetterOperation,
  enqueueOfflineOperation,
  getOfflineSyncStats,
  readDeadLetterQueue,
  readOfflineQueue,
  writeOfflineQueue,
} from './offlineQueue';

describe('offlineQueue', () => {
  beforeEach(() => {
    localStorage.clear();
    clearOfflineQueue();
    clearDeadLetterQueue();
  });

  test('enqueueOfflineOperation appends to queue with metadata', () => {
    enqueueOfflineOperation({ type: 'client.create', payload: { id: 1 } });

    const queue = readOfflineQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ type: 'client.create' });
    expect(queue[0].id).toBeTruthy();
    expect(queue[0].createdAt).toBeTruthy();
  });

  test('writeOfflineQueue replaces queue content', () => {
    writeOfflineQueue([{ id: 'a' }, { id: 'b' }]);
    expect(readOfflineQueue()).toHaveLength(2);
    clearOfflineQueue();
    expect(readOfflineQueue()).toEqual([]);
  });

  test('handles dead-letter queue and sync stats', () => {
    enqueueOfflineOperation({ type: 'incident.create', payload: { id: 9 } });
    enqueueDeadLetterOperation({ type: 'incident.status', payload: { id: 9, status: 'resolved' } });

    expect(readDeadLetterQueue()).toHaveLength(1);
    expect(getOfflineSyncStats()).toEqual({ queueSize: 1, deadLetterSize: 1 });
  });
});
