'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/libs/utils';

interface PhoneInputProps {
	value?: string;
	onChange: (value: string) => void;
	defaultCountry?: CountryCode;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

function getFlagEmoji(countryCode: string): string {
	return countryCode
		.toUpperCase()
		.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const regionNames = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
	? new Intl.DisplayNames(['en'], { type: 'region' })
	: null;

interface CountryOption {
	country: CountryCode;
	callingCode: string;
	name: string;
	flag: string;
}

const COUNTRY_OPTIONS: CountryOption[] = getCountries()
	.map((country) => ({
		country,
		callingCode: getCountryCallingCode(country),
		name: regionNames?.of(country) ?? country,
		flag: getFlagEmoji(country),
	}))
	.sort((a, b) => a.name.localeCompare(b.name));

/**
 * Normalize what the user typed/pasted before handing it to AsYouType.
 *
 * Handles inputs that already carry a country code even though the user also has a
 * country selected in the dropdown (e.g. pasting "+62 812-345-678", "0062812345678",
 * or "62812345678" while Indonesia is selected) — without this, AsYouType would
 * treat the leading "62" as part of the national number and double-count it
 * (e.g. "62812345678" → "+6262812345678" instead of "+62812345678").
 */
function normalizeRawInput(raw: string, country: CountryCode): string {
	let digits = raw.replace(/[^\d+]/g, '');
	if (digits.startsWith('00')) digits = `+${digits.slice(2)}`;
	if (digits.startsWith('+')) return digits;

	const callingCode = getCountryCallingCode(country);
	if (digits.startsWith(callingCode) && digits.length > callingCode.length) {
		const rest = digits.slice(callingCode.length);
		const candidate = new AsYouType(country);
		candidate.input(rest);
		if (candidate.getNumber()?.isValid()) return rest;
	}

	return digits;
}

/**
 * International phone number input: a country selector (flag + dial code) paired
 * with a number field. Formats the number as the user types and reports the value
 * to `onChange` as an E.164 string (e.g. "+6281234567890").
 */
export function PhoneInput({ value = '', onChange, defaultCountry = 'ID', disabled, placeholder, className }: PhoneInputProps) {
	const [country, setCountry] = React.useState<CountryCode>(defaultCountry);
	const [nationalInput, setNationalInput] = React.useState('');
	const [isFocused, setIsFocused] = React.useState(false);
	const [syncedValue, setSyncedValue] = React.useState(value);
	const [open, setOpen] = React.useState(false);

	// Adjust the displayed country + national number when the external E.164 value
	// changes (e.g. form reset), but not while the user is actively typing. Runs
	// during render rather than an effect — see
	// https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
	if (value !== syncedValue && !isFocused) {
		setSyncedValue(value);
		if (!value) {
			setNationalInput('');
		} else {
			// `defaultCountry` is a hint for legacy/free-text values that were saved
			// without a leading "+" (e.g. "081234567890" from before this component
			// existed) — ignored when `value` is already a proper "+..." E.164 string.
			const parsed = parsePhoneNumberFromString(value, defaultCountry);
			if (parsed) {
				setCountry(parsed.country ?? defaultCountry);
				setNationalInput(parsed.formatNational());
			} else {
				setNationalInput(value);
			}
		}
	}

	const handleCountryChange = (nextCountry: CountryCode) => {
		setCountry(nextCountry);
		setOpen(false);

		const digits = nationalInput.replace(/\D/g, '');
		if (!digits) return;

		const formatter = new AsYouType(nextCountry);
		formatter.input(digits);
		setNationalInput(formatter.getNumber()?.formatNational() ?? digits);
		onChange(formatter.getNumber()?.number ?? '');
	};

	const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const normalized = normalizeRawInput(e.target.value, country);

		// A "+..." (or "00...") input is a full international number, possibly for a
		// different country than the one currently selected — re-derive both from it
		// instead of treating the whole string as this country's national number.
		if (normalized.startsWith('+')) {
			const parsed = parsePhoneNumberFromString(normalized);
			if (parsed) {
				if (parsed.country && parsed.country !== country) setCountry(parsed.country);
				setNationalInput(parsed.formatNational());
				onChange(parsed.number);
				return;
			}
		}

		const formatter = new AsYouType(country);
		setNationalInput(formatter.input(normalized));
		onChange(formatter.getNumber()?.number ?? '');
	};

	const selected = COUNTRY_OPTIONS.find((c) => c.country === country);

	return (
		<div className={cn('flex gap-2', className)}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						role="combobox"
						aria-expanded={open}
						disabled={disabled}
						className="h-10 w-[92px] shrink-0 justify-between px-2 font-normal"
					>
						<span className="flex items-center gap-1.5">
							<span>{selected?.flag}</span>
							<span>+{selected?.callingCode}</span>
						</span>
						<ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-72 p-0" align="start">
					<Command>
						<CommandInput placeholder="Search country..." />
						<CommandList>
							<CommandEmpty>No country found.</CommandEmpty>
							<CommandGroup>
								{COUNTRY_OPTIONS.map((opt) => (
									<CommandItem
										key={opt.country}
										value={`${opt.name} +${opt.callingCode}`}
										onSelect={() => handleCountryChange(opt.country)}
									>
										<Check className={cn('mr-2 h-4 w-4', country === opt.country ? 'opacity-100' : 'opacity-0')} />
										<span className="mr-2">{opt.flag}</span>
										<span className="flex-1 truncate">{opt.name}</span>
										<span className="text-muted-foreground">+{opt.callingCode}</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			<Input
				type="tel"
				inputMode="tel"
				value={nationalInput}
				onChange={handleNumberChange}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				disabled={disabled}
				placeholder={placeholder ?? 'Phone number'}
				className="flex-1"
			/>
		</div>
	);
}
