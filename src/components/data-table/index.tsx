'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type Table as TTable,
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	type OnChangeFn,
	type PaginationState,
	type Column,
} from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';
import * as React from 'react';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	meta: { limit: number; total: number };
	FilterComp?: React.ElementType<{ table: TTable<TData> }>;
	CreateComp?: React.ElementType;
	TabsComp?: React.ElementType<{ table: TTable<TData> }>;
	isError: boolean;
	isLoading: boolean;
}

export const DataTable = <TData, TValue>({
	columns,
	data,
	meta = { limit: 10, total: 0 },
	FilterComp,
	CreateComp,
	TabsComp,
	isError = false,
	isLoading = true,
}: DataTableProps<TData, TValue>) => {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>([]);

	const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1).withOptions({ shallow: false }));
	const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10).withOptions({ shallow: false }));

	// const onShortingChange: OnChangeFn<SortingState> = (state) => {}

	const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
		const value = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: limit }) : updater;

		setPage(value.pageIndex + 1);
		setLimit(value.pageSize);
	};

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination: { pageIndex: page - 1, pageSize: limit },
		},
		// initialState: {
		// 	columnPinning: {
		// 		left: ['select', 'no'],
		// 		right: ['actions'],
		// 	},
		// },
		enableRowSelection: true,
		manualPagination: true,
		rowCount: meta.total,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	const getCommonPinningStyles = (column: Column<TData>): React.CSSProperties => {
		const isPinned = column.getIsPinned();
		const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
		const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

		return {
			boxShadow: isLastLeftPinnedColumn
				? '-4px 0 4px -4px #DDD inset'
				: isFirstRightPinnedColumn
				? '4px 0 4px -4px #DDD inset'
				: undefined,
			left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
			right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
			// opacity: isPinned ? 0.95 : 1,
			position: isPinned ? 'sticky' : 'relative',
			width: column.getSize(),
			zIndex: isPinned ? 1 : 0,
		};
	};

	if (isLoading) return <LoadingDataTable />;

	return (
		<div className="space-y-4">
			{TabsComp && <TabsComp table={table} />}

			<DataTableToolbar table={table} FilterComp={FilterComp} CreateComp={CreateComp} />

			<div className="rounded-md border overflow-hidden">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const { column } = header;

									return (
										<TableHead
											key={header.id}
											colSpan={header.colSpan}
											style={{ width: header.getSize(), ...getCommonPinningStyles(column) }}
											className="px-3 bg-white [&:has([role=checkbox])]:pr-1"
										>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{!isError && table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
									{row.getVisibleCells().map((cell) => {
										const { column } = cell;

										return (
											<TableCell
												key={cell.id}
												style={{ ...getCommonPinningStyles(column) }}
												className="px-3 bg-white [&:has([role=checkbox])]:pr-1"
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										);
									})}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-30 text-center">
									{isError && 'Error load! '}No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<DataTablePagination table={table} />
		</div>
	);
};

export function LoadingDataTable() {
	return (
		<div className="space-y-4">
			<div className="flex items-center space-x-4 justify-between">
				<Skeleton className="h-6 w-[400px]" />
				<Skeleton className="h-6 w-[200px]" />
			</div>
			<div className="rounded-md border-2 border-muted">
				<Table>
					<TableHeader>
						<TableRow>
							{[...Array(5)].map((_, i) => {
								return (
									<TableHead key={i.toString()} colSpan={1}>
										<Skeleton className="h-4 w-[150px]" />
									</TableHead>
								);
							})}
						</TableRow>
					</TableHeader>
					<TableBody>
						{[...Array(10)].map((_, i) => {
							return (
								<TableRow key={i.toString()}>
									{[...Array(5)].map((_, x) => {
										return (
											<TableCell key={x}>
												<Skeleton className="h-6 w-full" />
											</TableCell>
										);
									})}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center space-x-4 justify-between">
				<Skeleton className="h-6 w-[250px]" />
				<div className="flex items-center space-x-8">
					<Skeleton className="h-6 w-[200px]" />
					<Skeleton className="h-6 w-[300px]" />
				</div>
			</div>
		</div>
	);
}

export * from './data-table-tabs';
