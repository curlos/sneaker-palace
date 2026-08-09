import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { useState } from 'react';
import { ShoeFilters } from '../types/types';

interface Props {
	filters: ShoeFilters;
	updateFilters: (newFilters: ShoeFilters) => void;
	shoeSizes: Array<string>;
}

const colorSwatchClasses: Record<string, string> = {
	red: 'bg-red-500',
	white: 'bg-white',
	yellow: 'bg-yellow-500',
	black: 'bg-black',
	blue: 'bg-blue-500',
	brown: 'bg-brown-500',
	green: 'bg-green-500',
	gray: 'bg-gray-500',
	pink: 'bg-pink-500',
	purple: 'bg-purple-500',
};

const FilterSidebar = ({ filters, updateFilters, shoeSizes }: Props) => {
	const [showColors, setShowColors] = useState(false);
	const [showBrands, setShowBrands] = useState(false);
	const [showGender, setShowGender] = useState(false);
	const [showPriceRanges, setShowPriceRanges] = useState(false);
	const [showReleaseYear, setShowReleaseYear] = useState(false);
	const [showSizes, setShowSizes] = useState(false);

	const handleColorClick = (color: string) => {
		updateFilters({ ...filters, colors: { ...filters.colors, [color]: !filters.colors[color] } });
	};

	const handleBrandClick = (brand: string) => {
		updateFilters({ ...filters, brands: { ...filters.brands, [brand]: !filters.brands[brand] } });
	};

	const handleGenderClick = (gender: string) => {
		updateFilters({ ...filters, genders: { ...filters.genders, [gender]: !filters.genders[gender] } });
	};

	const handleReleaseYearClick = (releaseYear: string) => {
		updateFilters({
			...filters,
			releaseYears: { ...filters.releaseYears, [releaseYear]: !filters.releaseYears[releaseYear] },
		});
	};

	const handlePriceClick = (priceRange: string) => {
		updateFilters({
			...filters,
			priceRanges: {
				...filters.priceRanges,
				[priceRange]: { ...filters.priceRanges[priceRange], checked: !filters.priceRanges[priceRange].checked },
			},
		});
	};

	const handleSizeClick = (size: string) => {
		updateFilters({ ...filters, shoeSizes: { ...filters.shoeSizes, [size]: !filters.shoeSizes[size] } });
	};

	return (
		<aside id="shoe-filters-sidebar" className="top-0 p-5 w-full flex-[2] overflow-y-auto bg-white max-xl:w-screen">
			<div className="border-0 border-b border-solid border-gray-300 py-3">
				<button
					type="button"
					className="flex justify-between w-full cursor-pointer"
					aria-expanded={showColors}
					aria-controls="filter-panel-color"
					onClick={() => setShowColors(!showColors)}
				>
					<div id="filter-label-color" className="font-bold mb-3">
						Color
					</div>{' '}
					{showColors ? (
						<ChevronUpIcon className="h-6 w-6" aria-hidden="true" />
					) : (
						<ChevronDownIcon className="h-6 w-6" aria-hidden="true" />
					)}
				</button>
				{showColors ? (
					<div
						id="filter-panel-color"
						role="group"
						aria-labelledby="filter-label-color"
						className="flex justify-between flex-wrap gap-2 p-3"
					>
						{Object.keys(filters.colors).map((color) => {
							return (
								<div
									key={`${color}`}
									className="flex flex-col items-center h-13 w-13"
									style={{ height: '52px', width: '52px' }}
								>
									<button
										type="button"
										aria-pressed={!!filters.colors[color]}
										aria-label={color}
										className={`h-7 w-7 rounded-full ${colorSwatchClasses[color]} ${color === 'white' ? 'border border-gray-300' : ''} ${color === 'white' ? 'text-black' : 'text-white'}`}
										onClick={() => handleColorClick(color)}
									>
										{filters.colors[color] ? <CheckIcon aria-hidden="true" /> : null}
									</button>
									<div className="capitalize">{color}</div>
								</div>
							);
						})}
					</div>
				) : null}
			</div>

			<div className="border-0 border-b border-solid border-gray-300 py-3">
				<button
					type="button"
					className="flex justify-between items-center w-full cursor-pointer"
					aria-expanded={showBrands}
					aria-controls="filter-panel-brand"
					onClick={() => setShowBrands(!showBrands)}
				>
					<span id="filter-label-brand" className="font-bold mb-3">
						Brand
					</span>{' '}
					{showBrands ? (
						<ChevronUpIcon className="h-6 w-6" aria-hidden="true" />
					) : (
						<ChevronDownIcon className="h-6 w-6" aria-hidden="true" />
					)}
				</button>

				{showBrands ? (
					<div id="filter-panel-brand" role="group" aria-labelledby="filter-label-brand">
						{Object.keys(filters.brands).map((brand) => {
							return (
								<label key={`${brand}`} className="flex items-center">
									<input
										type="checkbox"
										className="mr-2 cursor-pointer"
										checked={filters.brands[brand]}
										onChange={() => handleBrandClick(brand)}
									></input>
									<span className="capitalize">{brand}</span>
								</label>
							);
						})}
					</div>
				) : null}
			</div>

			<div className="border-0 border-b border-solid border-gray-300 py-3">
				<button
					type="button"
					className="flex justify-between items-center w-full cursor-pointer"
					aria-expanded={showGender}
					aria-controls="filter-panel-gender"
					onClick={() => setShowGender(!showGender)}
				>
					<span id="filter-label-gender" className="font-bold mb-3">
						Gender
					</span>{' '}
					{showGender ? (
						<ChevronUpIcon className="h-6 w-6" aria-hidden="true" />
					) : (
						<ChevronDownIcon className="h-6 w-6" aria-hidden="true" />
					)}
				</button>

				{showGender ? (
					<div id="filter-panel-gender" role="group" aria-labelledby="filter-label-gender">
						{Object.keys(filters.genders).map((gender) => {
							return (
								<label key={`${gender}`} className="flex items-center">
									<input
										type="checkbox"
										className="mr-2 cursor-pointer"
										checked={filters.genders[gender]}
										onChange={() => handleGenderClick(gender)}
									></input>
									<span className="capitalize">{gender}</span>
								</label>
							);
						})}
					</div>
				) : null}
			</div>

			<div className="border-0 border-b border-solid border-gray-300 py-3">
				<button
					type="button"
					className="flex justify-between items-center w-full cursor-pointer"
					aria-expanded={showPriceRanges}
					aria-controls="filter-panel-price"
					onClick={() => setShowPriceRanges(!showPriceRanges)}
				>
					<span id="filter-label-price" className="font-bold mb-3">
						Price
					</span>{' '}
					{showPriceRanges ? (
						<ChevronUpIcon className="h-6 w-6" aria-hidden="true" />
					) : (
						<ChevronDownIcon className="h-6 w-6" aria-hidden="true" />
					)}
				</button>

				{showPriceRanges ? (
					<div id="filter-panel-price" role="group" aria-labelledby="filter-label-price">
						{Object.keys(filters.priceRanges).map((priceRange) => {
							return (
								<label key={`${priceRange}`} className="flex items-center">
									<input
										type="checkbox"
										className="mr-2 cursor-pointer"
										checked={filters.priceRanges[priceRange].checked}
										onChange={() => handlePriceClick(priceRange)}
									></input>
									<span>{priceRange}</span>
								</label>
							);
						})}
					</div>
				) : null}
			</div>

			<div className="border-0 border-b border-solid border-gray-300 py-3">
				<button
					type="button"
					className="flex justify-between items-center w-full cursor-pointer"
					aria-expanded={showReleaseYear}
					aria-controls="filter-panel-release-year"
					onClick={() => setShowReleaseYear(!showReleaseYear)}
				>
					<span id="filter-label-release-year" className="font-bold mb-3">
						Release Year
					</span>{' '}
					{showReleaseYear ? (
						<ChevronUpIcon className="h-6 w-6" aria-hidden="true" />
					) : (
						<ChevronDownIcon className="h-6 w-6" aria-hidden="true" />
					)}
				</button>

				{showReleaseYear ? (
					<div id="filter-panel-release-year" role="group" aria-labelledby="filter-label-release-year">
						{Object.keys(filters.releaseYears)
							.sort((a, b) => Number(b) - Number(a))
							.map((releaseYear) => {
								return (
									<label key={`${releaseYear}`} className="flex items-center">
										<input
											type="checkbox"
											className="mr-2 cursor-pointer"
											checked={filters.releaseYears[releaseYear]}
											onChange={() => handleReleaseYearClick(releaseYear)}
										></input>
										<span>{releaseYear}</span>
									</label>
								);
							})}
					</div>
				) : null}
			</div>

			<div className="py-3">
				<button
					type="button"
					className="flex justify-between items-center w-full cursor-pointer"
					aria-expanded={showSizes}
					aria-controls="filter-panel-size"
					onClick={() => setShowSizes(!showSizes)}
				>
					<span id="filter-label-size" className="font-bold mb-3">
						Size
					</span>{' '}
					{showSizes ? (
						<ChevronUpIcon className="h-6 w-6" aria-hidden="true" />
					) : (
						<ChevronDownIcon className="h-6 w-6" aria-hidden="true" />
					)}
				</button>

				{showSizes ? (
					<div
						id="filter-panel-size"
						role="group"
						aria-labelledby="filter-label-size"
						className="flex flex-wrap"
					>
						{shoeSizes.map((shoeSize) => {
							return (
								<button
									type="button"
									key={shoeSize}
									aria-pressed={!!filters.shoeSizes[shoeSize]}
									className={`min-h-10 px-2 py-2 inline-flex items-center justify-center ${filters.shoeSizes[shoeSize] ? ' border-2 border-black' : 'border border-gray-300'} m-1 rounded-lg cursor-pointer text-xs text-center flex-shrink-0`}
									onClick={() => handleSizeClick(shoeSize)}
								>
									{shoeSize}
								</button>
							);
						})}
					</div>
				) : null}
			</div>
		</aside>
	);
};

export default FilterSidebar;
