'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useCreateFaq, useUpdateFaq } from '@/features/faq/hooks/use-faq';
import { getErrorMessage, toastMutationError } from '@/libs/toast';
import type { TContentLocale, TFaq } from '@/contracts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	faq?: TFaq | null;
	mode: 'create' | 'edit';
	locale: TContentLocale;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FaqFormModal({ isOpen, onClose, faq, mode, locale }: FaqFormModalProps) {
	const [question, setQuestion] = useState('');
	const [answer, setAnswer] = useState('');
	const [sortOrder, setSortOrder] = useState<string>('0');
	const [error, setError] = useState('');

	const createMutation = useCreateFaq({ onSuccess: () => onClose() });
	const updateMutation = useUpdateFaq({ onSuccess: () => onClose() });

	const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
	if (isOpen !== prevIsOpen) {
		setPrevIsOpen(isOpen);
		if (faq && mode === 'edit') {
			setQuestion(faq.question);
			setAnswer(faq.answer);
			setSortOrder(String(faq.sort_order));
		} else {
			setQuestion('');
			setAnswer('');
			setSortOrder('0');
		}
		setError('');
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!question.trim()) { setError('Question is required'); return; }
		if (!answer.trim()) { setError('Answer is required'); return; }

		try {
			if (mode === 'create') {
				await createMutation.mutateAsync({
					question: question.trim(),
					answer: answer.trim(),
					locale,
					sort_order: sortOrder.trim() ? Number(sortOrder) : undefined,
				});
				toast.success('FAQ created', { description: 'The FAQ item has been created successfully.' });
			} else if (faq) {
				await updateMutation.mutateAsync({
					id: faq.id,
					data: {
						question: question.trim(),
						answer: answer.trim(),
						sort_order: sortOrder.trim() ? Number(sortOrder) : undefined,
					},
				});
				toast.success('FAQ updated', { description: 'The FAQ item has been updated successfully.' });
			}
		} catch (err) {
			setError(getErrorMessage(err));
			toastMutationError(err);
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[560px]">
				<DialogHeader>
					<DialogTitle>{mode === 'create' ? 'Create FAQ' : 'Edit FAQ'}</DialogTitle>
					<DialogDescription>
						{mode === 'create' ? 'Add a new frequently asked question.' : 'Update this FAQ item.'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="question">Question</Label>
							<Textarea
								id="question"
								value={question}
								onChange={(e) => { setQuestion(e.target.value); if (error) setError(''); }}
								placeholder="Enter the question"
								disabled={isLoading}
								rows={2}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="answer">Answer</Label>
							<Textarea
								id="answer"
								value={answer}
								onChange={(e) => { setAnswer(e.target.value); if (error) setError(''); }}
								placeholder="Enter the answer"
								disabled={isLoading}
								rows={4}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="sort_order">Order</Label>
							<Input
								id="sort_order"
								type="number"
								value={sortOrder}
								onChange={(e) => setSortOrder(e.target.value)}
								disabled={isLoading}
							/>
						</div>
						{error && <p className="text-sm text-red-500">{error}</p>}
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? <><Loader2 className="size-4 mr-1.5 animate-spin" />{mode === 'create' ? 'Creating...' : 'Updating...'}</>
								: mode === 'create' ? 'Create' : 'Update'
							}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
