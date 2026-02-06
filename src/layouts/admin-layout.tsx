'use client';

import { AppSidebar } from '@/layouts/admin-layout-components/app-sidebar';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ErrorBoundaries } from '@/providers/error-provider';
import { ErrorContent } from '@/components/error-content';
import { ErrorScreen } from '@/components/error-screen';
import type { PropsWithChildren } from 'react';

export const AdminLayout = ({ children }: PropsWithChildren) => {
	return (
		<ErrorBoundaries ErrorContent={ErrorScreen}>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem className="hidden md:block">
										<BreadcrumbLink href="#">Build Your Application</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className="hidden md:block" />
									<BreadcrumbItem>
										<BreadcrumbPage>Data Fetching</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
						<ErrorBoundaries ErrorContent={ErrorContent}>{children}</ErrorBoundaries>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</ErrorBoundaries>
	);
};
