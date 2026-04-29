'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface SearchableSelectOption {
	value: string;
	label: string;
}

interface SearchableSelectProps {
	options: SearchableSelectOption[];
	value?: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	disabled?: boolean;
	className?: string;
}

export function SearchableSelect({
	options,
	value,
	onValueChange,
	placeholder = 'Pilih...',
	searchPlaceholder = 'Cari...',
	emptyText = 'Tidak ditemukan.',
	disabled,
	className,
}: SearchableSelectProps) {
	const [open, setOpen] = React.useState(false);

	const selectedLabel = options.find((opt) => opt.value === value)?.label;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						'h-10 w-full justify-between px-3 font-normal',
						!selectedLabel && 'text-muted-foreground',
						className,
					)}
				>
					<span className="truncate">{selectedLabel ?? placeholder}</span>
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
									onSelect={() => {
										onValueChange(opt.value);
										setOpen(false);
									}}
								>
									<Check className={cn('mr-2 h-4 w-4', value === opt.value ? 'opacity-100' : 'opacity-0')} />
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
