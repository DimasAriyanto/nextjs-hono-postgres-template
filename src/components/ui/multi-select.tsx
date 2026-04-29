'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface MultiSelectOption {
	value: string;
	label: string;
}

interface MultiSelectProps {
	options: MultiSelectOption[];
	value?: string[];
	onValueChange: (value: string[]) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	disabled?: boolean;
	maxDisplay?: number;
	className?: string;
}

export function MultiSelect({
	options,
	value = [],
	onValueChange,
	placeholder = 'Pilih...',
	searchPlaceholder = 'Cari...',
	emptyText = 'Tidak ditemukan.',
	disabled,
	maxDisplay = 3,
	className,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const toggle = (optValue: string) => {
		const next = value.includes(optValue)
			? value.filter((v) => v !== optValue)
			: [...value, optValue];
		onValueChange(next);
	};

	const remove = (optValue: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onValueChange(value.filter((v) => v !== optValue));
	};

	const selectedLabels = value
		.map((v) => options.find((o) => o.value === v)?.label)
		.filter(Boolean) as string[];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						'h-auto min-h-10 w-full justify-between px-3 font-normal',
						!value.length && 'text-muted-foreground',
						className,
					)}
				>
					<div className="flex flex-wrap gap-1">
						{value.length === 0 && <span>{placeholder}</span>}
						{selectedLabels.slice(0, maxDisplay).map((label, i) => (
							<Badge key={value[i]} variant="secondary" className="gap-1 pr-1">
								{label}
								<span
									role="button"
									tabIndex={0}
									className="rounded-sm opacity-60 hover:opacity-100 cursor-pointer"
									onClick={(e) => remove(value[i], e)}
									onKeyDown={(e) => e.key === 'Enter' && remove(value[i], e as unknown as React.MouseEvent)}
								>
									<X className="size-3" />
								</span>
							</Badge>
						))}
						{value.length > maxDisplay && (
							<Badge variant="secondary">+{value.length - maxDisplay} lainnya</Badge>
						)}
					</div>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyText}</CommandEmpty>
						<CommandGroup>
							{options.map((opt) => (
								<CommandItem
									key={opt.value}
									value={opt.label}
									onSelect={() => toggle(opt.value)}
								>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											value.includes(opt.value) ? 'opacity-100' : 'opacity-0',
										)}
									/>
									{opt.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
