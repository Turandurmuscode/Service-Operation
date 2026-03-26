import { readLocalJSON, writeLocalJSON } from '../storageService';

const OFFLINE_QUEUE_KEY = 'sod_offline_sync_queue';
const DEAD_LETTER_QUEUE_KEY = 'sod_offline_sync_dead_letter';

export function readOfflineQueue() {
  return readLocalJSON(OFFLINE_QUEUE_KEY, []);
}

export function writeOfflineQueue(queue) {
  writeLocalJSON(OFFLINE_QUEUE_KEY, queue);
}

export function enqueueOfflineOperation(operation) {
  const queue = readOfflineQueue();
  const next = [
    ...queue,
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      retries: 0,
      ...operation,
    },
  ];
  writeOfflineQueue(next);
  return next;
}

export function clearOfflineQueue() {
  writeOfflineQueue([]);
}

export function readDeadLetterQueue() {
  return readLocalJSON(DEAD_LETTER_QUEUE_KEY, []);
}

export function writeDeadLetterQueue(queue) {
  writeLocalJSON(DEAD_LETTER_QUEUE_KEY, queue);
}

export function enqueueDeadLetterOperation(operation) {
  const queue = readDeadLetterQueue();
  const next = [
    ...queue,
    {
      movedAt: new Date().toISOString(),
      ...operation,
    },
  ];
  writeDeadLetterQueue(next);
  return next;
}

export function getOfflineSyncStats() {
  const queue = readOfflineQueue();
  const deadLetter = readDeadLetterQueue();
  return {
    queueSize: queue.length,
    deadLetterSize: deadLetter.length,
  };
}

export function clearDeadLetterQueue() {
  writeDeadLetterQueue([]);
}

export function requeueDeadLetterOperations(maxItems = Infinity) {
  const deadLetter = readDeadLetterQueue();
  if (deadLetter.length === 0) return 0;

  const takeCount = Math.max(0, Math.min(maxItems, deadLetter.length));
  const toRequeue = deadLetter.slice(0, takeCount).map((item) => ({
    ...item,
    retries: 0,
    requeuedAt: new Date().toISOString(),
  }));
  const remainingDead = deadLetter.slice(takeCount);
  const queue = readOfflineQueue();

  writeOfflineQueue([...toRequeue, ...queue]);
  writeDeadLetterQueue(remainingDead);
  return takeCount;
}
