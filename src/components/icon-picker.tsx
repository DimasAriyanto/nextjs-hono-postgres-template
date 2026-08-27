'use client';

import { useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Icon, type IconName } from '@/components/icon';
import { ICON_NAMES } from '@/components/icon-names';
import { cn } from '@/libs/utils';

interface IconPickerProps {
	value: IconName | string;
	onChange: (value: IconName) => void;
	disabled?: boolean;
	className?: string;
}

export function IconPicker({ value, onChange, disabled, className }: IconPickerProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn('w-full justify-between font-normal', className)}
				>
					<span className="flex items-center gap-2 truncate">
						<Icon name={(value || 'HelpCircle') as IconName} className="size-4 shrink-0 text-muted-foreground" />
						{value || 'Select icon...'}
					</span>
					<ChevronsUpDown className="size-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
				<Command>
					<CommandInput placeholder="Search icons..." />
					<CommandList>
						<CommandEmpty>No icon found.</CommandEmpty>
						<CommandGroup>
							{ICON_NAMES.map((name) => (
								<CommandItem
									key={name}
									value={name}
									onSelect={() => {
										onChange(name);
										setOpen(false);
									}}
									className="gap-2"
								>
									<Icon name={name} className="size-4 shrink-0" />
									<span className="truncate">{name}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
