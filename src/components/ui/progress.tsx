'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/libs/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
	showLabel?: boolean;
}

function Progress({ className, value = 0, showLabel, ...props }: ProgressProps) {
	return (
		<div className="flex items-center gap-2">
			<ProgressPrimitive.Root
				data-slot="progress"
				className={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}
				value={value}
				{...props}
			>
				<ProgressPrimitive.Indicator
					className="bg-primary h-full w-full flex-1 transition-all"
					style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
				/>
			</ProgressPrimitive.Root>
			{showLabel && (
				<span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
					{value}%
				</span>
			)}
		</div>
	);
}

export { Progress };
