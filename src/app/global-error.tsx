'use client';

import { SquareDashedBottomCode } from 'lucide-react';

import './globals.css';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<html>
			<body>
				<div className="w-full h-screen inset-0 flex-1 flex items-center justify-center">
					<div className="w-full max-w-3xl flex flex-col gap-2">
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
					</div>
				</div>
			</body>
		</html>
	);
}
