'use client';

import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TUpdateSettingRequest } from '@/contracts';

const DEFAULT_PRIMARY_COLOR = '#171717';

interface AppearanceTabProps {
	form: UseFormReturn<TUpdateSettingRequest>;
	isSaving: boolean;
}

export function AppearanceTab({ form, isSaving }: AppearanceTabProps) {
	return (
		<Card>
			<CardContent className="pt-6 space-y-4">
				<FormField control={form.control} name="primary_color" render={({ field }) => (
					<FormItem>
						<FormLabel>Primary Color</FormLabel>
						<div className="flex items-center gap-2">
							<FormControl>
								<input
									type="color"
									value={field.value || DEFAULT_PRIMARY_COLOR}
									onChange={(e) => field.onChange(e.target.value)}
									disabled={isSaving}
									className="h-9 w-12 cursor-pointer rounded-md border border-input p-1"
								/>
							</FormControl>
							<Input
								value={field.value ?? ''}
								onChange={(e) => field.onChange(e.target.value)}
								placeholder={DEFAULT_PRIMARY_COLOR}
								disabled={isSaving}
								className="w-32 font-mono uppercase"
								maxLength={7}
							/>
							<Button type="button" variant="ghost" size="sm" onClick={() => field.onChange('')} disabled={isSaving}>
								Reset to default
							</Button>
						</div>
						<p className="text-sm text-muted-foreground">Accent color used across buttons, links and highlights throughout the app.</p>
						<FormMessage />
					</FormItem>
				)} />
			</CardContent>
		</Card>
	);
}
