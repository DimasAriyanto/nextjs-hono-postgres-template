'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import type { TRole } from '@/contracts';

interface RoleColumnsProps {
	onEdit: (role: TRole) => void;
	onDelete: (roleId: string) => void;
}

export const createRoleColumns = ({ onEdit, onDelete }: RoleColumnsProps): ColumnDef<TRole>[] => [
	{
		accessorKey: 'name',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
		cell: ({ row }) => {
			const role = row.original;
			return (
				<div className="flex items-center gap-2">
					<span className="font-medium">{role.name}</span>
					{role.is_default && (
						<Badge variant="secondary" className="text-xs">
							Default
						</Badge>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: 'created_at',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
		cell: ({ row }) => {
			const date = new Date(row.getValue('created_at') as string);
			return <span className="text-sm text-muted-foreground">{date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>;
		},
	},
	{
		accessorKey: 'updated_at',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
		cell: ({ row }) => {
			const date = new Date(row.getValue('updated_at') as string);
			return <span className="text-sm text-muted-foreground">{date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>;
		},
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			const role = row.original;
			return (
				<div className="flex items-center justify-center space-x-1">
					<Button variant="ghost" size="sm" onClick={() => onEdit(role)} className="h-8 w-8 p-0" title="Edit Role">
						<Edit className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onDelete(role.id)}
						className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
						title="Delete Role"
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				</div>
			);
		},
		enableSorting: false,
	},
];
