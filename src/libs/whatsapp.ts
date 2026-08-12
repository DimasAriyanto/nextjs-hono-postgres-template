/**
 * WhatsApp utilities for building URLs and messages
 */

/**
 * Format a phone number for wa.me links (digits only — wa.me wants the country
 * code + number with no "+"). Expects an E.164 string (e.g. "+6285259731651",
 * "+14155552671") since that's what PhoneInput stores — stripping non-digits
 * is enough regardless of country, no need to special-case "0" → "62" anymore.
 * @param phone - E.164 phone number, e.g. "+6285259731651"
 * @returns Digits-only phone number, e.g. "6285259731651"
 */
const formatPhoneToWA = (phone: string): string => {
	if (!phone) return '';
	return phone.replace(/\D/g, '');
};

/**
 * Build WhatsApp URL with formatted phone and encoded message
 * @param phone - Phone number (will be formatted automatically)
 * @param message - Message text (will be URL encoded)
 * @returns Complete WhatsApp URL
 */
export const buildWhatsAppUrl = (phone: string | undefined, message: string): string => {
	if (!phone) return '';
	const formattedPhone = formatPhoneToWA(phone);
	if (!formattedPhone) return '';
	
	return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Build WhatsApp URL for subscription plan inquiry
 * @param phone - Admin/support phone number
 * @param planName - Subscription plan name
 * @returns WhatsApp URL with plan inquiry message
 */
export const buildPlanInquiryUrl = (phone: string | undefined, planName: string): string => {
	const message = `Hello, I would like to upgrade to the ${planName} plan. Could you help me with the process?`;
	return buildWhatsAppUrl(phone, message);
};

/**
 * Build WhatsApp URL for onboarding plan subscription
 * @param phone - Admin/support phone number  
 * @param planName - Subscription plan name
 * @returns WhatsApp URL with onboarding subscription message
 */
export const buildOnboardingPlanUrl = (phone: string | undefined, planName: string): string => {
	const message = `Hello, I just signed up and would like to subscribe to the ${planName} plan. Could you help me with the process?`;
	return buildWhatsAppUrl(phone, message);
};

/**
 * Build WhatsApp URL for invoice payment reminder
 * @param phone - Customer phone number
 * @param invoiceNumber - Invoice number
 * @param total - Total amount (formatted)
 * @param invoiceId - Invoice ID for link
 * @returns WhatsApp URL with payment reminder message
 */
export const buildInvoicePaymentUrl = (
	phone: string, 
	invoiceNumber: string, 
	total: string, 
	invoiceId: string
): string => {
	const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
	const invoiceLink = `${baseUrl}/invoice/${invoiceId}`;
	
	const message = [
		`Hello! This is a payment reminder for invoice *${invoiceNumber}*`,
		'',
		`Total: *${total}*`,
		'',
		`Invoice link: ${invoiceLink}`,
		'',
		'Thank you! 🙏'
	].join('\n');
	
	return buildWhatsAppUrl(phone, message);
};

/**
 * Build WhatsApp URL for customer contact
 * @param phone - Customer phone number
 * @param customerName - Customer name
 * @param context - Additional context (rental, payment, etc.)
 * @returns WhatsApp URL with customer contact message
 */
export const buildCustomerContactUrl = (
	phone: string, 
	customerName: string, 
	context?: string
): string => {
	const contextText = context ? ` regarding ${context}` : '';
	const message = `Hello ${customerName}! We have something to ask you${contextText}. Thank you! 🙏`;
	return buildWhatsAppUrl(phone, message);
};

/**
 * Open WhatsApp in new window/tab
 * @param url - WhatsApp URL
 * @param target - Window target (default: _blank)
 */
export const openWhatsApp = (url: string, target: string = '_blank'): void => {
	if (!url) return;
	
	const windowFeatures = target === '_blank' 
		? 'noopener,noreferrer' 
		: undefined;
		
	window.open(url, target, windowFeatures);
};

/**
 * Share message via WhatsApp (no specific contact)
 * @param message - Message to share
 */
export const shareViaWhatsApp = (message: string): void => {
	const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
	openWhatsApp(url);
};