'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/libs/utils';

interface TagsInputProps {
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

/** Free-form tag entry — type a value and press Enter or comma to add it, click × to remove. */
export function TagsInput({ value, onChange, placeholder = 'Add a tag and press Enter...', disabled, className }: TagsInputProps) {
	const [draft, setDraft] = useState('');

	const addTag = (raw: string) => {
		const tag = raw.trim();
		if (!tag || value.includes(tag)) return;
		onChange([...value, tag]);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addTag(draft);
			setDraft('');
		} else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
			onChange(value.slice(0, -1));
		}
	};

	return (
		<div className={cn('flex flex-wrap items-center gap-1.5 rounded-md border border-input px-2 py-1.5', disabled && 'opacity-50', className)}>
			{value.map((tag) => (
				<Badge key={tag} variant="secondary" className="gap-1 pr-1">
					{tag}
					{!disabled && (
						<button
							type="button"
							onClick={() => onChange(value.filter((t) => t !== tag))}
							className="rounded-sm opacity-60 hover:opacity-100"
						>
							<X className="size-3" />
						</button>
					)}
				</Badge>
			))}
			<Input
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={() => { addTag(draft); setDraft(''); }}
				placeholder={value.length === 0 ? placeholder : ''}
				disabled={disabled}
				className="h-7 flex-1 min-w-[120px] border-0 shadow-none px-1 focus-visible:ring-0"
			/>
		</div>
	);
}
