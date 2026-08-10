/**
 * Calculate pagination info
 */
export const calculatePagination = (total: number, limit: number) => {
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
  return { totalPages };
};

/**
 * Safe page number calculation
 */
export const getSafePage = (page?: number): number => {
  return Math.max(1, Number(page) || 1);
};

/**
 * Safe limit calculation with bounds
 */
export const getSafeLimit = (limit?: number, min = 1, max = 100): number => {
  return Math.min(max, Math.max(min, Number(limit) || 10));
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Calculate tax amount
 */
export const calculateTax = (amount: number, taxRate: number): number => {
  return Math.round((amount * taxRate) / 100);
};

/**
 * Calculate deposit amount
 */
export const calculateDeposit = (amount: number, depositPercentage: number): number => {
  return Math.round((amount * depositPercentage) / 100);
};

/**
 * Calculate remaining amount (never negative)
 */
export const calculateRemaining = (total: number, paid: number): number => {
  return Math.max(0, total - paid);
};

/**
 * Generate random OTP
 */
export const generateOTP = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

/**
 * Round to nearest decimal places
 */
export const roundTo = (value: number, decimals = 2): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

/**
 * Calculate availability percentage
 */
export const calculateAvailabilityRate = (totalDays: number, rentedDays: number): number => {
  if (totalDays === 0) return 0;
  const availableDays = Math.max(0, totalDays - rentedDays);
  return Math.round((availableDays / totalDays) * 100);
};