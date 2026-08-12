'use client';

import { type LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatTZ } from '@/libs/dayjs';
import type { TArticleWithAuthor } from '@/contracts';

interface ArticleColumnsProps {
	onEdit: (article: TArticleWithAuthor) => void;
	onDelete: (articleId: string) => void;
	onToggleStatus: (article: TArticleWithAuthor) => void;
	togglingId?: string | null;
	page: number;
	limit: number;
}

export const createArticleColumns = ({ onEdit, onDelete, onToggleStatus, togglingId, page, limit }: ArticleColumnsProps): ColumnDef<TArticleWithAuthor>[] => [
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
		accessorKey: 'title',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
		cell: ({ row }) => (
			<div className="max-w-[280px]">
				<p className="font-medium truncate">{row.original.title}</p>
				<p className="text-xs text-muted-foreground truncate">/{row.original.slug}</p>
			</div>
		),
	},
	{
		accessorKey: 'status',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
		cell: ({ row }) => <StatusBadge status={row.original.status} />,
	},
	{
		id: 'author',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
		cell: ({ row }) => {
			const author = row.original.author as { name?: string | null; email?: string } | null | undefined;
			return <span className="text-sm text-muted-foreground">{author?.name || author?.email || '-'}</span>;
		},
		enableSorting: false,
	},
	{
		accessorKey: 'created_at',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">{formatTZ(row.getValue('created_at'), 'DD MMM YYYY')}</span>
		),
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			const article = row.original;
			const isPublished = article.status === 'published';
			const isToggling = togglingId === article.id;
			return (
				<div className="flex items-center space-x-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onToggleStatus(article)}
						disabled={isToggling}
						className="h-8 w-8 p-0"
						title={isPublished ? 'Set to Draft' : 'Publish Article'}
					>
						{isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
					</Button>
					<Button variant="ghost" size="sm" onClick={() => onEdit(article)} className="h-8 w-8 p-0" title="Edit Article">
						<Edit className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onDelete(article.id)}
						className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
						title="Delete Article"
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				</div>
			);
		},
		enableSorting: false,
	},
];
