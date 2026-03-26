export const readLocalJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const writeLocalJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const readSessionJSON = (key, fallback) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const writeSessionJSON = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};
