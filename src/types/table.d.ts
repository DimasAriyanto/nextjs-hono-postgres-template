import type { CellData, RowData, TableFeatures } from '@tanstack/table-core';

declare module '@tanstack/table-core' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- must mirror the original generic signature to merge declarations
	interface ColumnMeta<in out TFeatures extends TableFeatures, in out TData extends RowData, TValue extends CellData = CellData> {
		/** Shrink the column to fit its content instead of the default fixed width */
		shrink?: boolean;
	}
}
