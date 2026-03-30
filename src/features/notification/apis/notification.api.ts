import type { ApiSuccessResponse } from '@/types/api-response';
import type { TNotification, TCreateNotificationRequest } from '@/contracts/notification';

const BASE = '/api/v1/notifications';

async function apiFetch<T>(url: string, init?: RequestInit): Promise<ApiSuccessResponse<T>> {
	const res = await fetch(url, { credentials: 'include', ...init });
	const json = await res.json();
	if (!res.ok) throw new Error(json.message ?? 'Request failed');
	return json as ApiSuccessResponse<T>;
}

export type TNotificationsResponse = {
	data: TNotification[];
	meta: { page: number; limit: number; total: number; pages: number };
};

export type TUnreadResponse = {
	data: TNotification[];
	unread_count: number;
};

export function getNotifications(params?: { page?: number; limit?: number; is_read?: boolean }) {
	const q = new URLSearchParams();
	if (params?.page) q.set('page', String(params.page));
	if (params?.limit) q.set('limit', String(params.limit));
	if (params?.is_read !== undefined) q.set('is_read', String(params.is_read));
	return apiFetch<TNotificationsResponse>(`${BASE}?${q}`);
}

export function getUnreadNotifications() {
	return apiFetch<TUnreadResponse>(`${BASE}/unread`);
}

export function getNotificationById(id: string) {
	return apiFetch<TNotification>(`${BASE}/${id}`);
}

export function createNotification(data: TCreateNotificationRequest) {
	return apiFetch<TNotification>(BASE, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export function markAsRead(id: string) {
	return apiFetch<TNotification>(`${BASE}/${id}/read`, { method: 'PUT' });
}

export function markAllAsRead() {
	return apiFetch<null>(`${BASE}/read-all`, { method: 'PUT' });
}

export function deleteNotification(id: string) {
	return apiFetch<null>(`${BASE}/${id}`, { method: 'DELETE' });
}
