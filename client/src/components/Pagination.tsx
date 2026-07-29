import {
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from '@heroicons/react/solid';
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface Props {
	pageLimit: number;
	dataLimit: number;
	currentPage: number;
	setCurrentPage: (page: number) => void;
	totalItemCount: number;
	scrollTarget?: React.RefObject<HTMLElement>;
	getPageHref?: (page: number) => string;
}

interface PageControlProps {
	href?: string;
	onClick: () => void;
	ariaLabel: string;
	ariaCurrent?: 'page';
	className: string;
	children: React.ReactNode;
}

const PageControl = ({ href, onClick, ariaLabel, ariaCurrent, className, children }: PageControlProps) => {
	if (href) {
		return (
			<Link
				to={href}
				replace
				onClick={onClick}
				aria-label={ariaLabel}
				aria-current={ariaCurrent}
				className={className}
			>
				{children}
			</Link>
		);
	}

	return (
		<button type="button" onClick={onClick} aria-label={ariaLabel} aria-current={ariaCurrent} className={className}>
			{children}
		</button>
	);
};

export const Pagination = ({
	pageLimit,
	dataLimit,
	currentPage,
	setCurrentPage,
	totalItemCount,
	scrollTarget,
	getPageHref,
}: Props) => {
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (scrollTarget?.current) {
			if (!isFirstRender.current) {
				scrollTarget.current.scrollIntoView({ behavior: 'smooth' });
				scrollTarget.current.focus({ preventScroll: true });
			}
		} else {
			window.scrollTo(0, 0);
		}

		if (isFirstRender.current) {
			isFirstRender.current = false;
		}
	}, [currentPage, scrollTarget]);

	const goToNextPage = () => {
		if (currentPage === pageLimit) {
			return;
		}

		setCurrentPage(currentPage + 1);
	};

	const goToPreviousPage = () => {
		if (currentPage === 1) {
			return;
		}

		setCurrentPage(currentPage - 1);
	};

	const goToFirstPage = () => {
		setCurrentPage(1);
	};

	const goToLastPage = () => {
		setCurrentPage(pageLimit);
	};

	const getPaginationGroup = () => {
		const start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;

		return new Array(pageLimit).fill(undefined).map((_, idx) => start + idx + 1);
	};

	const pageNumbers =
		pageLimit <= 5
			? Array.from({ length: pageLimit }, (_, i) => i + 1)
			: pageLimit - currentPage < 5
				? getPaginationGroup()
						.slice(Math.max(0, pageLimit - 5), pageLimit)
						.filter((pageNum) => pageNum > 0 && pageNum <= pageLimit)
				: getPaginationGroup()
						.slice(Math.max(0, currentPage - 1), Math.min(pageLimit, currentPage + 4))
						.filter((pageNum) => pageNum > 0 && pageNum <= pageLimit);

	return (
		<div className="flex justify-between items-center my-4 text-black max-sm:justify-between max-sm:px-3">
			<div className="pagResults max-sm:hidden">
				Showing <strong>{(currentPage * dataLimit - dataLimit + 1).toLocaleString()}</strong> to{' '}
				<strong>
					{(currentPage * dataLimit - dataLimit + dataLimit - 1 >= totalItemCount
						? totalItemCount
						: currentPage * dataLimit - dataLimit + dataLimit
					).toLocaleString()}
				</strong>{' '}
				of <strong>{totalItemCount.toLocaleString()}</strong> results
			</div>

			<div className="flex w-1/2 justify-end max-sm:justify-between max-sm:w-full max-sm:gap-4">
				<PageControl
					href={getPageHref?.(1)}
					onClick={goToFirstPage}
					ariaLabel="First page"
					className="p-3 border border-gray-300 border-r-0 cursor-pointer rounded-tl-lg rounded-bl-lg flex items-center justify-center max-sm:hidden"
				>
					<ChevronDoubleLeftIcon className="h-5 w-5" aria-hidden="true" />
				</PageControl>

				<PageControl
					href={getPageHref?.(Math.max(1, currentPage - 1))}
					onClick={goToPreviousPage}
					ariaLabel="Previous page"
					className="p-3 px-3 border border-gray-300 border-r-0 cursor-pointer flex items-center justify-center max-sm:border-l max-sm:w-1/2 max-sm:border-r max-sm:rounded-lg"
				>
					<ChevronLeftIcon className="h-5 w-5 max-sm:hidden" aria-hidden="true" />
					<span className="hidden max-sm:block">Previous</span>
				</PageControl>

				{pageNumbers.map((pageNum) => (
					<PageControl
						key={pageNum}
						href={getPageHref?.(pageNum)}
						onClick={() => setCurrentPage(pageNum)}
						ariaLabel={`Page ${pageNum}`}
						ariaCurrent={currentPage === pageNum ? 'page' : undefined}
						className={`p-3 px-4 border border-gray-300 cursor-pointer max-sm:hidden ${currentPage === pageNum ? 'border-2 border-gray-700 font-bold' : 'border-r-0'}`}
					>
						{pageNum}
					</PageControl>
				))}

				<PageControl
					href={getPageHref?.(Math.min(pageLimit, currentPage + 1))}
					onClick={goToNextPage}
					ariaLabel="Next page"
					className="p-3 border border-r-0 border-gray-300 cursor-pointer flex items-center justify-center max-sm:border-r max-sm:w-1/2  max-sm:rounded-lg"
				>
					<ChevronRightIcon className="h-5 w-5 max-sm:hidden" aria-hidden="true" />
					<span className="hidden max-sm:block">Next</span>
				</PageControl>

				<PageControl
					href={getPageHref?.(pageLimit)}
					onClick={goToLastPage}
					ariaLabel="Last page"
					className="p-3 border border-gray-300 border-r-1 rounded-tr-lg rounded-br-lg cursor-pointer flex items-center justify-center max-sm:hidden"
				>
					<ChevronDoubleRightIcon className="h-5 w-5" aria-hidden="true" />
				</PageControl>
			</div>
		</div>
	);
};
