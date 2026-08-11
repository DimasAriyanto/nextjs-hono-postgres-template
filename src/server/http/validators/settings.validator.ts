import { updateSettingSchema } from '@/contracts';
import { validateJson } from './helper';

/**
 * Update settings request validator
 */
export const updateSettingRequest = validateJson(updateSettingSchema);
