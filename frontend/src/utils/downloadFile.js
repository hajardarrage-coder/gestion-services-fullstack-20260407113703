import axios from 'axios';

const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
};

const buildDownloadUrl = (path) => {
  if (!path) {
    throw new Error('URL de fichier introuvable');
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${getBackendBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
};

const extractFilename = (headers, fallbackName) => {
  const disposition = headers['content-disposition'] || headers['Content-Disposition'];
  const match = disposition?.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);

  if (match?.[1]) {
    return decodeURIComponent(match[1].replace(/"/g, '').trim());
  }

  return fallbackName || 'download';
};

export const downloadProtectedFile = async (path, fallbackName) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  const response = await axios.get(buildDownloadUrl(path), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob',
  });

  const filename = extractFilename(response.headers, fallbackName);
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');

  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
