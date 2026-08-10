'use client';

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Icon } from '../icon';
import { type LegacyTable as Table } from '@tanstack/react-table/legacy';
import type { RowData } from '@tanstack/react-table';

interface DataTableViewOptionsProps<TData extends RowData> {
	table: Table<TData>;
}

export const DataTableViewOptions = <TData extends RowData,>({ table }: DataTableViewOptionsProps<TData>) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
					<Icon name="Settings2" />
					View
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[150px]">
				<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{table
					.getAllColumns()
					.filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
					.map((column) => {
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={(value: boolean) => column.toggleVisibility(!!value)}
							>
								{column.id.split('_').join(' ')}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
