'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

const THEME_OPTIONS = [
	{ value: 'light', label: 'Light', icon: Sun },
	{ value: 'dark', label: 'Dark', icon: Moon },
	{ value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Toggle theme" className="relative">
					<Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-36">
				{THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
					<DropdownMenuItem
						key={value}
						onClick={() => setTheme(value)}
						className="flex items-center gap-2 cursor-pointer"
					>
						<Icon className="size-4" />
						{label}
						{theme === value && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function ThemeMenuSub() {
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger className="flex items-center gap-2">
				<Sun className="size-4" />
				Theme
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				{THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
					<DropdownMenuItem
						key={value}
						onClick={() => setTheme(value)}
						className="flex items-center gap-2 cursor-pointer"
					>
						<Icon className="size-4" />
						{label}
						{theme === value && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
					</DropdownMenuItem>
				))}
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}
