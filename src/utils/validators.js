export const isRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined;
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Strip out any accidental spaces or dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  // Accepts an optional '+', followed by 9 to 15 digits
  return /^\+?\d{9,15}$/.test(cleaned);
};

export const isPositiveNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};