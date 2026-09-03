'use client';

import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { SocialLinksInput } from '@/components/social-links-input';
import { BusinessHoursInput } from '@/components/business-hours-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { TagsInput } from '@/components/ui/tags-input';
import type { TContentLocale, TUpdateSettingRequest } from '@/contracts';
import { ContentLocaleSwitcher } from './content-locale-switcher';

interface ContactTabProps {
	form: UseFormReturn<TUpdateSettingRequest>;
	isSaving: boolean;
	contentLocale: TContentLocale;
	onContentLocaleChange: (locale: TContentLocale) => void;
}

export function ContactTab({ form, isSaving, contentLocale, onContentLocaleChange }: ContactTabProps) {
	return (
		<>
			<Card>
				<CardContent className="pt-6 space-y-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<FormField control={form.control} name="contact_email" render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl><Input {...field} type="email" placeholder="hello@example.com" disabled={isSaving} /></FormControl>
								<FormMessage />
							</FormItem>
						)} />

						<FormField control={form.control} name="contact_phone" render={({ field }) => (
							<FormItem>
								<FormLabel>Phone Number</FormLabel>
								<FormControl><PhoneInput value={field.value} onChange={field.onChange} disabled={isSaving} /></FormControl>
								<FormMessage />
							</FormItem>
						)} />
					</div>

					<FormField control={form.control} name="address" render={({ field }) => (
						<FormItem>
							<FormLabel>Address</FormLabel>
							<FormControl><Textarea {...field} placeholder="Company address" disabled={isSaving} rows={2} /></FormControl>
							<FormMessage />
						</FormItem>
					)} />

					<FormField control={form.control} name="maps_url" render={({ field }) => (
						<FormItem>
							<FormLabel>Maps Embed URL</FormLabel>
							<FormControl>
								<Input {...field} placeholder="https://www.google.com/maps/embed?pb=..." disabled={isSaving} />
							</FormControl>
							<p className="text-sm text-muted-foreground">
								From Google Maps: Share → Embed a map → copy the src URL.
							</p>
							<FormMessage />
						</FormItem>
					)} />

					<FormField control={form.control} name="social_links" render={({ field }) => (
						<FormItem>
							<FormLabel>Social Media</FormLabel>
							<SocialLinksInput value={field.value ?? []} onChange={field.onChange} />
							<FormMessage />
						</FormItem>
					)} />

					<FormField control={form.control} name="business_hours" render={({ field }) => (
						<FormItem>
							<FormLabel>Business Hours</FormLabel>
							<BusinessHoursInput value={field.value ?? []} onChange={field.onChange} disabled={isSaving} />
							<FormMessage />
						</FormItem>
					)} />
				</CardContent>
			</Card>

			<Card className="mt-4">
				<CardContent className="pt-6 space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<FormLabel className="text-base font-semibold">WhatsApp Floating Widget</FormLabel>
							<p className="text-sm text-muted-foreground">Configure floating chat widget visibility and localized response messages.</p>
						</div>
						<FormField control={form.control} name="whatsapp_enabled" render={({ field }) => (
							<FormItem>
								<div className="flex items-center gap-2">
									<FormLabel className="text-sm text-muted-foreground">Enable Widget</FormLabel>
									<FormControl>
										<Switch checked={field.value ?? true} onCheckedChange={field.onChange} disabled={isSaving} />
									</FormControl>
								</div>
								<FormMessage />
							</FormItem>
						)} />
					</div>

					<hr className="my-2 border-border" />

					<ContentLocaleSwitcher value={contentLocale} onChange={onContentLocaleChange} />

					<FormField control={form.control} name={`translations.whatsapp_welcome_message.${contentLocale}`} render={({ field }) => (
						<FormItem>
							<FormLabel>Welcome Message</FormLabel>
							<FormControl>
								<Textarea
									value={field.value ?? ''}
									onChange={field.onChange}
									placeholder="Hi! How can we help you today?"
									rows={2}
									disabled={isSaving}
								/>
							</FormControl>
							<p className="text-sm text-muted-foreground">Main message shown inside the chat widget modal.</p>
							<FormMessage />
						</FormItem>
					)} />

					<FormField control={form.control} name={`translations.whatsapp_greetings.${contentLocale}`} render={({ field }) => (
						<FormItem>
							<FormLabel>Floating Bubble Greetings (Rotating)</FormLabel>
							<FormControl>
								<TagsInput
									value={field.value ?? []}
									onChange={field.onChange}
									placeholder="Type greeting and press Enter..."
									disabled={isSaving}
								/>
							</FormControl>
							<p className="text-sm text-muted-foreground">Short messages that rotate automatically over the floating button.</p>
							<FormMessage />
						</FormItem>
					)} />

					<FormField control={form.control} name={`translations.whatsapp_quick_replies.${contentLocale}`} render={({ field }) => (
						<FormItem>
							<FormLabel>Quick Replies / Topic Suggestions</FormLabel>
							<FormControl>
								<TagsInput
									value={field.value ?? []}
									onChange={field.onChange}
									placeholder="Type topic option and press Enter..."
									disabled={isSaving}
								/>
							</FormControl>
							<p className="text-sm text-muted-foreground">Suggested question chips visitors can click to auto-fill the chat input.</p>
							<FormMessage />
						</FormItem>
					)} />
				</CardContent>
			</Card>
		</>
	);
}
