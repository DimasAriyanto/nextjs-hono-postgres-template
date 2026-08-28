'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/icon';
import { DataTableViewOptions } from './data-table-view-options';
import { useQueryState } from 'nuqs';
import React, { useState } from 'react';
import { type LegacyReactTable as Table } from '@tanstack/react-table/legacy';
import type { RowData } from '@tanstack/react-table';

interface DataTableToolbarProps<TData extends RowData> {
	table: Table<TData>;
	FilterComp?: React.ElementType<{ table: Table<TData> }>;
	CreateComp?: React.ElementType;
	ExportComp?: React.ElementType;
}

export const DataTableToolbar = <TData extends RowData,>({ table, FilterComp, CreateComp, ExportComp }: DataTableToolbarProps<TData>) => {
	const [keywords, setKeywords] = useQueryState('keywords', { shallow: false });
	const [searchInput, setSearchInput] = useState(keywords ?? '');
	const [prevKeywords, setPrevKeywords] = useState(keywords);

	if (keywords !== prevKeywords) {
		setPrevKeywords(keywords);
		setSearchInput(keywords ?? '');
	}

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setKeywords(searchInput);
	};

	const onResetFilter = () => {
		setKeywords(null);
		table.resetColumnFilters();
	};

	const isFiltered = table && table.getState()?.columnFilters?.length > 0;

	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<form onSubmit={onSubmit} className="flex-shrink-0">
					<Input
						placeholder="Filter keywords..."
						value={searchInput ?? ''}
						onChange={(e) => setSearchInput(e.target.value)}
						className="h-8 w-full sm:w-[150px] lg:w-[260px]"
					/>
				</form>

				{FilterComp && <FilterComp table={table} />}

				{(isFiltered || keywords) && (
					<Button variant="ghost" onClick={onResetFilter} className="h-8 px-2 lg:px-3">
						Reset
						<Icon name="X" />
					</Button>
				)}
			</div>

			<div className="flex flex-shrink-0 items-center gap-2">
				<DataTableViewOptions table={table} />

				{ExportComp && <ExportComp />}
				{CreateComp && <CreateComp />}
			</div>
		</div>
	);
};
