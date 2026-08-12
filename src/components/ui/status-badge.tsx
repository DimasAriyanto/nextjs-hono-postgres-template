import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';

const statusBadgeVariants = cva(
	'inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors',
	{
		variants: {
			variant: {
				request: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
				pending: 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900',
				success: 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-900',
				approved: 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-900',
				completed: 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-900',
				rejected: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
				cancelled: 'bg-muted text-muted-foreground border-border',
				failed: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
				processing: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
				// Billing status
				paid: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
				unpaid: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
				overdue: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
				partially_paid: 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900',
				// General status
				active: 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-900',
				inactive: 'bg-muted text-muted-foreground border-border',
				published: 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-900',
				draft: 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900',
				default: 'bg-muted text-muted-foreground border-border',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {
	/**
	 * Status string for auto-detecting the variant (optional)
	 * If there are no children, the default text from the status will be used
	 */
	status?: string;
	/**
	 * Custom text to display in the badge
	 * If provided, it will override the default text from the status
	 */
	children?: React.ReactNode;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
	({ className, variant, status, children, ...props }, ref) => {
		// Auto-detect variant from status prop if not explicitly provided
		const computedVariant = variant || (status ? getVariantFromStatus(status) : 'default');

		// If there are children, use children. Otherwise, use getStatusText from status
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
			return 'Success';
		case 'rejected':
		case 'ditolak':
			return 'Rejected';
		case 'cancelled':
		case 'dibatalkan':
			return 'Cancelled';
		case 'failed':
		case 'gagal':
			return 'Failed';
		case 'processing':
		case 'diproses':
			return 'Processing';
		// Billing status
		case 'paid':
			return 'Paid';
		case 'unpaid':
			return 'Unpaid';
		case 'overdue':
			return 'Overdue';
		case 'partially_paid':
			return 'Partially Paid';
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
