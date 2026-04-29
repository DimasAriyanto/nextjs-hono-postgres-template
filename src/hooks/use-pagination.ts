import { useState, useMemo } from 'react';

interface UsePaginationOptions {
	total: number;
	initialPage?: number;
	initialPerPage?: number;
}

export function usePagination({ total, initialPage = 1, initialPerPage = 10 }: UsePaginationOptions) {
	const [page, setPage] = useState(initialPage);
	const [perPage, setPerPage] = useState(initialPerPage);

	const totalPages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total, perPage]);

	const goTo = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));
	const next = () => goTo(page + 1);
	const prev = () => goTo(page - 1);
	const first = () => goTo(1);
	const last = () => goTo(totalPages);

	const changePerPage = (value: number) => {
		setPerPage(value);
		setPage(1);
	};

	const offset = (page - 1) * perPage;

	return {
		page,
		perPage,
		totalPages,
		offset,
		hasNext: page < totalPages,
		hasPrev: page > 1,
		goTo,
		next,
		prev,
		first,
		last,
		changePerPage,
	};
}
