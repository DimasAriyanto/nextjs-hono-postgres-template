'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';

interface NumberInputProps {
	value?: number;
	onChange?: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	className?: string;
}

export function NumberInput({
	value = 0,
	onChange,
	min = -Infinity,
	max = Infinity,
	step = 1,
	disabled,
	className,
}: NumberInputProps) {
	const clamp = (val: number) => Math.min(max, Math.max(min, val));

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const parsed = parseFloat(e.target.value);
		if (!isNaN(parsed)) onChange?.(clamp(parsed));
	};

	const decrement = () => onChange?.(clamp(value - step));
	const increment = () => onChange?.(clamp(value + step));

	return (
		<div className={cn('flex h-9 items-center rounded-md border bg-background', className)}>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="h-full rounded-r-none border-r"
				onClick={decrement}
				disabled={disabled || value <= min}
			>
				<Minus className="size-3" />
			</Button>
			<input
				type="number"
				value={value}
				onChange={handleChange}
				disabled={disabled}
				min={min}
				max={max}
				step={step}
				className="h-full w-14 flex-1 bg-transparent px-2 text-center text-sm tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="h-full rounded-l-none border-l"
				onClick={increment}
				disabled={disabled || value >= max}
			>
				<Plus className="size-3" />
			</Button>
		</div>
	);
}
