'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/icon';
import { DataTableViewOptions } from './data-table-view-options';
import { useQueryState } from 'nuqs';
import React, { useEffect, useState } from 'react';
import { type Table } from '@tanstack/react-table';

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	FilterComp?: React.ElementType<{ table: Table<TData> }>;
	CreateComp?: React.ElementType;
}

export const DataTableToolbar = <TData,>({ table, FilterComp, CreateComp }: DataTableToolbarProps<TData>) => {
	const [searchInput, setSearchInput] = useState('');
	const [keywords, setKeywords] = useQueryState('keywords', { shallow: false });

	useEffect(() => {
		setSearchInput(keywords ?? '');
	}, [keywords]);

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
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				<form onSubmit={onSubmit}>
					<Input
						placeholder="Filter keywords..."
						value={searchInput ?? ''}
						onChange={(e) => setSearchInput(e.target.value)}
						className="h-8 w-[150px] lg:w-[260px]"
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

			<div className="flex items-center space-x-2">
				<DataTableViewOptions table={table} />

				{CreateComp && <CreateComp />}
			</div>
		</div>
	);
};
