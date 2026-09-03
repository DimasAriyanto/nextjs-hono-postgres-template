'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { TFaqItem } from '@/contracts';

interface FaqSectionProps {
	faqs: TFaqItem[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
	const [openIndex, setOpenIndex] = useState<number | null>(0);
	const t = useTranslations('home');

	if (faqs.length === 0) return null;

	return (
		<section className="container mx-auto px-4 md:px-6 py-16">
			<div className="mx-auto max-w-2xl text-center mb-10">
				<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('faqTitle')}</h2>
			</div>

			<div className="mx-auto max-w-2xl divide-y divide-border rounded-lg border border-border">
				{faqs.map((faq, index) => (
					<Collapsible
						key={index}
						open={openIndex === index}
						onOpenChange={(open) => setOpenIndex(open ? index : null)}
					>
						<CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium">
							{faq.question}
							<ChevronDown
								className={`size-4 shrink-0 text-muted-foreground transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
							/>
						</CollapsibleTrigger>
						<CollapsibleContent className="px-5 pb-4 text-sm text-muted-foreground">
							{faq.answer}
						</CollapsibleContent>
					</Collapsible>
				))}
			</div>
		</section>
	);
}
