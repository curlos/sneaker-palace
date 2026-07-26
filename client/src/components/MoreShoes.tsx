import { useState, useEffect, useRef } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { useGetShoesFromPageQuery, useGetPaginatedShoesQuery } from '../api/shoesApi';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import { Shoe } from '../types/types';
import getInitialFilters from '../utils/getInitialFilters';
import SmallShoe from './SmallShoe';
import { useLocation } from 'react-router-dom';

interface MoreShoesProps {
	shoe?: Shoe;
}

interface stateType {
	brand?: string;
	gender?: string;
	sortType?: string;
}

const MoreShoes = ({ shoe }: MoreShoesProps) => {
	const { state } = useLocation<stateType>();
	const [randomPageNum, setRandomPageNum] = useState(() => Math.floor(Math.random() * 800));

	// react-multi-carousel doesn't remove offscreen slides from the tab order (only
	// visually hides them via CSS transform), so keyboard users can tab into shoes
	// that aren't currently in view. With infinite=true the library also clones each
	// slide (confirmed: every shoe renders twice in the DOM) and mounts/remounts items
	// internally as it settles on mount, so tracking via React refs races the library's
	// own churn. Instead, observe the DOM directly: query the library's own item
	// wrapper elements and toggle each one's link tabindex via IntersectionObserver,
	// re-syncing via MutationObserver whenever the library adds/removes items.
	const carouselWrapperRef = useRef<HTMLDivElement>(null);

	// Regenerate random page when shoe changes (if provided)
	useEffect(() => {
		if (!shoe) {
			setRandomPageNum(Math.floor(Math.random() * 800));
		}
	}, [shoe]);

	// Get filters (empty filters for this use case)
	const filters = getInitialFilters(state);

	// Use search query when shoe is provided (fetch 13 to account for filtering out current shoe)
	const { data: searchShoesData, isLoading: searchLoading, isFetching: searchFetching } = useGetPaginatedShoesQuery(
		{
			filters,
			sortType: 'Most Relevant',
			pageNum: 1,
			query: shoe?.name ? shoe.name.toLowerCase() : '',
			limit: 13, // Fetch 13 so we can filter out 1 and still have 12
		},
		{
			skip: !shoe, // Skip when no shoe is provided
		}
	);

	// Filter search results to exclude current shoe
	const filteredSearchShoes = shoe && searchShoesData?.docs 
		? searchShoesData.docs
			.filter((shoeItem: Shoe) => 
				shoeItem._id !== shoe._id && shoeItem.shoeID !== shoe.shoeID
			)
			.slice(0, 12)
		: [];

	// Determine if we need to fall back to random shoes
	// This happens when: 1) No shoe provided, OR 2) Shoe provided but search returned no usable results
	const needsRandomFallback = !shoe || (shoe && !searchLoading && !searchFetching && filteredSearchShoes.length === 0);

	// Use random page query when no shoe is provided OR when search returns no results
	const { data: randomShoesData, isLoading: randomLoading } = useGetShoesFromPageQuery(
		randomPageNum,
		{
			skip: !needsRandomFallback, // Skip when we don't need random fallback
		}
	);

	// Determine what data to show and loading state
	let allShoes: Shoe[] = [];
	let loading = false;

	if (!shoe) {
		// No shoe provided - use random shoes
		allShoes = randomShoesData?.docs || [];
		loading = randomLoading;
	} else if (searchLoading || searchFetching) {
		// Shoe provided and search is loading
		allShoes = [];
		loading = true;
	} else if (filteredSearchShoes.length > 0) {
		// Shoe provided and search found results
		allShoes = filteredSearchShoes;
		loading = false;
	} else {
		// Shoe provided but search found no results - fall back to random
		allShoes = randomShoesData?.docs || [];
		loading = randomLoading;
	}

	// Re-observe visibility whenever the set of rendered shoes changes
	const shoeIdsKey = allShoes.map((s) => s.shoeID).join(',');
	useEffect(() => {
		const wrapper = carouselWrapperRef.current;
		if (!wrapper) return;
		// Use the library's own clipping viewport as the root for precise boundary matching
		// (the outer wrapper div can be slightly larger than the actual visible area).
		const root = wrapper.querySelector<HTMLElement>('.react-multi-carousel-list') || wrapper;

		const intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const link = entry.target.querySelector('a[href^="/shoe/"]');
					if (!link) return;
					if (entry.isIntersecting) {
						link.removeAttribute('tabindex');
					} else {
						link.setAttribute('tabindex', '-1');
					}
				});
			},
			{ root, threshold: 0 }
		);

		const observedItems = new Set<Element>();
		const syncObservedItems = () => {
			root.querySelectorAll('.react-multi-carousel-item').forEach((item) => {
				if (!observedItems.has(item)) {
					observedItems.add(item);
					intersectionObserver.observe(item);
				}
			});
		};

		syncObservedItems();

		// react-multi-carousel adds/removes clone items as it settles after mount,
		// so keep observing any newly-added items too.
		const mutationObserver = new MutationObserver(syncObservedItems);
		mutationObserver.observe(root, { childList: true, subtree: true });

		return () => {
			intersectionObserver.disconnect();
			mutationObserver.disconnect();
		};
	}, [shoeIdsKey]);

	// Responsive breakpoints for carousel
	const responsive = {
		desktop: {
			breakpoint: { max: 3000, min: 640 },
			items: 3,
			slidesToSlide: 3, // Move 3 items at once
		},
		mobile: {
			breakpoint: { max: 640, min: 0 },
			items: 2,
			slidesToSlide: 2, // Move 2 items at once on mobile
		},
	};

	// Custom arrow components
	const CustomLeftArrow = ({ onClick }: any) => (
		<button
			type="button"
			aria-label="Previous"
			onClick={onClick}
			className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-gray-300 hover:border-gray-600"
		>
			<ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
		</button>
	);

	const CustomRightArrow = ({ onClick }: any) => (
		<button
			type="button"
			aria-label="Next"
			onClick={onClick}
			className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-gray-300 hover:border-gray-600"
		>
			<ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
		</button>
	);

	// Custom dot component for indicators
	const CustomDot = ({ onClick, active, index }: any) => (
		<button
			type="button"
			aria-label={`Go to slide ${index + 1}`}
			aria-current={active ? 'true' : undefined}
			onClick={onClick}
			className={`w-8 h-1 rounded-full mx-1 transition-all duration-200 ${
				active ? 'bg-gray-800' : 'bg-gray-300'
			}`}
		/>
	);

	return loading ? (
		<div className="flex justify-center py-4">
			<CircleLoader size={16} />
		</div>
	) : (
		<div className="mt-7">
			{/* Header */}
			<h2 className="text-2xl mb-4">You Might Also Like</h2>

			{/* Carousel */}
			<div ref={carouselWrapperRef}>
				<Carousel
					responsive={responsive}
					infinite={true}
					autoPlay={false}
					showDots={true}
					customLeftArrow={<CustomLeftArrow />}
					customRightArrow={<CustomRightArrow />}
					swipeable={true}
					customDot={<CustomDot />}
					dotListClass="flex justify-center mt-4 space-x-2"
					containerClass="carousel-container"
					itemClass="px-2"
				>
					{allShoes.map((shoe: Shoe) => (
						<SmallShoe key={shoe.shoeID} shoe={shoe} />
					))}
				</Carousel>
			</div>
		</div>
	);
};

export default MoreShoes;
