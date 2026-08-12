import { getSettings } from '@/features/setting/apis/setting.api';
import type { TSetting } from '@/contracts';

interface LegalPageWrapperProps {
	title: string;
	field: Extract<keyof TSetting, 'terms_of_service' | 'privacy_policy'>;
}

export async function LegalPageWrapper({ title, field }: LegalPageWrapperProps) {
	const { data: settings } = await getSettings();
	const content = settings[field];

	return (
		<article className="container mx-auto max-w-3xl px-4 md:px-6 py-16">
			<h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{title}</h1>

			{content ? (
				<div
					className="prose-content mt-8 max-w-none [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_img]:my-4 [&_img]:rounded-md [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5"
					dangerouslySetInnerHTML={{ __html: content }}
				/>
			) : (
				<p className="mt-8 text-muted-foreground">Content has not been added yet.</p>
			)}
		</article>
	);
}
