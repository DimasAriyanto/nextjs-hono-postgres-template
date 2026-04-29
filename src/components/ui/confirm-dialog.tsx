'use client';

import * as React from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/libs/utils';
import { buttonVariants } from '@/components/ui/button';

interface ConfirmDialogProps {
	trigger: React.ReactNode;
	title?: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: 'destructive' | 'default';
	onConfirm: () => void | Promise<void>;
	disabled?: boolean;
}

export function ConfirmDialog({
	trigger,
	title = 'Apakah kamu yakin?',
	description = 'Tindakan ini tidak dapat dibatalkan.',
	confirmLabel = 'Ya, lanjutkan',
	cancelLabel = 'Batal',
	variant = 'destructive',
	onConfirm,
	disabled,
}: ConfirmDialogProps) {
	const [loading, setLoading] = React.useState(false);

	const handleConfirm = async () => {
		setLoading(true);
		try {
			await onConfirm();
		} finally {
			setLoading(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild disabled={disabled}>
				{trigger}
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
					<AlertDialogAction
						disabled={loading}
						className={cn(buttonVariants({ variant }))}
						onClick={handleConfirm}
					>
						{loading ? 'Memproses...' : confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
