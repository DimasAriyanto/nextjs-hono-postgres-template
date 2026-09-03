'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import type { TSetting, TUpdateSettingRequest } from '@/contracts';

interface GeneralTabProps {
	form: UseFormReturn<TUpdateSettingRequest>;
	isSaving: boolean;
	settings: TSetting | undefined;
	logoFiles: File[];
	onLogoFilesChange: (files: File[]) => void;
	replacingLogo: boolean;
	onReplacingLogoChange: (replacing: boolean) => void;
}

export function GeneralTab({ form, isSaving, settings, logoFiles, onLogoFilesChange, replacingLogo, onReplacingLogoChange }: GeneralTabProps) {
	return (
		<Card>
			<CardContent className="pt-6 space-y-4">
				<div className="grid gap-2">
					<FormLabel>Logo</FormLabel>
					{settings?.logo_url && !replacingLogo && logoFiles.length === 0 ? (
						<div className="relative h-24 w-24">
							<div className="h-24 w-24 overflow-hidden rounded-md ring-1 ring-border bg-muted relative">
								<Image src={settings.logo_url} alt="Logo" fill className="object-contain" />
							</div>
							<button
								type="button"
								onClick={() => onReplacingLogoChange(true)}
								disabled={isSaving}
								className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-50"
							>
								<X className="size-3.5" />
							</button>
						</div>
					) : (
						<FileUpload
							compact
							compactShape="square"
							compactSize={96}
							accept="image/*"
							maxSize={5 * 1024 * 1024}
							value={logoFiles}
							onChange={onLogoFilesChange}
							disabled={isSaving}
						/>
					)}
				</div>

				<FormField control={form.control} name="app_name" render={({ field }) => (
					<FormItem>
						<FormLabel>App Name</FormLabel>
						<FormControl><Input {...field} placeholder="My App" disabled={isSaving} /></FormControl>
						<FormMessage />
					</FormItem>
				)} />

				<FormField control={form.control} name="description" render={({ field }) => (
					<FormItem>
						<FormLabel>Description</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								disabled={isSaving}
								rows={3}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)} />
			</CardContent>
		</Card>
	);
}
