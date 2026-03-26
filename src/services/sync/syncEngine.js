import {
  clearDeadLetterQueue,
  enqueueDeadLetterOperation,
  enqueueOfflineOperation,
  getOfflineSyncStats,
  readDeadLetterQueue,
  readOfflineQueue,
  requeueDeadLetterOperations,
  writeOfflineQueue,
} from './offlineQueue';

async function safeSync(syncFn, queuePayload) {
  try {
    await syncFn();
    return { status: 'synced' };
  } catch {
    enqueueOfflineOperation(queuePayload);
    return { status: 'queued' };
  }
}

export function createSyncEngine({ clientsApi, incidentsApi, maxRetries = 3 }) {
  const syncClientCreate = (client) =>
    safeSync(
      () => clientsApi.create(client),
      { type: 'client.create', payload: client }
    );

  const syncClientUpdate = (id, payload) =>
    safeSync(
      () => clientsApi.update(id, payload),
      { type: 'client.update', payload: { id, data: payload } }
    );

  const syncIncidentCreate = (incident) =>
    safeSync(
      () => incidentsApi.create(incident),
      { type: 'incident.create', payload: incident }
    );

  const syncIncidentUpdate = (id, payload) =>
    safeSync(
      () => incidentsApi.update(id, payload),
      { type: 'incident.update', payload: { id, data: payload } }
    );

  const syncIncidentStatus = (id, status) =>
    safeSync(
      () => incidentsApi.updateStatus(id, status),
      { type: 'incident.status', payload: { id, status } }
    );

  const flushQueue = async () => {
    const queue = readOfflineQueue();
    if (queue.length === 0) return { processed: 0, succeeded: 0, failed: 0 };

    const remaining = [];
    let deadLettered = 0;
    let succeeded = 0;

    for (const op of queue) {
      try {
        switch (op.type) {
          case 'client.create':
            await clientsApi.create(op.payload);
            break;
          case 'client.update':
            await clientsApi.update(op.payload.id, op.payload.data);
            break;
          case 'incident.create':
            await incidentsApi.create(op.payload);
            break;
          case 'incident.update':
            await incidentsApi.update(op.payload.id, op.payload.data);
            break;
          case 'incident.status':
            await incidentsApi.updateStatus(op.payload.id, op.payload.status);
            break;
          default:
            break;
        }
        succeeded += 1;
      } catch {
        const retries = (op.retries || 0) + 1;
        if (retries >= maxRetries) {
          enqueueDeadLetterOperation({ ...op, retries });
          deadLettered += 1;
        } else {
          remaining.push({ ...op, retries });
        }
      }
    }

    writeOfflineQueue(remaining);
    return {
      processed: queue.length,
      succeeded,
      failed: remaining.length,
      deadLettered,
    };
  };

  return {
    syncClientCreate,
    syncClientUpdate,
    syncIncidentCreate,
    syncIncidentUpdate,
    syncIncidentStatus,
    flushQueue,
    getSyncStats: getOfflineSyncStats,
    getDeadLetters: readDeadLetterQueue,
    requeueDeadLetters: requeueDeadLetterOperations,
    clearDeadLetters: clearDeadLetterQueue,
  };
}
