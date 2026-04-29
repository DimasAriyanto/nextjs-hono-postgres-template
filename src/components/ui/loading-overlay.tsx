import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/libs/utils';

interface LoadingOverlayProps {
	show?: boolean;
	label?: string;
	fullScreen?: boolean;
	className?: string;
}

export function LoadingOverlay({
	show = true,
	label = 'Memuat...',
	fullScreen = false,
	className,
}: LoadingOverlayProps) {
	if (!show) return null;

	return (
		<div
			className={cn(
				'flex items-center justify-center bg-background/80 backdrop-blur-sm z-50',
				fullScreen ? 'fixed inset-0' : 'absolute inset-0 rounded-md',
				className,
			)}
		>
			<div className="flex flex-col items-center gap-2">
				<Loader2 className="size-6 animate-spin text-primary" />
				{label && <p className="text-sm text-muted-foreground">{label}</p>}
			</div>
		</div>
	);
}
