'use client';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { WEEKDAYS, type TBusinessHour, type TWeekday } from '@/contracts';

const DAY_LABELS: Record<TWeekday, string> = {
	monday: 'Monday',
	tuesday: 'Tuesday',
	wednesday: 'Wednesday',
	thursday: 'Thursday',
	friday: 'Friday',
	saturday: 'Saturday',
	sunday: 'Sunday',
};

interface BusinessHoursInputProps {
	value: TBusinessHour[];
	onChange: (value: TBusinessHour[]) => void;
	disabled?: boolean;
	className?: string;
}

export function BusinessHoursInput({ value, onChange, disabled, className }: BusinessHoursInputProps) {
	const rowFor = (day: TWeekday): TBusinessHour =>
		value.find((row) => row.day === day) ?? { day, is_closed: false, open_time: '09:00', close_time: '18:00' };

	const updateDay = (day: TWeekday, patch: Partial<TBusinessHour>) => {
		const existing = rowFor(day);
		const next = { ...existing, ...patch };
		const withoutDay = value.filter((row) => row.day !== day);
		onChange([...withoutDay, next].sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day)));
	};

	return (
		<div className={className}>
			<div className="space-y-2">
				{WEEKDAYS.map((day) => {
					const row = rowFor(day);
					return (
						<div key={day} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 sm:grid-cols-[110px_auto_1fr]">
							<span className="text-sm font-medium">{DAY_LABELS[day]}</span>

							{row.is_closed ? (
								<span className="text-sm text-muted-foreground sm:col-span-1">Closed</span>
							) : (
								<div className="flex items-center gap-2">
									<Input
										type="time"
										value={row.open_time ?? ''}
										onChange={(e) => updateDay(day, { open_time: e.target.value })}
										disabled={disabled}
										className="w-32"
									/>
									<span className="text-sm text-muted-foreground">–</span>
									<Input
										type="time"
										value={row.close_time ?? ''}
										onChange={(e) => updateDay(day, { close_time: e.target.value })}
										disabled={disabled}
										className="w-32"
									/>
								</div>
							)}

							<label className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
								Closed
								<Switch
									checked={row.is_closed}
									onCheckedChange={(checked) => updateDay(day, { is_closed: checked })}
									disabled={disabled}
								/>
							</label>
						</div>
					);
				})}
			</div>
		</div>
	);
}
