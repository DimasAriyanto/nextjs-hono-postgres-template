'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import type { TSetting, TUpdateSettingRequest } from '@/contracts';

interface SeoTabProps {
	form: UseFormReturn<TUpdateSettingRequest>;
	isSaving: boolean;
	settings: TSetting | undefined;
	ogImageFiles: File[];
	onOgImageFilesChange: (files: File[]) => void;
	replacingOgImage: boolean;
	onReplacingOgImageChange: (replacing: boolean) => void;
}

export function SeoTab({ form, isSaving, settings, ogImageFiles, onOgImageFilesChange, replacingOgImage, onReplacingOgImageChange }: SeoTabProps) {
	return (
		<Card>
			<CardContent className="pt-6 space-y-4">
				<div className="grid gap-2">
					<FormLabel>OG Image (Social Share Image)</FormLabel>
					{settings?.og_image_url && !replacingOgImage && ogImageFiles.length === 0 ? (
						<div className="relative h-40 w-full">
							<div className="h-40 w-full overflow-hidden rounded-md ring-1 ring-border bg-muted relative">
								<Image src={settings.og_image_url} alt="OG Image" fill className="object-cover" />
							</div>
							<button
								type="button"
								onClick={() => onReplacingOgImageChange(true)}
								disabled={isSaving}
								className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-50"
							>
								<X className="size-3.5" />
							</button>
						</div>
					) : (
						<FileUpload
							compact
							compactShape="rect"
							compactSize={160}
							accept="image/*"
							maxSize={5 * 1024 * 1024}
							value={ogImageFiles}
							onChange={onOgImageFilesChange}
							disabled={isSaving}
							description="Click to upload · 1200×630 recommended"
						/>
					)}
					<p className="text-sm text-muted-foreground">
						Shown when a page is shared on WhatsApp, Facebook, X, etc. Recommended size 1200×630. Falls back to the Logo above if left empty.
					</p>
				</div>

				<FormField control={form.control} name="ga_id" render={({ field }) => (
					<FormItem>
						<FormLabel>Google Analytics Measurement ID</FormLabel>
						<FormControl><Input {...field} placeholder="G-XXXXXXXXXX" disabled={isSaving} /></FormControl>
						<p className="text-sm text-muted-foreground">
							From Google Analytics: Admin → Data Streams → your stream → Measurement ID.
						</p>
						<FormMessage />
					</FormItem>
				)} />

				<FormField control={form.control} name="gtm_id" render={({ field }) => (
					<FormItem>
						<FormLabel>Google Tag Manager Container ID</FormLabel>
						<FormControl><Input {...field} placeholder="GTM-XXXXXXX" disabled={isSaving} /></FormControl>
						<p className="text-sm text-muted-foreground">
							From Google Tag Manager: top of the workspace, next to your container name.
						</p>
						<FormMessage />
					</FormItem>
				)} />

				<FormField control={form.control} name="google_site_verification" render={({ field }) => (
					<FormItem>
						<FormLabel>Google Search Console Verification</FormLabel>
						<FormControl><Input {...field} placeholder="content value from the HTML tag verification method" disabled={isSaving} /></FormControl>
						<p className="text-sm text-muted-foreground">
							From Search Console: Settings → Ownership verification → HTML tag → copy just the <code>content</code> value.
						</p>
						<FormMessage />
					</FormItem>
				)} />
			</CardContent>
		</Card>
	);
}
