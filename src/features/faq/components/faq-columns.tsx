'use client';

import { type LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy';
import { Edit, Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import type { TFaq } from '@/contracts';

interface FaqColumnsProps {
	onEdit: (faq: TFaq) => void;
	onDelete: (faqId: string) => void;
	page: number;
	limit: number;
}

export const createFaqColumns = ({ onEdit, onDelete, page, limit }: FaqColumnsProps): ColumnDef<TFaq>[] => [
	{
		id: 'no',
		header: 'No',
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">{(page - 1) * limit + row.index + 1}</span>
		),
		meta: { shrink: true },
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'question',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Question" />,
		cell: ({ row }) => (
			<div className="max-w-[320px]">
				<p className="font-medium truncate">{row.original.question}</p>
				<p className="text-xs text-muted-foreground truncate">{row.original.answer}</p>
			</div>
		),
	},
	{
		accessorKey: 'sort_order',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
		cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.sort_order}</span>,
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			const faq = row.original;
			return (
				<div className="flex items-center space-x-1">
					<Button variant="ghost" size="sm" onClick={() => onEdit(faq)} className="h-8 w-8 p-0" title="Edit FAQ">
						<Edit className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onDelete(faq.id)}
						className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
						title="Delete FAQ"
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				</div>
			);
		},
		enableSorting: false,
	},
];
