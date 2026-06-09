export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'KES 0';
  return new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES', 
    minimumFractionDigits: 0 
  }).format(amount);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

export const statusLabel = (status) => {
  return status || 'Unknown';
};

export const calcBalance = (price, paid) => {
  const safePrice = Number(price) || 0;
  const safePaid = Number(paid) || 0;
  
  const balance = safePrice - safePaid;
  return balance < 0 ? 0 : balance; // Prevents negative balance on overpayment
};

export const toSupabaseEmail = (username) => {
  if (!username) return '';
  return `${username.trim().toLowerCase().replace(/\s+/g, '')}@oss.local`;
};

export const fromSupabaseEmail = (email) => {
  if (!email) return '';
  return email.replace('@oss.local', '');
};