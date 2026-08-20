import { Loader2 } from 'lucide-react';

interface RouteLoadingProps {
	isPage?: boolean;
}

/** Fallback UI for Next.js route-segment `loading.tsx` boundaries, shown while a segment streams in. */
export const RouteLoading = ({ isPage = true }: RouteLoadingProps) => {
	if (!isPage) {
		return (
			<div className="flex h-full min-h-40 w-full items-center justify-center p-[80px]">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="flex h-screen w-full items-center justify-center">
			<Loader2 className="size-6 animate-spin text-muted-foreground" />
		</div>
	);
};
