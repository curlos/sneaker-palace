export const parseFiltersFromURL = (searchParams: URLSearchParams) => {
  const urlFilters: any = {};

  // Parse colors
  const colors = searchParams.get('colors');
  if (colors) {
    urlFilters.colors = {};
    colors.split(',').forEach(color => {
      urlFilters.colors[color.trim()] = true;
    });
  }

  // Parse brands
  const brands = searchParams.get('brands');
  if (brands) {
    urlFilters.brands = {};
    brands.split(',').forEach(brand => {
      urlFilters.brands[brand.trim()] = true;
    });
  }

  // Parse genders
  const genders = searchParams.get('genders');
  if (genders) {
    urlFilters.genders = {};
    genders.split(',').forEach(gender => {
      urlFilters.genders[gender.trim()] = true;
    });
  }

  // Parse price ranges
  const priceRanges = searchParams.get('priceRanges');
  if (priceRanges) {
    urlFilters.priceRanges = {};
    priceRanges.split(',').forEach(range => {
      urlFilters.priceRanges[range.trim()] = { checked: true };
    });
  }

  // Parse release years
  const releaseYears = searchParams.get('releaseYears');
  if (releaseYears) {
    urlFilters.releaseYears = {};
    releaseYears.split(',').forEach(year => {
      urlFilters.releaseYears[parseInt(year.trim())] = true;
    });
  }

  // Parse shoe sizes
  const shoeSizes = searchParams.get('shoeSizes');
  if (shoeSizes) {
    urlFilters.shoeSizes = {};
    shoeSizes.split(',').forEach(size => {
      urlFilters.shoeSizes[size.trim()] = true;
    });
  }

  return urlFilters;
};

export const buildURLFromFilters = (filters: any) => {
  const params = new URLSearchParams();

  // Build colors param
  const activeColors = Object.keys(filters.colors || {}).filter(color => filters.colors[color]);
  if (activeColors.length > 0) {
    params.set('colors', activeColors.join(','));
  }

  // Build brands param
  const activeBrands = Object.keys(filters.brands || {}).filter(brand => filters.brands[brand]);
  if (activeBrands.length > 0) {
    params.set('brands', activeBrands.join(','));
  }

  // Build genders param
  const activeGenders = Object.keys(filters.genders || {}).filter(gender => filters.genders[gender]);
  if (activeGenders.length > 0) {
    params.set('genders', activeGenders.join(','));
  }

  // Build price ranges param
  const activePriceRanges = Object.keys(filters.priceRanges || {}).filter(range => filters.priceRanges[range]?.checked);
  if (activePriceRanges.length > 0) {
    params.set('priceRanges', activePriceRanges.join(','));
  }

  // Build release years param
  const activeReleaseYears = Object.keys(filters.releaseYears || {}).filter(year => filters.releaseYears[year]);
  if (activeReleaseYears.length > 0) {
    params.set('releaseYears', activeReleaseYears.join(','));
  }

  // Build shoe sizes param
  const activeShoeSizes = Object.keys(filters.shoeSizes || {}).filter(size => filters.shoeSizes[size]);
  if (activeShoeSizes.length > 0) {
    params.set('shoeSizes', activeShoeSizes.join(','));
  }

  return params.toString();
};