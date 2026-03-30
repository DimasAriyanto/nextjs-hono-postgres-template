'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { exportToExcel } from '@/libs/export-excel';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExportButtonProps {
	/**
	 * Async function that returns the rows to export.
	 * Called only when the user clicks Export — not on every render.
	 */
	onFetchData: () => Promise<Record<string, unknown>[]>;
	/** Output filename without extension (e.g. "user-list-2025-06-01") */
	filename: string;
	/** Optional bold title row above the headers */
	title?: string;
	/** Worksheet tab name (default: "Sheet1") */
	sheetName?: string;
	/** Button label (default: "Export Excel") */
	label?: string;
	className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Reusable Excel export button.
 *
 * Fetches data lazily (only on click), then streams it to an .xlsx file using
 * ExcelJS. Drop it anywhere — standalone or inside the DataTable toolbar via the
 * `ExportComp` prop.
 *
 * @example
 * <ExportButton
 *   filename="users-2025"
 *   title="User Report"
 *   onFetchData={async () => {
 *     const { data } = await getUsers({ page: 1, limit: 10000 });
 *     return data.map((u) => ({ Name: u.name, Email: u.email }));
 *   }}
 * />
 */
export function ExportButton({
	onFetchData,
	filename,
	title,
	sheetName,
	label = 'Export Excel',
	className,
}: ExportButtonProps) {
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			const data = await onFetchData();

			if (!data || data.length === 0) {
				toast.info('No data to export');
				return;
			}

			await exportToExcel(data, filename, title, sheetName);
			toast.success('Export successful', { description: `${filename}.xlsx has been downloaded.` });
		} catch (err) {
			toast.error('Export failed', {
				description: err instanceof Error ? err.message : 'Failed to export data',
			});
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleExport}
			disabled={isExporting}
			className={className}
		>
			{isExporting
				? <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Exporting...</>
				: <><Download className="size-3.5 mr-1.5" />{label}</>
			}
		</Button>
	);
}
