import { cn } from '@/libs/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Icon } from '../icon';
import { type Column } from '@tanstack/react-table';
import { parseAsString, useQueryState } from 'nuqs';
import { type ComponentType } from 'react';

interface DataTableFacetedFilterProps<TData, TValue> {
	column?: Column<TData, TValue>;
	paramName?: string;
	title?: string;
	options: {
		label: string;
		value: string;
		icon?: ComponentType<{ className?: string }>;
	}[];
}

export const DataTableFacetedFilter = <TData, TValue>({ column, paramName, title, options }: DataTableFacetedFilterProps<TData, TValue>) => {
	// Server-side filtering with nuqs
	const [serverValue, setServerValue] = useQueryState(
		paramName || 'filter',
		parseAsString.withOptions({ shallow: false })
	);

	// Client-side filtering with column
	const facets = column?.getFacetedUniqueValues();
	const clientSelectedValues = new Set(column?.getFilterValue() as string[]);

	// Determine if using server-side or client-side filtering
	const isServerSide = !!paramName && !column;
	const isClientSide = !!column;

	// Get current selection
	const hasSelection = isServerSide ? !!serverValue : clientSelectedValues.size > 0;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="h-8 border-dashed">
					<Icon name="PlusCircle" />
					{title}
					{hasSelection && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							{isServerSide ? (
								<Badge variant="secondary" className="rounded-sm px-1 font-normal">
									{options.find((opt) => opt.value === serverValue)?.label || serverValue}
								</Badge>
							) : (
								<>
									<Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
										{clientSelectedValues.size}
									</Badge>
									<div className="hidden space-x-1 lg:flex">
										{clientSelectedValues.size > 2 ? (
											<Badge variant="secondary" className="rounded-sm px-1 font-normal">
												{clientSelectedValues.size} selected
											</Badge>
										) : (
											options
												.filter((option) => clientSelectedValues.has(option.value))
												.map((option) => (
													<Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-normal">
														{option.label}
													</Badge>
												))
										)}
									</div>
								</>
							)}
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = isServerSide
									? serverValue === option.value
									: clientSelectedValues.has(option.value);

								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											if (isServerSide) {
												// Server-side: single selection
												setServerValue(isSelected ? null : option.value);
											} else if (isClientSide) {
												// Client-side: multiple selection
												if (isSelected) {
													clientSelectedValues.delete(option.value);
												} else {
													clientSelectedValues.add(option.value);
												}
												const filterValues = Array.from(clientSelectedValues);
												column?.setFilterValue(filterValues?.length ? filterValues : undefined);
											}
										}}
									>
										<div
											className={cn(
												'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
												isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
											)}
										>
											<Icon name="Check" className="h-2 w-2 dark:text-white text-inherit" />
										</div>
										{option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
										<span>{option.label}</span>
										{isClientSide && facets?.get(option.value) && (
											<span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
												{facets.get(option.value)}
											</span>
										)}
									</CommandItem>
								);
							})}
						</CommandGroup>
						{hasSelection && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => {
											if (isServerSide) {
												setServerValue(null);
											} else if (isClientSide) {
												column?.setFilterValue(undefined);
											}
										}}
										className="justify-center text-center"
									>
										Clear filter{isClientSide && clientSelectedValues.size > 1 ? 's' : ''}
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
