'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';

interface NumberInputBaseProps {
	min?: number;
	max?: number;
	step?: number;
	// Opt in for quantities that are genuinely fractional (0.5 kg of ingredient, 0.25 production
	// batch, ...) — default behaviour (whole numbers, like a cart or stock count) is unchanged.
	// Also switches the on-screen keyboard on mobile to one with a decimal separator key.
	decimal?: boolean;
	disabled?: boolean;
	/** Wrapper classes (border, height, radius). */
	className?: string;
	/** Classes for the text field itself — font size, weight, alignment. */
	inputClassName?: string;
	/** Classes for both −/+ buttons. */
	buttonClassName?: string;
	/** Drops the −/+ buttons — for values like a percentage where stepping by one isn't how people enter them. */
	hideControls?: boolean;
	placeholder?: string;
	id?: string;
	name?: string;
	'aria-label'?: string;
}

interface NumberInputRequiredProps extends NumberInputBaseProps {
	allowEmpty?: false;
	value?: number;
	onChange?: (value: number) => void;
}

/**
 * `allowEmpty` lets the field sit blank (`null`) until the user types — for forms that must not
 * prefill a number. Clearing the field reports `null` instead of snapping back to the last value.
 */
interface NumberInputEmptyProps extends NumberInputBaseProps {
	allowEmpty: true;
	value: number | null | undefined;
	onChange?: (value: number | null) => void;
}

type NumberInputProps = NumberInputRequiredProps | NumberInputEmptyProps;

export function NumberInput(props: NumberInputProps) {
	const {
		min = -Infinity,
		max = Infinity,
		step,
		decimal = false,
		disabled,
		className,
		inputClassName,
		buttonClassName,
		hideControls = false,
		placeholder,
		id,
		name,
		'aria-label': ariaLabel,
	} = props;
	const allowEmpty = props.allowEmpty === true;
	const value: number | null = allowEmpty ? (props.value ?? null) : (props.value ?? 0);
	const emit = props.onChange as ((value: number | null) => void) | undefined;

	// A caller's own `step` always wins; otherwise fractional mode nudges by hundredths instead of
	// whole units.
	const resolvedStep = step ?? (decimal ? 0.01 : 1);
	const clamp = (val: number) => Math.min(max, Math.max(min, val));
	// Repeated +/- clicks in decimal mode would otherwise drift (0.1 + 0.2 = 0.30000000000000004)
	// — round to the same precision the ingredient-quantity columns are stored at.
	const round = (val: number) => (decimal ? Math.round(val * 1000) / 1000 : val);
	const toText = (val: number | null) => (val === null ? '' : String(val));

	// Mirrors `value` as text so the field can sit empty while the user is
	// still typing (e.g. clearing a single digit to type a new one) instead of
	// being forced back to the last committed number on every keystroke.
	const [rawValue, setRawValue] = React.useState(toText(value));
	const [prevValue, setPrevValue] = React.useState(value);

	if (value !== prevValue) {
		setPrevValue(value);
		setRawValue(toText(value));
	}

	// In decimal mode, a comma is accepted as a decimal separator too (common on Indonesian
	// keyboards/locales) and normalized to a dot before parsing.
	const toParseable = (raw: string) => (decimal ? raw.replace(',', '.') : raw);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value;
		setRawValue(next);

		if (next === '') {
			if (allowEmpty && value !== null) emit?.(null);
			return;
		}
		if (next === '-') return;
		// Mid-typing a decimal (e.g. "0." or "0,") would otherwise get dropped by parseFloat on
		// every keystroke, making it impossible to type past the separator.
		if (decimal && /[.,]$/.test(next)) return;

		const parsed = parseFloat(toParseable(next));
		if (isNaN(parsed)) return;
		// Below `min` is usually a number still being typed ("4" on the way to "45" with min 30) —
		// leave it alone until blur instead of snapping to the bound mid-keystroke.
		if (parsed < min) return;
		emit?.(round(clamp(parsed)));
	};

	const handleBlur = () => {
		const parsed = parseFloat(toParseable(rawValue));
		if (isNaN(parsed)) {
			setRawValue(toText(allowEmpty ? null : value));
			if (allowEmpty && value !== null) emit?.(null);
			return;
		}
		const clamped = round(clamp(parsed));
		setRawValue(String(clamped));
		if (clamped !== value) emit?.(clamped);
	};

	// From an empty field the first click lands on the lower bound (or zero) rather than on ±step.
	const start = Number.isFinite(min) ? min : 0;
	const decrement = () => emit?.(value === null ? clamp(start) : round(clamp(value - resolvedStep)));
	const increment = () => emit?.(value === null ? clamp(start) : round(clamp(value + resolvedStep)));

	return (
		<div className={cn('flex h-9 items-center rounded-md border bg-background', className)}>
			{!hideControls && (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Reduce"
					className={cn('h-full rounded-r-none border-r', buttonClassName)}
					onClick={decrement}
					disabled={disabled || (value !== null && value <= min)}
				>
					<Minus className="size-3" />
				</Button>
			)}
			<input
				type="number"
				inputMode={decimal ? 'decimal' : 'numeric'}
				id={id}
				name={name}
				aria-label={ariaLabel}
				placeholder={placeholder}
				value={rawValue}
				onChange={handleChange}
				onBlur={handleBlur}
				disabled={disabled}
				min={Number.isFinite(min) ? min : undefined}
				max={Number.isFinite(max) ? max : undefined}
				step={resolvedStep}
				className={cn(
					'h-full w-14 min-w-0 flex-1 bg-transparent px-2 text-center text-sm tabular-nums outline-none placeholder:text-ink-400 [appearance:textfield] disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
					hideControls && 'text-left',
					inputClassName
				)}
			/>
			{!hideControls && (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Increase"
					className={cn('h-full rounded-l-none border-l', buttonClassName)}
					onClick={increment}
					disabled={disabled || (value !== null && value >= max)}
				>
					<Plus className="size-3" />
				</Button>
			)}
		</div>
	);
}
