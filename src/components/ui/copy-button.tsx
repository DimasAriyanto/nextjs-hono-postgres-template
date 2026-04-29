'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';

interface CopyButtonProps
	extends React.ComponentProps<'button'>,
		VariantProps<typeof buttonVariants> {
	value: string;
	timeout?: number;
}

export function CopyButton({
	value,
	timeout = 2000,
	className,
	variant = 'ghost',
	size = 'icon-sm',
	...props
}: CopyButtonProps) {
	const [copied, setCopied] = React.useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), timeout);
		} catch {
			// fallback for older browsers
			const el = document.createElement('textarea');
			el.value = value;
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
			setCopied(true);
			setTimeout(() => setCopied(false), timeout);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			className={cn(className)}
			onClick={handleCopy}
			aria-label={copied ? 'Disalin!' : 'Salin'}
			{...props}
		>
			{copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
		</Button>
	);
}
