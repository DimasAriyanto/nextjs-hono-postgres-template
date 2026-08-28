import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '../icon';
import { type LegacyReactTable as Table } from '@tanstack/react-table/legacy';
import type { RowData } from '@tanstack/react-table';

interface DataTablePaginationProps<TData extends RowData> {
	table: Table<TData>;
}

// {table.getFilteredRowModel().rows?.length ?? 0} -> rows by limit

export const DataTablePagination = <TData extends RowData,>({ table }: DataTablePaginationProps<TData>) => {
	return (
		<div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
			{/* Selected rows — hidden on mobile to save space */}
			<div className="hidden flex-1 text-sm text-muted-foreground sm:block">
				{table.getFilteredSelectedRowModel().rows?.length ?? 0} of {table.getRowCount()} row(s) selected.
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
				{/* Rows per page */}
				<div className="flex items-center gap-2">
					<p className="hidden text-sm font-medium sm:block">Rows per page</p>
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value: '10' | '20' | '30' | '40' | '50' | '100' | 'All') => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Page indicator */}
				<div className="flex w-[100px] items-center justify-center text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() === 0 ? 1 : table.getPageCount()}
				</div>

				{/* Nav buttons */}
				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to first page</span>
						<Icon name="ChevronsLeft" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to previous page</span>
						<Icon name="ChevronLeft" />
					</Button>
					<Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
						<span className="sr-only">Go to next page</span>
						<Icon name="ChevronRight" />
					</Button>
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to last page</span>
						<Icon name="ChevronsRight" />
					</Button>
				</div>
			</div>
		</div>
	);
};
