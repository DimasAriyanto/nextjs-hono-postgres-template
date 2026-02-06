import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Icon } from '../icon';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	title: string;
}

export const DataTableColumnHeader = <TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) => {
	if (!column.getCanSort()) {
		return <div className={cn(className)}>{title}</div>;
	}

	const onPinned = () => {
		if (column.getIsPinned()) return column.pin(false);
		column.pin('left');
	};

	return (
		<div className={cn('flex items-center ml-1 space-x-2', className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
						<span>{title}</span>
						{column.getIsSorted() === 'desc' ? (
							<ArrowDown />
						) : column.getIsSorted() === 'asc' ? (
							<ArrowUp />
						) : (
							<ChevronsUpDown />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuItem onClick={() => column.toggleSorting(false)}>
						<Icon name="ArrowUp" className="h-2 w-2 text-muted-foreground/70" />
						Asc
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => column.toggleSorting(true)}>
						<Icon name="ArrowDown" className="h-2 w-2 text-muted-foreground/70" />
						Desc
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onPinned}>
						<Icon name="PanelLeftClose" className="h-2 w-2 text-muted-foreground/70" />
						{column.getIsPinned() ? 'Release' : 'Pin'}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
						<Icon name="EyeOff" className="h-2 w-2 text-muted-foreground/70" />
						Hide
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
