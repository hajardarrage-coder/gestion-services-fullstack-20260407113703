export const getApiBaseCandidates = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  const defaults = import.meta.env.DEV
    ? [
        'http://127.0.0.1:8000/api',
        'http://localhost:8000/api',
      ]
    : [];

  return [...new Set([configured, ...defaults].filter(Boolean))];
};
