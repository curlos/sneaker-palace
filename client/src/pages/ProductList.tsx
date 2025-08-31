import { MenuIcon, XIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { SHOE_SIZES } from '../utils/shoeConstants';

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
	const windowSize = useWindowSize();

	const [sortType, setSortType] = useState('Newest Arrivals');
	const [filters, setFilters] = useState<any>(getInitialFilters(state));
	const [currentPage, setCurrentPage] = useState(1);
	const [showSidebar, setShowSidebar] = useState(windowSize.width < 1280 ? false : true);

	// RTK Query
	const { data: shoesData, isLoading: loading } = useGetPaginatedShoesQuery({
		filters,
		sortType,
		pageNum: currentPage,
		query: query.get('query') || '',
	});
	const paginatedShoes = shoesData?.docs || [];
	const totalShoeCount = shoesData?.totalDocs || 0;

	useEffect(() => {
		setShowSidebar(windowSize.width < 1280 ? false : true);
	}, [windowSize]);

	useEffect(() => {
		window.scrollTo(0, 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query.get('query'), currentPage]);

	useEffect(() => {
		if (windowSize.width >= 768) {
			window.scrollTo(0, 0);
		}
		setCurrentPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters, sortType, query.get('query'), windowSize.width]);

	useEffect(() => {
		setFilters(getInitialFilters(state));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state && state['gender'], state && state['brand']]);

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

				{showSidebar ? <Sidebar filters={filters} setFilters={setFilters} shoeSizes={SHOE_SIZES} /> : null}

				<div className="flex-10 p-4 lg:p-3">
					<div className="flex justify-between">
						<div>
							{query.get('query') ? <div>Search results for</div> : null}
							<div className="text-lg font-bold">
								{query.get('query')
									? `${query.get('query')} (${totalShoeCount})`
									: `Sneakers (${totalShoeCount.toLocaleString()})`}
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div
								className="flex items-center gap-2 cursor-pointer"
								onClick={() => setShowSidebar(!showSidebar)}
							>
								<span>Filters</span>
								<MenuIcon className="h-5 w-5" />
							</div>
							<SortDropdown sortType={sortType} setSortType={setSortType} />
						</div>
					</div>

					<AppliedFilters filters={filters} setFilters={setFilters} />

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
								setCurrentPage={setCurrentPage}
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
