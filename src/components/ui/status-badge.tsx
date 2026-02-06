import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';

const statusBadgeVariants = cva(
	'inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors',
	{
		variants: {
			variant: {
				request: 'bg-red-50 text-red-700 border-red-300',
				pending: 'bg-orange-50 text-orange-700 border-orange-300',
				success: 'bg-green-50 text-green-700 border-green-300',
				approved: 'bg-green-50 text-green-700 border-green-300',
				completed: 'bg-green-50 text-green-700 border-green-300',
				rejected: 'bg-red-50 text-red-700 border-red-300',
				cancelled: 'bg-gray-50 text-gray-700 border-gray-300',
				failed: 'bg-red-50 text-red-700 border-red-300',
				processing: 'bg-blue-50 text-blue-700 border-blue-300',
				// Billing status
				paid: 'bg-blue-50 text-blue-700 border-blue-300',
				unpaid: 'bg-red-50 text-red-700 border-red-300',
				overdue: 'bg-red-50 text-red-700 border-red-300',
				partially_paid: 'bg-yellow-50 text-yellow-700 border-yellow-300',
				// General status
				active: 'bg-green-50 text-green-700 border-green-300',
				inactive: 'bg-gray-50 text-gray-700 border-gray-300',
				published: 'bg-green-50 text-green-700 border-green-300',
				draft: 'bg-orange-50 text-orange-700 border-orange-300',
				default: 'bg-gray-50 text-gray-700 border-gray-300',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {
	/**
	 * Status string untuk auto-detect variant (opsional)
	 * Jika tidak ada children, akan menggunakan default text dari status
	 */
	status?: string;
	/**
	 * Custom text untuk ditampilkan di badge
	 * Jika ada, akan override text default dari status
	 */
	children?: React.ReactNode;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
	({ className, variant, status, children, ...props }, ref) => {
		// Auto-detect variant from status prop if not explicitly provided
		const computedVariant = variant || (status ? getVariantFromStatus(status) : 'default');

		// Jika ada children, gunakan children. Jika tidak, gunakan getStatusText dari status
		const displayText = children || (status ? getStatusText(status) : null);

		return (
			<span ref={ref} className={cn(statusBadgeVariants({ variant: computedVariant }), className)} {...props}>
				{displayText}
			</span>
		);
	}
);

StatusBadge.displayName = 'StatusBadge';

// Helper function to map status string to variant
function getVariantFromStatus(status: string): VariantProps<typeof statusBadgeVariants>['variant'] {
	const statusLower = status.toLowerCase();

	switch (statusLower) {
		case 'request':
		case 'requested':
			return 'request';
		case 'pending':
			return 'pending';
		case 'success':
		case 'approved':
		case 'completed':
			return 'success';
		case 'rejected':
		case 'ditolak':
			return 'rejected';
		case 'cancelled':
		case 'dibatalkan':
			return 'cancelled';
		case 'failed':
		case 'gagal':
			return 'failed';
		case 'processing':
		case 'diproses':
			return 'processing';
		// Billing status
		case 'paid':
			return 'paid';
		case 'unpaid':
			return 'unpaid';
		case 'overdue':
			return 'overdue';
		case 'partially_paid':
			return 'partially_paid';
		// General status
		case 'active':
			return 'active';
		case 'inactive':
			return 'inactive';
		case 'published':
			return 'published';
		case 'draft':
			return 'draft';
		default:
			return 'default';
	}
}

// Helper function to get display text for status
function getStatusText(status: string): string {
	const statusLower = status.toLowerCase();

	switch (statusLower) {
		case 'request':
		case 'requested':
			return 'Request';
		case 'pending':
			return 'Pending';
		case 'approved':
		case 'completed':
		case 'success':
			return 'Sukses';
		case 'rejected':
		case 'ditolak':
			return 'Ditolak';
		case 'cancelled':
		case 'dibatalkan':
			return 'Dibatalkan';
		case 'failed':
		case 'gagal':
			return 'Gagal';
		case 'processing':
		case 'diproses':
			return 'Diproses';
		// Billing status
		case 'paid':
			return 'Lunas';
		case 'unpaid':
			return 'Belum Dibayar';
		case 'overdue':
			return 'Terlambat';
		case 'partially_paid':
			return 'Dibayar Sebagian';
		// General status
		case 'active':
			return 'Active';
		case 'inactive':
			return 'Inactive';
		case 'published':
			return 'Published';
		case 'draft':
			return 'Draft';
		default:
			return status.charAt(0).toUpperCase() + status.slice(1);
	}
}

export { StatusBadge, statusBadgeVariants, getVariantFromStatus, getStatusText };
