/**
 * Safe LocalStorage wrapper with error handling and fallback
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  },
};

export default storage;
