import * as React from 'react';
import { cn } from '@/libs/utils';

interface EmptyStateProps {
	icon?: React.ReactNode;
	title?: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

export function EmptyState({
	icon,
	title = 'Tidak ada data',
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
			{icon && (
				<div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
					{icon}
				</div>
			)}
			<div className="space-y-1">
				<p className="text-sm font-medium">{title}</p>
				{description && <p className="text-xs text-muted-foreground">{description}</p>}
			</div>
			{action && <div className="mt-1">{action}</div>}
		</div>
	);
}
