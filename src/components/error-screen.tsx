import { SquareDashedBottomCode } from 'lucide-react';
import { TErrorComp } from '@/providers/error-provider';

export const ErrorScreen = (props: TErrorComp) => {
	return (
		<div className="w-full h-screen inset-0 flex-1 flex items-center justify-center">
			<div className="w-full max-w-3xl flex flex-col gap-2">
				<div className="flex flex-col mb-2">
					<SquareDashedBottomCode className="w-[50px] h-[50px] text-[#FF8A65]" />
					<h2 className="text-[28px] mt-[10px]">Oops, there is an error!</h2>
					<code className="text-[12px]">Uncaught error: {props.message}</code>
				</div>
				<div>
					<button onClick={() => props.setState!({ hasError: false, message: '' })}>
						<span>Coba lagi?</span>
					</button>
				</div>
			</div>
		</div>
	);
};
