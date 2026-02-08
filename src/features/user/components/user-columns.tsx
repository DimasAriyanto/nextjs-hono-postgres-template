'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import type { TUserWithRoles } from '@/contracts';

interface UserColumnsProps {
	onEdit: (user: TUserWithRoles) => void;
	onDelete: (userId: string) => void;
}

export const createUserColumns = ({ onEdit, onDelete }: UserColumnsProps): ColumnDef<TUserWithRoles>[] => [
	{
		accessorKey: 'email',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
		cell: ({ row }) => <span className="font-medium">{row.original.email}</span>,
	},
	{
		accessorKey: 'name',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">{row.original.name || '-'}</span>
		),
	},
	{
		accessorKey: 'email_verified_at',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Verified" />,
		cell: ({ row }) => {
			const verified = row.original.email_verified_at;
			return verified ? (
				<Badge variant="default" className="text-xs">
					Verified
				</Badge>
			) : (
				<Badge variant="secondary" className="text-xs">
					Unverified
				</Badge>
			);
		},
	},
	{
		id: 'roles',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
		cell: ({ row }) => {
			const roles = row.original.roles as { id: string; name: string }[];
			if (!roles || roles.length === 0) return <span className="text-sm text-muted-foreground">-</span>;
			return (
				<div className="flex items-center gap-1">
					{roles.map((role) => (
						<Badge key={role.id} variant="outline" className="text-xs">
							{role.name}
						</Badge>
					))}
				</div>
			);
		},
		enableSorting: false,
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
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			const user = row.original;
			return (
				<div className="flex items-center space-x-1">
					<Button variant="ghost" size="sm" onClick={() => onEdit(user)} className="h-8 w-8 p-0" title="Edit User">
						<Edit className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onDelete(user.id)}
						className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
						title="Delete User"
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				</div>
			);
		},
		enableSorting: false,
	},
];
