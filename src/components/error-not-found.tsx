'use client';
import { useRouter } from 'next/navigation';
import { Rabbit } from 'lucide-react';

type TProps = {
	isPage?: boolean;
};

const ErrorNotFoundContent = () => {
	const router = useRouter();

	return (
		<>
			<div className="flex flex-col mb-4">
				<Rabbit className="w-[70px] h-[70px] text-[#FF8A65]" />
				<h2 className="text-[28px] mt-[10px] font-semibold">Oops, 404 not found!</h2>
				<code className="">The page you are looking for does not exist or under construction.</code>
			</div>
			<div className="flex items-center gap-2">
				<button onClick={() => router.back()}>
					<span>Kembali?</span>
				</button>
			</div>
		</>
	);
};

export const ErrorNotFound = (props: TProps) => {
	const { isPage = true } = props;

	if (!isPage) {
		return (
			<div className="flex flex-col p-[80px] items-start h-full">
				<ErrorNotFoundContent />
			</div>
		);
	}

	return (
		<div className="w-full h-screen inset-0 flex-1 flex items-center justify-center">
			<div className="w-full max-w-3xl flex flex-col gap-2">
				<ErrorNotFoundContent />
			</div>
		</div>
	);
};
