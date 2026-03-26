export function createNotificationOrchestrator({
  showToast,
  notifyBrowser,
  getBrowserPermission,
  now,
  quietHours,
} = {}) {
  const sentAtByKey = new Map();
  const queue = [];

  const toastFn = showToast || (() => {});
  const browserFn =
    notifyBrowser ||
    ((title, options) => {
      if ('Notification' in window) {
        return new Notification(title, options);
      }
      return null;
    });

  const permissionFn =
    getBrowserPermission ||
    (() => {
      if ('Notification' in window) return Notification.permission;
      return 'denied';
    });

  const nowFn = now || (() => Date.now());

  const priorityRank = (priority = 'normal') => {
    const map = { low: 0, normal: 1, high: 2, critical: 3 };
    return map[priority] ?? map.normal;
  };

  const isQuietHours = () => {
    if (!quietHours) return false;
    const { startHour = 22, endHour = 7 } = quietHours;
    const hour = new Date(nowFn()).getHours();
    if (startHour === endHour) return false;
    if (startHour < endHour) {
      return hour >= startHour && hour < endHour;
    }
    return hour >= startHour || hour < endHour;
  };

  const shouldSend = (dedupeKey, cooldownMs) => {
    if (!dedupeKey) return true;
    const lastSent = sentAtByKey.get(dedupeKey);
    const current = nowFn();

    if (lastSent !== undefined && current - lastSent < cooldownMs) {
      return false;
    }

    sentAtByKey.set(dedupeKey, current);
    return true;
  };

  const notify = ({
    title = 'Bildirim',
    message,
    body,
    type = 'info',
    channels = ['toast'],
    dedupeKey,
    cooldownMs = 0,
    icon,
    tag,
    requireInteraction = false,
    priority = 'normal',
    queueIfSuppressed = false,
    allowDuringQuietHours = false,
  }) => {
    if (!message && !body) return false;
    if (!shouldSend(dedupeKey, cooldownMs)) return false;

    const text = message || body;
    const quiet = isQuietHours();

    const effectiveChannels = [...channels];
    const browserIndex = effectiveChannels.indexOf('browser');
    const suppressBrowser = quiet && !allowDuringQuietHours && priority !== 'critical';

    if (browserIndex >= 0 && suppressBrowser) {
      effectiveChannels.splice(browserIndex, 1);
      if (queueIfSuppressed) {
        queue.push({
          title,
          message,
          body,
          type,
          channels,
          dedupeKey,
          cooldownMs,
          icon,
          tag,
          requireInteraction,
          priority,
          queueIfSuppressed: false,
          allowDuringQuietHours: true,
        });
        queue.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority));
      }
    }

    if (effectiveChannels.includes('toast')) {
      toastFn(text, type);
    }

    if (effectiveChannels.includes('browser') && permissionFn() === 'granted') {
      browserFn(title, {
        body: body || message || '',
        icon,
        tag,
        requireInteraction,
      });
    }

    return true;
  };

  const flushQueue = () => {
    if (queue.length === 0) return 0;
    const pending = [...queue];
    queue.length = 0;
    let sent = 0;
    pending.forEach((item) => {
      const ok = notify(item);
      if (ok) sent += 1;
    });
    return sent;
  };

  const getQueueSize = () => queue.length;

  return { notify, flushQueue, getQueueSize };
}
