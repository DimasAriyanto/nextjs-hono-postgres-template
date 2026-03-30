import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Export data to Excel (.xlsx) with optional title row and auto-fit columns.
 *
 * Usage:
 *   await exportToExcel(rows, 'user-list', 'User Report');
 *
 * @param data      Array of flat records — keys become column headers, values become cells
 * @param filename  Output filename without extension
 * @param title     Optional bold title displayed above the header row
 * @param sheetName Worksheet name (default: 'Sheet1')
 */
export async function exportToExcel(
	data: Record<string, unknown>[],
	filename: string,
	title?: string,
	sheetName = 'Sheet1',
): Promise<void> {
	if (!data || data.length === 0) return;

	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(sheetName);

	const headers = Object.keys(data[0]);
	let currentRow = 1;

	// ── Title row ────────────────────────────────────────────────────────────────
	if (title) {
		const titleRow = worksheet.addRow([title]);
		titleRow.font = { name: 'Arial', size: 14, bold: true };
		worksheet.mergeCells(1, 1, 1, headers.length);
		titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
		titleRow.height = 30;
		worksheet.addRow([]); // blank spacer
		currentRow += 2;
	}

	// ── Header row ───────────────────────────────────────────────────────────────
	const headerRow = worksheet.getRow(currentRow);
	headerRow.values = headers;
	headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
	headerRow.height = 24;
	headerRow.eachCell((cell) => {
		cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // slate-800
		cell.alignment = { vertical: 'middle', horizontal: 'center' };
		cell.border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' },
		};
	});
	currentRow++;

	// ── Data rows ─────────────────────────────────────────────────────────────────
	for (const item of data) {
		const row = worksheet.addRow(headers.map((h) => item[h]));
		row.eachCell((cell) => {
			cell.alignment = { vertical: 'middle', horizontal: 'left' };
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
		});
	}

	// ── Auto-fit column widths ────────────────────────────────────────────────────
	worksheet.columns.forEach((column) => {
		let max = 12;
		column.eachCell?.({ includeEmpty: true }, (cell) => {
			const len = cell.value ? String(cell.value).length : 10;
			if (len > max) max = len;
		});
		column.width = max + 4;
	});

	// ── Save ─────────────────────────────────────────────────────────────────────
	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	});
	saveAs(blob, `${filename}.xlsx`);
}
