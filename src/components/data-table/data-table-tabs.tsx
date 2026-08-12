'use client';

import { type LegacyTable as Table } from '@tanstack/react-table/legacy';
import type { RowData } from '@tanstack/react-table';

export interface TabOption {
	label: string;
	value: string;
	count?: number;
}

interface DataTableTabsProps<TData extends RowData> {
	table: Table<TData>;
	column: string;
	tabs: TabOption[];
	activeTab: string;
	onTabChange: (value: string) => void;
}

export function DataTableTabs<TData extends RowData>({ table, column, tabs, activeTab, onTabChange }: DataTableTabsProps<TData>) {
	const handleTabClick = (tabValue: string) => {
		onTabChange(tabValue);

		// Update table filter
		const columnFilter = table.getColumn(column);
		if (columnFilter) {
			if (tabValue === 'all') {
				columnFilter.setFilterValue(undefined);
			} else {
				columnFilter.setFilterValue([tabValue]);
			}
		}
	};

	return (
		<div className="border-b border-border">
			<nav className="-mb-px flex space-x-8" aria-label="Tabs">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.value;
					return (
						<button
							key={tab.value}
							onClick={() => handleTabClick(tab.value)}
							className={`
								whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
								${
									isActive
										? 'border-primary text-foreground'
										: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
								}
							`}
						>
							{tab.label}
							{tab.count !== undefined && (
								<span
									className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${
										isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'
									}`}
								>
									{tab.count}
								</span>
							)}
						</button>
					);
				})}
			</nav>
		</div>
	);
}
