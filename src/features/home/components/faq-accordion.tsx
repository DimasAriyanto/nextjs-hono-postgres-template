'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { TFaq } from '@/contracts';

interface FaqAccordionProps {
	faqs: TFaq[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	return (
		<div className="mx-auto max-w-2xl divide-y divide-border rounded-lg border border-border">
			{faqs.map((faq, index) => (
				<Collapsible
					key={faq.id}
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
	);
}
