'use client';

import { useState, useEffect, forwardRef } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProfile, useLogout } from '@/features/auth/hooks/use-auth';

// ── Avatar trigger ─────────────────────────────────────────────────────────────

const AvatarTrigger = forwardRef<
	HTMLButtonElement,
	{ name: string } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ name, ...props }, ref) => {
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
			<span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold shrink-0">
				{initials || <User className="size-3" />}
			</span>
			<span className="hidden sm:block max-w-[120px] truncate">{name}</span>
			<ChevronDown className="size-3.5 text-muted-foreground" />
		</button>
	);
});
AvatarTrigger.displayName = 'AvatarTrigger';

// ── Admin dropdown ─────────────────────────────────────────────────────────────

function AdminMenu({ name, onLogout }: { name: string; onLogout: () => void }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<AvatarTrigger name={name} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				<DropdownMenuLabel className="font-normal">
					<p className="text-xs text-muted-foreground">Admin</p>
					<p className="truncate font-semibold">{name}</p>
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

function UserMenu({ name, onLogout }: { name: string; onLogout: () => void }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<AvatarTrigger name={name} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				<DropdownMenuLabel className="font-normal">
					<p className="text-xs text-muted-foreground">Logged in as</p>
					<p className="truncate font-semibold">{name}</p>
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

// ── Main header ────────────────────────────────────────────────────────────────

export const AppHeader = () => {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [menuAnimating, setMenuAnimating] = useState(false);

	const { data: profileData } = useProfile();
	const { mutate: logout } = useLogout();

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

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
			<div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16">

				{/* Logo */}
				<Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
					App
				</Link>

				{/* Desktop right */}
				<div className="hidden md:flex items-center gap-3">
					{user ? (
						isAdmin ? (
							<AdminMenu name={displayName} onLogout={() => logout()} />
						) : (
							<UserMenu name={displayName} onLogout={() => logout()} />
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

				{/* Mobile hamburger */}
				<Button
					variant="ghost"
					size="icon"
					className="md:hidden"
					onClick={() => setMobileOpen(!mobileOpen)}
				>
					{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
				</Button>
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
								<span className="font-bold text-lg">App</span>
								<Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
									<X className="size-5" />
								</Button>
							</div>

							<div className="px-6 py-6 space-y-3">
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
