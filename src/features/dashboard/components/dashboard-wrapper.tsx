'use client';

import Link from 'next/link';
import { FileText, Images, Shield, Users } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTZ } from '@/libs/dayjs';
import { useArticles } from '@/features/article/hooks/use-article';
import { useUsers } from '@/features/user/hooks/use-user';
import { useRoles } from '@/features/role/hooks/use-role';
import { useGalleries } from '@/features/gallery/hooks/use-gallery';

function StatCard({ icon: Icon, label, value, isLoading }: { icon: React.ElementType; label: string; value: number; isLoading: boolean }) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
				<Icon className="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				{isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{value}</div>}
			</CardContent>
		</Card>
	);
}

export const DashboardWrapper = () => {
	const { data: publishedRes, isLoading: isPublishedLoading } = useArticles({ limit: 1, status: 'published' });
	const { data: usersRes, isLoading: isUsersLoading } = useUsers({ limit: 1 });
	const { data: rolesRes, isLoading: isRolesLoading } = useRoles({ limit: 1 });
	const { data: galleriesRes, isLoading: isGalleriesLoading } = useGalleries({ limit: 1 });
	const { data: recentArticlesRes, isLoading: isRecentLoading } = useArticles({ limit: 5 });

	const publishedTotal = publishedRes?.meta?.pagination?.total ?? 0;
	const usersTotal = usersRes?.meta?.pagination?.total ?? 0;
	const rolesTotal = rolesRes?.meta?.pagination?.total ?? 0;
	const galleriesTotal = galleriesRes?.meta?.pagination?.total ?? 0;
	const recentArticles = recentArticlesRes?.data ?? [];

	return (
		<>
			<PageHeader
				breadcrumbs={[{ label: 'Dashboard' }]}
				title="Dashboard"
			/>
			<div className="grid auto-rows-min gap-4 md:grid-cols-4">
				<StatCard icon={FileText} label="Published Articles" value={publishedTotal} isLoading={isPublishedLoading} />
				<StatCard icon={Users} label="Users" value={usersTotal} isLoading={isUsersLoading} />
				<StatCard icon={Shield} label="Roles" value={rolesTotal} isLoading={isRolesLoading} />
				<StatCard icon={Images} label="Gallery Images" value={galleriesTotal} isLoading={isGalleriesLoading} />
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent Articles</CardTitle>
				</CardHeader>
				<CardContent>
					{isRecentLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
						</div>
					) : recentArticles.length === 0 ? (
						<p className="text-sm text-muted-foreground">No articles yet.</p>
					) : (
						<div className="divide-y">
							{recentArticles.map((article) => (
								<Link
									key={article.id}
									href="/gundala-admin/d/article"
									className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:opacity-80"
								>
									<div className="min-w-0">
										<p className="truncate text-sm font-medium">{article.title}</p>
										<p className="text-xs text-muted-foreground">{formatTZ(article.updated_at, 'DD MMM YYYY')}</p>
									</div>
									<StatusBadge status={article.status} />
								</Link>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
};
