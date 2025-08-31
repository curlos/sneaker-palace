import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import React, { useState } from 'react';

interface Props {
	filters: {
		colors: any;
		brands: any;
		genders: any;
		priceRanges: any;
		releaseYears: any;
		shoeSizes: any;
	};
	setFilters: any;
	shoeSizes: Array<string>;
}

const Sidebar = ({ filters, setFilters, shoeSizes }: Props) => {
	const [showColors, setShowColors] = useState(false);
	const [showBrands, setShowBrands] = useState(false);
	const [showGender, setShowGender] = useState(false);
	const [showPriceRanges, setShowPriceRanges] = useState(false);
	const [showReleaseYear, setShowReleaseYear] = useState(false);
	const [showSizes, setShowSizes] = useState(false);

	const handleColorClick = (color: string) => {
		setFilters({ ...filters, colors: { ...filters.colors, [color]: !filters.colors[color] } });
	};

	const handleBrandClick = (brand: string) => {
		setFilters({ ...filters, brands: { ...filters.brands, [brand]: !filters.brands[brand] } });
	};

	const handleGenderClick = (gender: string) => {
		setFilters({ ...filters, genders: { ...filters.genders, [gender]: !filters.genders[gender] } });
	};

	const handleReleaseYearClick = (releaseYear: string) => {
		setFilters({
			...filters,
			releaseYears: { ...filters.releaseYears, [releaseYear]: !filters.releaseYears[releaseYear] },
		});
	};

	const handlePriceClick = (priceRange: string) => {
		setFilters({
			...filters,
			priceRanges: {
				...filters.priceRanges,
				[priceRange]: { ...filters.priceRanges[priceRange], checked: !filters.priceRanges[priceRange].checked },
			},
		});
	};

	const handleSizeClick = (size: string) => {
		setFilters({ ...filters, shoeSizes: { ...filters.shoeSizes, [size]: !filters.shoeSizes[size] } });
	};

	return (
		<aside className="top-0 p-5 w-full flex-2 flex-grow-1 overflow-y-auto bg-white xl:w-screen max-w-100 ">
			<div className="border-0 border-b border-solid border-gray-300 py-3">
				<div className="flex justify-between cursor-pointer" onClick={() => setShowColors(!showColors)}>
					<div className="font-bold mb-3">Color</div>{' '}
					{showColors ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
				</div>
				{showColors ? (
					<div className="flex justify-between flex-wrap gap-2 p-3">
						{Object.keys(filters.colors).map((color) => {
							return (
								<div
									key={`${color}`}
									className="flex flex-col items-center h-13 w-13"
									style={{ height: '52px', width: '52px' }}
								>
									<div
										className={`h-7 w-7 rounded-full ${color === 'black' || color === 'white' ? `${'bg-' + color}` : `${'bg-' + color + '-500'}`} ${color === 'white' ? 'border border-gray-300' : ''} ${color === 'white' ? 'text-black' : 'text-white'}`}
										onClick={() => handleColorClick(color)}
									>
										{filters.colors[color] ? <CheckIcon /> : null}
									</div>
									<div className="capitalize">{color}</div>
								</div>
							);
						})}
					</div>
				) : null}
			</div>

			<div className="border-0 border-b border-solid border-gray-300 py-3">
				<div
					className="flex justify-between items-center cursor-pointer"
					onClick={() => setShowBrands(!showBrands)}
				>
					<span className="font-bold mb-3">Brand</span>{' '}
					{showBrands ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
				</div>

				{showBrands ? (
					<div>
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
				<div
					className="flex justify-between items-center cursor-pointer"
					onClick={() => setShowGender(!showGender)}
				>
					<span className="font-bold mb-3">Gender</span>{' '}
					{showGender ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
				</div>

				{showGender ? (
					<div>
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
				<div
					className="flex justify-between items-center cursor-pointer"
					onClick={() => setShowPriceRanges(!showPriceRanges)}
				>
					<span className="font-bold mb-3">Shop by Price</span>{' '}
					{showPriceRanges ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
				</div>

				{showPriceRanges ? (
					<div>
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
				<div
					className="flex justify-between items-center cursor-pointer"
					onClick={() => setShowReleaseYear(!showReleaseYear)}
				>
					<span className="font-bold mb-3">Release Year</span>{' '}
					{showGender ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
				</div>

				{showReleaseYear ? (
					<div>
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
				<div
					className="flex justify-between items-center cursor-pointer"
					onClick={() => setShowSizes(!showSizes)}
				>
					<span className="font-bold mb-3">Size</span>{' '}
					{showSizes ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
				</div>

				{showSizes ? (
					<div className="flex flex-wrap">
						{shoeSizes.map((shoeSize) => {
							return (
								<div
									key={shoeSize}
									className={`min-h-10 px-2 py-2 inline-flex items-center justify-center ${filters.shoeSizes[shoeSize] ? ' border-2 border-black' : 'border border-gray-300'} m-1 rounded-lg cursor-pointer text-xs text-center flex-shrink-0`}
									onClick={() => handleSizeClick(shoeSize)}
								>
									{shoeSize}
								</div>
							);
						})}
					</div>
				) : null}
			</div>
		</aside>
	);
};

export default Sidebar;
