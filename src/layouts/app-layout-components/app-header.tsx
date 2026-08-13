'use client';

import { useState, useEffect, forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProfile, useLogout } from '@/features/auth/hooks/use-auth';
import { ThemeToggle } from '@/components/theme-toggle';
import type { TSetting } from '@/contracts';

// ── Avatar trigger ─────────────────────────────────────────────────────────────

const AvatarTrigger = forwardRef<
	HTMLButtonElement,
	{ name: string; avatarUrl?: string | null } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ name, avatarUrl, ...props }, ref) => {
	const initials = name
		.split(' ')
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase() ?? '')
		.join('');

	return (
		<button
			ref={ref}
			{...props}
			className="flex items-center gap-2 rounded-full border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none"
		>
			<Avatar className="h-7 w-7 shrink-0">
				<AvatarImage src={avatarUrl ?? undefined} alt={name} />
				<AvatarFallback className="rounded-full bg-foreground text-background text-xs font-bold">
					{initials || <User className="size-3" />}
				</AvatarFallback>
			</Avatar>
			<span className="hidden sm:block max-w-[120px] truncate">{name}</span>
			<ChevronDown className="size-3.5 text-muted-foreground" />
		</button>
	);
});
AvatarTrigger.displayName = 'AvatarTrigger';

// ── Admin dropdown ─────────────────────────────────────────────────────────────

