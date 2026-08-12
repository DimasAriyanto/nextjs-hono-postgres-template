'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export type TFaqItem = {
	question: string;
	answer: string;
};

interface FaqInputProps {
	value: TFaqItem[];
	onChange: (value: TFaqItem[]) => void;
	className?: string;
}

export function FaqInput({ value, onChange, className }: FaqInputProps) {
	const addItem = () => {
		onChange([...value, { question: '', answer: '' }]);
	};

	const removeItem = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	const updateItem = (index: number, patch: Partial<TFaqItem>) => {
		onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
	};

	return (
		<div className={className}>
			<div className="space-y-3">
				{value.map((item, index) => (
					<div key={index} className="grid grid-cols-[1fr_auto] gap-2 items-start rounded-md border border-input p-3">
						<div className="space-y-2">
							<Input
								value={item.question}
								onChange={(e) => updateItem(index, { question: e.target.value })}
								placeholder="Question"
							/>
							<Textarea
								value={item.answer}
								onChange={(e) => updateItem(index, { answer: e.target.value })}
								placeholder="Answer"
								rows={2}
							/>
						</div>
						<button
							type="button"
							onClick={() => removeItem(index)}
							className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				))}
			</div>
			<Button type="button" variant="ghost" size="sm" onClick={addItem} className="mt-2 text-primary">
				<Plus className="w-3.5 h-3.5" /> Add FAQ
			</Button>
		</div>
	);
}
