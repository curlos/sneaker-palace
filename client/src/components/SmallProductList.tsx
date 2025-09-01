import React, { FormEvent } from 'react';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import { Shoe } from '../types/types';
import ListShoe from './ListShoe';
import { useSearchShoesQuery } from '../api/shoesApi';

interface Props {
	searchText: string;
	finalSearchText: string;
	setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
	handleSubmit: (e: FormEvent<Element>) => Promise<void>;
}

const SmallProductList = ({ searchText, finalSearchText, setShowModal, handleSubmit }: Props) => {
	// Use the search query for initial load (empty search)
	const { data: initialData, isLoading: initialLoading } = useSearchShoesQuery({
		searchText: '',
		pageNum: 1,
	});

	// Use the search query for actual searches (only when finalSearchText exists)
	const { data: searchData, isLoading: searchLoading, isFetching: searchFetching } = useSearchShoesQuery(
		{
			searchText: finalSearchText ? finalSearchText.toLowerCase() : '',
			pageNum: 1,
		},
		{
			skip: !finalSearchText.trim(), // Skip query when no search text
		}
	);

	// Determine what data to show and loading state
	const shoes = finalSearchText.trim() ? searchData?.docs || [] : initialData?.docs || [];
	const loading = finalSearchText.trim() ? (searchLoading || searchFetching) : initialLoading;

	return loading ? (
		<div className="flex justify-center py-4">
			<CircleLoader size={16} />
		</div>
	) : (
		<div>
			<div className="pt-0">
				{shoes && shoes.length > 0 ? (
					shoes
						.slice(0, 12)
						.map((shoe: Shoe) => <ListShoe key={shoe._id} shoe={shoe} setShowModal={setShowModal} />)
				) : (
					<div className="flex flex-col items-center py-8 text-center text-gray-500">
						<div className="text-lg font-medium mb-2">No shoes found</div>
						<div className="text-sm">Try searching for a different style or brand</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SmallProductList;