function AdminMenu({ name, avatarUrl, onLogout }: { name: string; avatarUrl?: string | null; onLogout: () => void }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<AvatarTrigger name={name} avatarUrl={avatarUrl} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				<DropdownMenuLabel className="flex items-center gap-2 font-normal">
					<Avatar className="h-8 w-8 shrink-0">
						<AvatarImage src={avatarUrl ?? undefined} alt={name} />
						<AvatarFallback className="text-xs font-bold">
							{name.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="min-w-0">
						<p className="text-xs text-muted-foreground">Admin</p>
						<p className="truncate font-semibold">{name}</p>
					</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/gundala-admin/d" className="flex items-center gap-2 cursor-pointer">
						<LayoutDashboard className="size-4" />
						Dashboard
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={onLogout}
					className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
				>
					<LogOut className="size-4" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// ── User dropdown ──────────────────────────────────────────────────────────────

function UserMenu({ name, avatarUrl, onLogout }: { name: string; avatarUrl?: string | null; onLogout: () => void }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<AvatarTrigger name={name} avatarUrl={avatarUrl} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				<DropdownMenuLabel className="flex items-center gap-2 font-normal">
					<Avatar className="h-8 w-8 shrink-0">
						<AvatarImage src={avatarUrl ?? undefined} alt={name} />
						<AvatarFallback className="text-xs font-bold">
							{name.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="min-w-0">
						<p className="text-xs text-muted-foreground">Logged in as</p>
						<p className="truncate font-semibold">{name}</p>
					</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={onLogout}
					className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
				>
					<LogOut className="size-4" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// ── Nav ────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
	{ href: '/articles', label: 'Articles' },
];

function isNavActive(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

// ── Brand ──────────────────────────────────────────────────────────────────────

function Brand({ appName, logoUrl, className }: { appName: string; logoUrl?: string | null; className?: string }) {
	return (
		<span className={`flex items-center gap-2 font-bold text-lg tracking-tight ${className ?? ''}`}>
			{logoUrl && (
				<Image src={logoUrl} alt={appName} width={28} height={28} className="rounded object-contain" />
			)}
			{appName}
		</span>
	);
}

// ── Main header ────────────────────────────────────────────────────────────────

interface AppHeaderProps {
	settings?: TSetting;
}

export const AppHeader = ({ settings }: AppHeaderProps) => {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [menuAnimating, setMenuAnimating] = useState(false);

	const { data: profileData } = useProfile();
	const { mutate: logout } = useLogout();
	const pathname = usePathname();

	const appName = settings?.app_name ?? 'App';

	useEffect(() => {
		if (mobileOpen) {
			document.body.style.overflow = 'hidden';
			setTimeout(() => setMenuAnimating(true), 10);
		} else {
			document.body.style.overflow = 'unset';
			setMenuAnimating(false);
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [mobileOpen]);

	const user = profileData?.data;
	const isAdmin = user?.roles?.some((r) => r.is_admin) ?? false;
	const displayName = user?.email ?? '';
	const avatarUrl = user?.avatar_url;

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border">
			<div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16 bg-background/80 backdrop-blur-md">

				{/* Logo */}
				<Link href="/" className="hover:opacity-80 transition-opacity">
					<Brand appName={appName} logoUrl={settings?.logo_url} />
				</Link>

				{/* Desktop nav */}
				<nav className="hidden md:flex items-center gap-6 text-sm font-medium">
					{NAV_ITEMS.map((item) => {
						const active = isNavActive(pathname, item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`border-b-2 py-1 transition-colors ${
									active
										? 'border-primary text-foreground'
										: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
								}`}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>

				{/* Desktop right */}
				<div className="hidden md:flex items-center gap-3">
					<ThemeToggle />
					{user ? (
						isAdmin ? (
							<AdminMenu name={displayName} avatarUrl={avatarUrl} onLogout={() => logout()} />
						) : (
							<UserMenu name={displayName} avatarUrl={avatarUrl} onLogout={() => logout()} />
						)
					) : (
						<>
							<Button variant="outline" asChild size="sm">
								<Link href="/login">Login</Link>
							</Button>
							<Button asChild size="sm">
								<Link href="/register">Register</Link>
							</Button>
						</>
					)}
				</div>

				{/* Mobile right */}
				<div className="flex items-center gap-1 md:hidden">
					<ThemeToggle />
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setMobileOpen(!mobileOpen)}
					>
						{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
					</Button>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileOpen && (
				<>
					<div
						className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${menuAnimating ? 'opacity-100' : 'opacity-0'}`}
						onClick={() => setMobileOpen(false)}
					/>
					<div className="fixed inset-0 z-50 md:hidden pointer-events-none">
						<div
							className={`fixed inset-y-0 right-0 w-full max-w-sm bg-background shadow-2xl pointer-events-auto transition-transform duration-300 ${menuAnimating ? 'translate-x-0' : 'translate-x-full'}`}
						>
							<div className="flex items-center justify-between px-6 py-5 border-b border-border">
								<Brand appName={appName} logoUrl={settings?.logo_url} />
								<Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
									<X className="size-5" />
								</Button>
							</div>

							<div className="px-6 py-6 space-y-3">
								{NAV_ITEMS.map((item) => {
									const active = isNavActive(pathname, item.href);
									return (
										<Button
											key={item.href}
											variant={active ? 'secondary' : 'ghost'}
											asChild
											className="w-full justify-start h-11"
										>
											<Link href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>
										</Button>
									);
								})}

								{user ? (
									<>
										{isAdmin && (
											<Button variant="outline" asChild className="w-full justify-start h-11">
												<Link href="/gundala-admin/d" onClick={() => setMobileOpen(false)}>
													<LayoutDashboard className="size-4 mr-2" />
													Dashboard
												</Link>
											</Button>
										)}
										<Button
											variant="destructive"
											className="w-full h-11"
											onClick={() => {
												setMobileOpen(false);
												logout();
											}}
										>
											<LogOut className="size-4 mr-2" />
											Logout
										</Button>
									</>
								) : (
									<>
										<Button variant="outline" asChild className="w-full h-11">
											<Link href="/login" onClick={() => setMobileOpen(false)}>Login</Link>
										</Button>
										<Button asChild className="w-full h-11">
											<Link href="/register" onClick={() => setMobileOpen(false)}>Register</Link>
										</Button>
									</>
								)}
							</div>
						</div>
					</div>
				</>
			)}
		</header>
	);
};
