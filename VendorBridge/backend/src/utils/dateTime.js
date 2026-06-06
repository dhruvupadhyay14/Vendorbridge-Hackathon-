// Date and time utilities
export const getCurrentDate = () => new Date();

export const getDateAfterDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const getDateBeforeDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  const formats = {
    YYYY_MM_DD: `${year}-${month}-${day}`,
    DD_MM_YYYY: `${day}-${month}-${year}`,
    YYYY_MM_DD_HH_MM: `${year}-${month}-${day} ${hours}:${minutes}`,
    ISO: d.toISOString(),
    TIMESTAMP: d.getTime(),
  };

  return formats[format] || formats.YYYY_MM_DD;
};

export const isDateAfter = (date1, date2) => {
  return new Date(date1) > new Date(date2);
};

export const isDateBefore = (date1, date2) => {
  return new Date(date1) < new Date(date2);
};

export const daysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isExpired = (expiryDate) => {
  return new Date(expiryDate) < new Date();
};
