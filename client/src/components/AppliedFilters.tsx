import { XIcon } from '@heroicons/react/solid';

interface Props {
	filters: any;
	updateFilters: (newFilters: any) => void;
}

export const AppliedFilters = ({ filters, updateFilters }: Props) => {
	const getGroupedFilters = () => {
		const grouped: { [key: string]: { displayName: string; values: string[]; type: string } } = {};

		// Colors
		const selectedColors = Object.keys(filters.colors).filter(color => filters.colors[color]);
		if (selectedColors.length > 0) {
			grouped.colors = {
				displayName: selectedColors.length === 1 ? 'Color' : 'Colors',
				values: selectedColors.map(color => color.charAt(0).toUpperCase() + color.slice(1)),
				type: 'colors'
			};
		}

		// Brands
		const selectedBrands = Object.keys(filters.brands).filter(brand => filters.brands[brand]);
		if (selectedBrands.length > 0) {
			grouped.brands = {
				displayName: selectedBrands.length === 1 ? 'Brand' : 'Brands',
				values: selectedBrands,
				type: 'brands'
			};
		}

		// Genders
		const selectedGenders = Object.keys(filters.genders).filter(gender => filters.genders[gender]);
		if (selectedGenders.length > 0) {
			grouped.genders = {
				displayName: selectedGenders.length === 1 ? 'Gender' : 'Genders',
				values: selectedGenders.map(gender => gender.charAt(0).toUpperCase() + gender.slice(1)),
				type: 'genders'
			};
		}

		// Price Ranges
		const selectedPriceRanges = Object.keys(filters.priceRanges).filter(range => filters.priceRanges[range].checked);
		if (selectedPriceRanges.length > 0) {
			grouped.priceRanges = {
				displayName: selectedPriceRanges.length === 1 ? 'Price Range' : 'Price Ranges',
				values: selectedPriceRanges,
				type: 'priceRanges'
			};
		}

		// Release Years
		const selectedYears = Object.keys(filters.releaseYears).filter(year => filters.releaseYears[year]);
		if (selectedYears.length > 0) {
			grouped.releaseYears = {
				displayName: selectedYears.length === 1 ? 'Release Year' : 'Release Years',
				values: selectedYears,
				type: 'releaseYears'
			};
		}

		// Shoe Sizes
		const selectedSizes = Object.keys(filters.shoeSizes).filter(size => filters.shoeSizes[size]);
		if (selectedSizes.length > 0) {
			grouped.shoeSizes = {
				displayName: selectedSizes.length === 1 ? 'Shoe Size' : 'Shoe Sizes',
				values: selectedSizes,
				type: 'shoeSizes'
			};
		}

		return grouped;
	};

	const clearFilterCategory = (type: string) => {
		const newFilters = { ...filters };
		
		if (type === 'priceRanges') {
			newFilters[type] = { ...filters[type] };
			Object.keys(newFilters[type]).forEach(key => {
				newFilters[type][key] = { ...newFilters[type][key], checked: false };
			});
		} else {
			newFilters[type] = { ...filters[type] };
			Object.keys(newFilters[type]).forEach(key => {
				newFilters[type][key] = false;
			});
		}
		
		updateFilters(newFilters);
	};

	const groupedFilters = getGroupedFilters();

	if (Object.keys(groupedFilters).length === 0) {
		return null;
	}

	return (
		<div className="py-4">
			<div className="flex flex-wrap gap-2">
				{Object.entries(groupedFilters).map(([key, group]) => (
					<div
						key={key}
						className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
					>
						<span><span className="font-bold">{group.displayName}</span>: {group.values.join(', ')}</span>
						<XIcon
							className="h-4 w-4 cursor-pointer hover:text-red-500"
							onClick={() => clearFilterCategory(group.type)}
						/>
					</div>
				))}
			</div>
		</div>
	);
};