'use client';

import { Bell, BellDot, CheckCheck, Clock, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import {
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useUnreadNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/use-notification';
import type { TNotification, TNotificationType } from '@/contracts/notification';

// ── Icon per type ──────────────────────────────────────────────────────────────

function NotificationIcon({ type, isRead }: { type: TNotificationType; isRead: boolean }) {
	const iconClass = 'size-4';
	const icon = (() => {
		switch (type) {
			case 'success': return <CheckCircle className={iconClass} />;
			case 'warning': return <AlertTriangle className={iconClass} />;
			case 'error': return <XCircle className={iconClass} />;
			default: return <Info className={iconClass} />;
		}
	})();

	const colorClass = (() => {
		if (isRead) return 'bg-muted text-muted-foreground';
		switch (type) {
			case 'success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
			case 'warning': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
			default: return 'bg-foreground/10 text-foreground';
		}
	})();

	return (
		<div className={cn('flex h-8 w-8 items-center justify-center rounded-full shrink-0', colorClass)}>
			{icon}
		</div>
	);
}

// ── Single item ────────────────────────────────────────────────────────────────

function NotificationItem({
	notification,
	onMarkAsRead,
}: {
	notification: TNotification;
	onMarkAsRead: (id: string) => void;
}) {
	return (
		<div
			className={cn(
				'flex gap-3 p-3 rounded-md cursor-pointer transition-colors hover:bg-muted/50 relative',
				!notification.is_read && 'bg-muted/30'
			)}
			onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
		>
			<NotificationIcon type={notification.type} isRead={notification.is_read} />

			<div className="flex-1 min-w-0 space-y-0.5">
				<p className={cn('text-sm font-medium truncate', !notification.is_read && 'text-foreground')}>
					{notification.title}
				</p>
				<p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
				<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
					<Clock className="size-3" />
					{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
				</div>
			</div>

			{!notification.is_read && (
				<span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-foreground shrink-0" />
			)}
		</div>
	);
}

// ── Notification menu ─────────────────────────────────────────────────────────

export function NotificationMenu() {
	const { data, isLoading } = useUnreadNotifications();
	const { mutate: markAsRead } = useMarkAsRead();
	const { mutate: markAllAsRead, isPending } = useMarkAllAsRead();

	const notifications = data?.data?.data ?? [];
	const unreadCount = data?.data?.unread_count ?? 0;
	const hasUnread = unreadCount > 0;

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				{hasUnread ? <BellDot className="size-4" /> : <Bell className="size-4" />}
				Notifications
				{hasUnread && (
					<span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
						{unreadCount > 9 ? '9+' : unreadCount}
					</span>
				)}
			</DropdownMenuSubTrigger>

			<DropdownMenuSubContent className="w-80 p-0">
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3">
					<div>
						<p className="text-sm font-semibold">Notifications</p>
						{hasUnread && (
							<p className="text-xs text-muted-foreground">{unreadCount} unread</p>
						)}
					</div>
					{hasUnread && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 gap-1.5 text-xs"
							onClick={() => markAllAsRead()}
							disabled={isPending}
						>
							<CheckCheck className="size-3" />
							Mark all read
						</Button>
					)}
				</div>

				<Separator />

				{/* List */}
				<div className="max-h-80 overflow-y-auto">
					{isLoading ? (
						<div className="p-2 space-y-1">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="flex gap-3 p-3">
									<Skeleton className="size-8 shrink-0 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-3.5 w-3/4" />
										<Skeleton className="h-3 w-full" />
									</div>
								</div>
							))}
						</div>
					) : notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
							<Bell className="size-8 mb-2 opacity-40" />
							<p className="text-sm">No notifications</p>
						</div>
					) : (
						<div className="p-2 space-y-1">
							{notifications.map((n) => (
								<NotificationItem
									key={n.id}
									notification={n}
									onMarkAsRead={markAsRead}
								/>
							))}
						</div>
					)}
				</div>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}
