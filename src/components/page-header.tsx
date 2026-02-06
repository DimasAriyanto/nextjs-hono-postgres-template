import Link from 'next/link';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type BreadcrumbNavItem = {
	label: string;
	href?: string;
};

interface PageHeaderProps {
	breadcrumbs: BreadcrumbNavItem[];
	title: string;
	description?: string;
}

export function PageHeader({ breadcrumbs, title, description }: PageHeaderProps) {
	return (
		<div className="mb-6">
			<Breadcrumb className="mb-3">
				<BreadcrumbList>
					{breadcrumbs.map((item, index) => {
						const isLast = index === breadcrumbs.length - 1;
						return (
							<span key={item.label} className="inline-flex items-center gap-1.5">
								{index > 0 && <BreadcrumbSeparator />}
								<BreadcrumbItem>
									{isLast ? (
										<BreadcrumbPage>{item.label}</BreadcrumbPage>
									) : (
										<BreadcrumbLink asChild>
											<Link href={item.href || '#'}>{item.label}</Link>
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
							</span>
						);
					})}
				</BreadcrumbList>
			</Breadcrumb>
			<h1 className="text-2xl font-bold">{title}</h1>
			{description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
		</div>
	);
}
