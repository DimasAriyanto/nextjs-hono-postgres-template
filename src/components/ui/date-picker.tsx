'use client';

import * as React from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
	'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
	'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

interface DatePickerProps {
	/** Value as YYYY-MM-DD or ISO string */
	value?: string;
	onChange?: (value: string) => void;
	/**
	 * Output format:
	 * - 'date' (default) → 'YYYY-MM-DD'
	 * - 'iso' → 'YYYY-MM-DDTHH:mm:ss' (time is preserved as 00:00:00)
	 */
	valueFormat?: 'date' | 'iso';
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	minDate?: string;
	maxDate?: string;
}

export function DatePicker({
	value,
	onChange,
	valueFormat = 'date',
	placeholder = 'Pilih tanggal',
	disabled,
	className,
	minDate,
	maxDate,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [view, setView] = React.useState<'calendar' | 'month-year'>('calendar');

	const parsed = value ? dayjs(value) : null;
	const selectedDate = parsed?.isValid() ? parsed.toDate() : undefined;

	const initialMonth = React.useMemo(() => {
		if (parsed?.isValid()) return parsed.toDate();
		if (minDate) { const m = dayjs(minDate); if (m.isValid()) return m.toDate(); }
		return new Date();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [displayMonth, setDisplayMonth] = React.useState<Date>(initialMonth);
	const [pickerYear, setPickerYear] = React.useState(() => dayjs(initialMonth).year());

	React.useEffect(() => {
		if (parsed?.isValid()) {
			setDisplayMonth(parsed.toDate());
		} else if (minDate) {
			const m = dayjs(minDate);
			if (m.isValid()) setDisplayMonth(m.toDate());
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, minDate]);

	const displayMonthDayjs = dayjs(displayMonth);
	const currentDisplayMonth = displayMonthDayjs.month();
	const currentDisplayYear = displayMonthDayjs.year();

	const handleDaySelect = (day: Date | undefined) => {
		if (!day) return;
		const d = dayjs(day);
		onChange?.(valueFormat === 'iso' ? d.hour(0).minute(0).second(0).format('YYYY-MM-DDTHH:mm:ss') : d.format('YYYY-MM-DD'));
		setOpen(false);
	};

	const handleMonthSelect = (monthIndex: number) => {
		setDisplayMonth(new Date(pickerYear, monthIndex, 1));
		setView('calendar');
	};

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) setView('calendar');
	};

	const disabledDays: import('react-day-picker').Matcher[] = [
		...(minDate ? [{ before: dayjs(minDate).startOf('day').toDate() }] : []),
		...(maxDate ? [{ after: dayjs(maxDate).endOf('day').toDate() }] : []),
	];

	const displayLabel = parsed?.isValid() ? parsed.format('DD MMM YYYY') : null;
	const headerLabel = parsed?.isValid()
		? `${DAYS_SHORT[parsed.day()]}, ${parsed.format('DD')} ${MONTHS_SHORT[parsed.month()]}`
		: null;

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					disabled={disabled}
					className={cn(
						'h-10 w-full justify-start px-3 font-normal',
						!displayLabel && 'text-muted-foreground',
						className,
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
					<span className="truncate">{displayLabel ?? placeholder}</span>
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-auto p-0 overflow-hidden" align="start">
				{/* Header */}
				<div className="bg-primary text-primary-foreground px-4 pt-4 pb-3">
					<p className="text-xs font-medium uppercase tracking-wider opacity-70 mb-1">Pilih Tanggal</p>
					<p className="text-2xl font-bold tracking-tight">
						{headerLabel ?? <span className="opacity-50 text-base font-normal">{placeholder}</span>}
					</p>
				</div>

				{view === 'calendar' ? (
					<>
						<div className="flex items-center justify-between px-3 pt-3 pb-0">
							<button
								type="button"
								onClick={() => { setPickerYear(currentDisplayYear); setView('month-year'); }}
								className="flex items-center gap-1 text-sm font-semibold rounded-md px-1 py-0.5 hover:bg-accent transition-colors"
							>
								{MONTHS[currentDisplayMonth]} {currentDisplayYear}
								<ChevronDown className="h-3.5 w-3.5 opacity-60" />
							</button>
							<div className="flex gap-0.5">
								<Button variant="ghost" size="icon" className="h-7 w-7" type="button"
									onClick={() => setDisplayMonth(displayMonthDayjs.subtract(1, 'month').toDate())}>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="icon" className="h-7 w-7" type="button"
									onClick={() => setDisplayMonth(displayMonthDayjs.add(1, 'month').toDate())}>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={handleDaySelect}
							month={displayMonth}
							onMonthChange={setDisplayMonth}
							disabled={disabledDays}
							hideNavigation
							classNames={{ month_caption: 'hidden' }}
						/>
					</>
				) : (
					<div className="p-4 w-[280px]">
						<div className="flex items-center justify-between mb-4">
							<Button variant="ghost" size="icon" className="h-7 w-7" type="button"
								onClick={() => setPickerYear((y) => y - 1)}>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="text-sm font-semibold">{pickerYear}</span>
							<Button variant="ghost" size="icon" className="h-7 w-7" type="button"
								onClick={() => setPickerYear((y) => y + 1)}>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
						<div className="grid grid-cols-3 gap-1.5">
							{MONTHS_SHORT.map((month, i) => {
								const isActive = i === currentDisplayMonth && pickerYear === currentDisplayYear;
								return (
									<button
										key={i}
										type="button"
										onClick={() => handleMonthSelect(i)}
										className={cn(
											'rounded-md py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
											isActive && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
										)}
									>
										{month}
									</button>
								);
							})}
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
