'use client';

import { type Table } from '@tanstack/react-table';

export interface TabOption {
	label: string;
	value: string;
	count?: number;
}

interface DataTableTabsProps<TData> {
	table: Table<TData>;
	column: string;
	tabs: TabOption[];
	activeTab: string;
	onTabChange: (value: string) => void;
}

export function DataTableTabs<TData>({ table, column, tabs, activeTab, onTabChange }: DataTableTabsProps<TData>) {
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
		<div className="border-b border-gray-200">
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
										? 'border-asita-600 text-asita-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}
							`}
						>
							{tab.label}
							{tab.count !== undefined && (
								<span
									className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${
										isActive ? 'bg-asita-100 text-asita-600' : 'bg-gray-100 text-gray-900'
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
