export const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

export const readingMinutes = (content = '') => {
  const words = String(content).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

export const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.message || fallback;
