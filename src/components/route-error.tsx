'use client';

import { SquareDashedBottomCode } from 'lucide-react';

interface RouteErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
	isPage?: boolean;
}

const RouteErrorContent = ({ error, reset }: Pick<RouteErrorProps, 'error' | 'reset'>) => (
	<>
		<div className="flex flex-col mb-4">
			<SquareDashedBottomCode className="w-[70px] h-[70px] text-[#FF8A65]" />
			<h2 className="text-[28px] mt-[10px] font-semibold">Oops, there is an error!</h2>
			<code className="text-[12px]">Uncaught error: {error.message}</code>
		</div>
		<div className="flex items-center gap-2">
			<button onClick={() => reset()}>
				<span>Try again?</span>
			</button>
		</div>
	</>
);

/** Fallback UI for Next.js route-segment `error.tsx` boundaries — mirrors the style of ErrorScreen/ErrorContent/ErrorNotFound. */
export const RouteError = ({ error, reset, isPage = true }: RouteErrorProps) => {
	if (!isPage) {
		return (
			<div className="flex flex-col p-[80px] items-start h-full">
				<RouteErrorContent error={error} reset={reset} />
			</div>
		);
	}

	return (
		<div className="w-full h-screen inset-0 flex-1 flex items-center justify-center">
			<div className="w-full max-w-3xl flex flex-col gap-2">
				<RouteErrorContent error={error} reset={reset} />
			</div>
		</div>
	);
};
