/**
 * Phone number utilities for Indonesian phone numbers
 */

/**
 * Format Indonesian phone number for WhatsApp (convert 08xx to 628xx)
 * @param phone - Raw phone number
 * @returns Formatted phone number for WhatsApp (628xxxxxxxx)
 */
export const formatPhoneToWA = (phone: string): string => {
	if (!phone) return '';
	return phone.replace(/\D/g, '').replace(/^0/, '62');
};

/**
 * Format phone number for display with proper Indonesian format
 * @param phone - Raw phone number  
 * @returns Formatted phone for display (+62 8xx-xxxx-xxxx)
 */
export const formatPhoneDisplay = (phone: string): string => {
	if (!phone) return '';
	const cleaned = phone.replace(/\D/g, '');
	
	// Convert to 62 format if starts with 0
	const formatted = cleaned.replace(/^0/, '62');
	
	// Add formatting: +62 8xx-xxxx-xxxx
	if (formatted.startsWith('62')) {
		const withoutCountry = formatted.slice(2);
		if (withoutCountry.length >= 10) {
			return `+62 ${withoutCountry.slice(0, 3)}-${withoutCountry.slice(3, 7)}-${withoutCountry.slice(7)}`;
		}
	}
	
	return `+${formatted}`;
};

/**
 * Validate Indonesian phone number
 * @param phone - Phone number to validate
 * @returns true if valid Indonesian phone number
 */
export const isValidIndonesianPhone = (phone: string): boolean => {
	if (!phone) return false;
	const cleaned = phone.replace(/\D/g, '');
	
	// Indonesian phone: starts with 08 (local) or 628 (international)
	// Length: 10-13 digits for local format, 12-15 for international
	return /^(08|628)[0-9]{8,12}$/.test(cleaned);
};

/**
 * Clean phone number (remove all non-digits)
 * @param phone - Raw phone number
 * @returns Clean phone number with digits only
 */
export const cleanPhone = (phone: string): string => {
	if (!phone) return '';
	return phone.replace(/\D/g, '');
};