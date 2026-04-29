"use client"

import * as React from "react"
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, isSameDay } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/libs/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerWithSidebarProps {
    className?: string
    date: DateRange | undefined
    onDateChange: (date: DateRange | undefined) => void
    noFilterLabel?: string
}

export function DateRangePickerWithSidebar({
    className,
    date,
    onDateChange,
    noFilterLabel,
}: DateRangePickerWithSidebarProps) {
    const [open, setOpen] = React.useState(false)

    // Helper to check if a range matches a preset
    const isRange = (range: DateRange | undefined, target: DateRange) => {
        if (!range?.from || !range?.to || !target.from || !target.to) return false
        return isSameDay(range.from, target.from) && isSameDay(range.to, target.to)
    }

    const presets = [
        {
            label: "Hari Ini",
            range: { from: new Date(), to: new Date() },
        },
        {
            label: "Kemarin",
            range: { from: subDays(new Date(), 1), to: subDays(new Date(), 1) },
        },
        {
            label: "Minggu Ini",
            range: { from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) },
        },
        {
            label: "Bulan Ini",
            range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
        },
        {
            label: "Tahun Ini",
            range: { from: startOfYear(new Date()), to: endOfYear(new Date()) },
        },
    ]

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd MMM yyyy")} - {format(date.to, "dd MMM yyyy")}
                                </>
                            ) : (
                                format(date.from, "dd MMM yyyy")
                            )
                        ) : (
                            <span className="text-muted-foreground italic">
                                {noFilterLabel ?? "Pilih tanggal"}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                        <div className="flex flex-col border-r p-2 space-y-1 w-[140px]">
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="ghost"
                                    className={cn(
                                        "justify-start font-normal h-8 px-2",
                                        isRange(date, preset.range) && "bg-accent text-accent-foreground font-medium"
                                    )}
                                    onClick={() => {
                                        onDateChange(preset.range)
                                        // Keep open or close? Typically keep open for user to see selection, or close for quick action.
                                        // User requested "custom" which implies manual selection keeps it open, presets usually close it or update calendar.
                                        // Let's update the calendar view to the start of the range.
                                    }}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                            <Button
                                variant="ghost"
                                className={cn(
                                    "justify-start font-normal h-8 px-2",
                                    // simplistic check: if not any preset, it's custom
                                    !presets.some(p => isRange(date, p.range)) && date && "bg-accent text-accent-foreground font-medium"
                                )}
                                onClick={() => {
                                    // logic to clear or just set generic range?
                                    // Usually "Custom" is just the state when no preset matches.
                                    // We can't really "click" custom to do anything specific other than maybe focus the calendar.
                                }}
                            >
                                Custom
                            </Button>
                        </div>
                        <div className="p-2">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={onDateChange}
                                numberOfMonths={2}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
