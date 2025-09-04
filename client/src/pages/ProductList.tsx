import { XIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useGetPaginatedShoesQuery } from '../api/shoesApi';
import { AppliedFilters } from '../components/AppliedFilters';
import { Pagination } from '../components/Pagination';
import Sidebar from '../components/Sidebar';
import SmallShoe from '../components/SmallShoe';
import { SortDropdown } from '../components/SortDropdown';
import SmallShoeSkeleton from '../skeleton_loaders/SmallShoeSkeleton';
import { Shoe } from '../types/types';
import getInitialFilters from '../utils/getInitialFilters';
import { useWindowSize } from '../utils/useWindowSize';
import { buildURLFromFilters } from '../utils/urlFilterUtils';
import { SHOE_SIZES } from '../utils/shoeConstants';
import { AdjustmentsIcon } from '@heroicons/react/outline';

interface stateType {
	brand?: string;
	gender?: string;
}

const useQuery = () => {
	const { search } = useLocation();

	return React.useMemo(() => new URLSearchParams(search), [search]);
};

const ProductList = () => {
	const query = useQuery();
	const { state } = useLocation<stateType>();
	const history = useHistory();
	const windowSize = useWindowSize();

	const [sortType, setSortType] = useState(() => {
		const searchQuery = query.get('query');
		return searchQuery?.trim() ? 'Most Relevant' : 'Newest Arrivals';
	});
	
	// Get filters from URL instead of useState
	const filters = React.useMemo(() => getInitialFilters(state, query), [state, query]);
	
	// Filter setter that updates URL
	const updateFilters = React.useCallback((newFilters: any) => {
		const currentQuery = query.get('query');
		const filterParams = buildURLFromFilters(newFilters);
		
		let newSearch = '';
		if (currentQuery) {
			newSearch = `query=${encodeURIComponent(currentQuery)}`;
		}
		if (filterParams) {
			newSearch = newSearch ? `${newSearch}&${filterParams}` : filterParams;
		}
		
		history.push(`/shoes${newSearch ? `?${newSearch}` : ''}`);
	}, [query, history]);
	const [currentPage, setCurrentPage] = useState(() => {
		const pageParam = query.get('page');
		return pageParam ? parseInt(pageParam, 10) || 1 : 1;
	});
	const [showSidebar, setShowSidebar] = useState(windowSize.width < 1280 ? false : true);
	
	const searchQuery = query.get('query');

	// RTK Query
	const { data: shoesData, isLoading: loading } = useGetPaginatedShoesQuery({
		filters,
		sortType,
		pageNum: currentPage,
		query: searchQuery || '',
	});
	const paginatedShoes = shoesData?.docs || [];
	const totalShoeCount = shoesData?.totalDocs || 0;

	useEffect(() => {
		setShowSidebar(windowSize.width < 1280 ? false : true);
	}, [windowSize]);


	useEffect(() => {
		window.scrollTo(0, 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, currentPage]);

	useEffect(() => {
		// Set sortType to 'Most Relevant' when there's a search query
		if (searchQuery?.trim()) {
			setSortType('Most Relevant');
		}
	}, [searchQuery]);
	
	useEffect(() => {
		if (windowSize.width >= 768) {
			window.scrollTo(0, 0);
		}
		setCurrentPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters, sortType, searchQuery, windowSize.width]);

	// Callback to handle page changes and URL updates
	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
		
		const currentSearchParams = new URLSearchParams(window.location.search);
		if (newPage > 1) {
			currentSearchParams.set('page', newPage.toString());
		} else {
			currentSearchParams.delete('page');
		}
		
		const newSearch = currentSearchParams.toString();
		const newUrl = `/shoes${newSearch ? `?${newSearch}` : ''}`;
		history.replace(newUrl);
	};

	// Update currentPage when URL page parameter changes
	useEffect(() => {
		const pageParam = query.get('page');
		const urlPage = pageParam ? parseInt(pageParam, 10) || 1 : 1;
		if (urlPage !== currentPage) {
			setCurrentPage(urlPage);
		}
	}, [query, currentPage]);

	return (
		<div className="text-xl-lg">
			<div className="bg-gray-200">
				<div className="container mx-auto px-4 py-2 max-w-7xl flex justify-center text-lg font-bold">
					FREE SHIPPING ON ALL SHOES
				</div>
			</div>
			<div className="container mx-auto max-w-7xl flex xl:block flex-grow">
				{showSidebar ? (
					<div className="flex justify-end p-3 pb-0 cursor-pointer hidden xl:block">
						<XIcon className="h-5 w-5" onClick={() => setShowSidebar(false)} />{' '}
					</div>
				) : null}

				{showSidebar ? <Sidebar filters={filters} updateFilters={updateFilters} shoeSizes={SHOE_SIZES} /> : null}

				<div className="flex-10 p-4 lg:p-3">
					<div className="flex justify-between sm:flex-col">
						<div>
							{searchQuery ? <div>Search results for</div> : null}
							<div className="flex items-center gap-3">
								<div className="text-lg font-bold">
									{searchQuery
										? `${searchQuery} (${totalShoeCount})`
										: `Sneakers (${totalShoeCount.toLocaleString()})`}
								</div>
								{searchQuery && (
									<button
										onClick={() => history.push('/shoes')}
										className="flex items-center justify-center w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
										title="Clear search"
									>
										<XIcon className="h-4 w-4 text-gray-600" />
									</button>
								)}
							</div>
						</div>

						<div className="flex items-center gap-3 sm:mt-3">
							<div
								className="flex items-center gap-2 cursor-pointer p-2 border border-gray-300 rounded-full"
								onClick={() => setShowSidebar(!showSidebar)}
							>
								<span className="">Filters</span>
								<AdjustmentsIcon className="h-5 w-5" />
							</div>
							<SortDropdown sortType={sortType} setSortType={setSortType} />
						</div>
					</div>

					<AppliedFilters filters={filters} updateFilters={updateFilters} />

					{loading ? (
						<div className="flex justify-center flex-wrap lg:justify-between py-4">
							{Array.from({ length: 12 }, (_, index) => (
								<SmallShoeSkeleton key={index} />
							))}
						</div>
					) : (
						<div>
							<div className="flex justify-center flex-wrap lg:justify-between">
								{paginatedShoes.map((shoe: Shoe) => {
									return <SmallShoe key={shoe.shoeID} shoe={shoe} />;
								})}
							</div>

							<Pagination
								pageLimit={Math.ceil(totalShoeCount / 12)}
								dataLimit={12}
								currentPage={currentPage}
								setCurrentPage={handlePageChange}
								totalItemCount={totalShoeCount}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProductList;
