import dayjs from 'dayjs';

export function getCalendarMonth({ month = dayjs().month() }) {
	month = Math.floor(month);

	const year = dayjs().year();
	const firstDayOfTheMonth = dayjs(new Date(year, month, 1)).day();
	let currentMonthCount = 0 - firstDayOfTheMonth;

	const daysMatrix = [...Array(6)].map(() => {
		return [...Array(7)].map(() => {
			currentMonthCount++;
			return dayjs(new Date(year, month, currentMonthCount));
		});
	});

	return daysMatrix;
}

export function getRangeYear({ year = dayjs().year() }) {
	const currentYear = year;
	const years = [];

	for (let i = 0; i < 5; i += 1) {
		years.push(currentYear - i);
	}

	for (let i = 1; i < 8; i += 1) {
		years.push(currentYear + i);
	}

	return years.sort();
}
