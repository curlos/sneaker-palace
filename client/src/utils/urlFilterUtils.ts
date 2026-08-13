import { ShoeFilters } from '../types/types';

export interface URLFilters {
	colors?: Record<string, boolean>;
	brands?: Record<string, boolean>;
	genders?: Record<string, boolean>;
	priceRanges?: Record<string, { checked: boolean }>;
	releaseYears?: Record<string, boolean>;
	shoeSizes?: Record<string, boolean>;
}

export const parseFiltersFromURL = (searchParams: URLSearchParams): URLFilters => {
	const urlFilters: URLFilters = {};

	// Parse colors
	const colors = searchParams.get('colors');
	if (colors) {
		const colorsFilter: Record<string, boolean> = {};
		colors.split(',').forEach((color) => {
			colorsFilter[color.trim()] = true;
		});
		urlFilters.colors = colorsFilter;
	}

	// Parse brands
	const brands = searchParams.get('brands');
	if (brands) {
		const brandsFilter: Record<string, boolean> = {};
		brands.split(',').forEach((brand) => {
			brandsFilter[brand.trim()] = true;
		});
		urlFilters.brands = brandsFilter;
	}

	// Parse genders
	const genders = searchParams.get('genders');
	if (genders) {
		const gendersFilter: Record<string, boolean> = {};
		genders.split(',').forEach((gender) => {
			gendersFilter[gender.trim()] = true;
		});
		urlFilters.genders = gendersFilter;
	}

	// Parse price ranges
	const priceRanges = searchParams.get('priceRanges');
	if (priceRanges) {
		const priceRangesFilter: Record<string, { checked: boolean }> = {};
		priceRanges.split(',').forEach((range) => {
			priceRangesFilter[range.trim()] = { checked: true };
		});
		urlFilters.priceRanges = priceRangesFilter;
	}

	// Parse release years
	const releaseYears = searchParams.get('releaseYears');
	if (releaseYears) {
		const releaseYearsFilter: Record<string, boolean> = {};
		releaseYears.split(',').forEach((year) => {
			releaseYearsFilter[parseInt(year.trim())] = true;
		});
		urlFilters.releaseYears = releaseYearsFilter;
	}

	// Parse shoe sizes
	const shoeSizes = searchParams.get('shoeSizes');
	if (shoeSizes) {
		const shoeSizesFilter: Record<string, boolean> = {};
		shoeSizes.split(',').forEach((size) => {
			shoeSizesFilter[size.trim()] = true;
		});
		urlFilters.shoeSizes = shoeSizesFilter;
	}

	return urlFilters;
};

export const buildURLFromFilters = (filters: Partial<ShoeFilters>) => {
	const params = new URLSearchParams();

	// Build colors param
	const activeColors = Object.keys(filters.colors || {}).filter((color) => filters.colors?.[color]);
	if (activeColors.length > 0) {
		params.set('colors', activeColors.join(','));
	}

	// Build brands param
	const activeBrands = Object.keys(filters.brands || {}).filter((brand) => filters.brands?.[brand]);
	if (activeBrands.length > 0) {
		params.set('brands', activeBrands.join(','));
	}

	// Build genders param
	const activeGenders = Object.keys(filters.genders || {}).filter((gender) => filters.genders?.[gender]);
	if (activeGenders.length > 0) {
		params.set('genders', activeGenders.join(','));
	}

	// Build price ranges param
	const activePriceRanges = Object.keys(filters.priceRanges || {}).filter(
		(range) => filters.priceRanges?.[range]?.checked
	);
	if (activePriceRanges.length > 0) {
		params.set('priceRanges', activePriceRanges.join(','));
	}

	// Build release years param
	const activeReleaseYears = Object.keys(filters.releaseYears || {}).filter((year) => filters.releaseYears?.[year]);
	if (activeReleaseYears.length > 0) {
		params.set('releaseYears', activeReleaseYears.join(','));
	}

	// Build shoe sizes param
	const activeShoeSizes = Object.keys(filters.shoeSizes || {}).filter((size) => filters.shoeSizes?.[size]);
	if (activeShoeSizes.length > 0) {
		params.set('shoeSizes', activeShoeSizes.join(','));
	}

	return params.toString();
};
