const listeners = new Set();

export const subscribeNotificationBadgeRefresh = (listener) => {
  if (typeof listener !== 'function') {
    return () => {};
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const emitNotificationBadgeRefresh = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore individual listener failures.
    }
  });
};
