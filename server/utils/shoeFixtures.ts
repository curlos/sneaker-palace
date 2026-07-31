import { IShoe } from '../types/types';

// Accepts either a full shoeID string (e.g. 'shoe-new') or a plain index
// (e.g. 0), which gets formatted as `shoe-${index}` - so existing call sites
// that pass a loop index don't need to change.
export function buildShoe(shoeIDOrIndex: string | number): IShoe {
	const shoeID = typeof shoeIDOrIndex === 'number' ? `shoe-${shoeIDOrIndex}` : shoeIDOrIndex;

	return {
		shoeID,
		sku: `sku-${shoeID}`,
		brand: 'Nike',
		name: `Shoe ${shoeID}`,
		colorway: 'Black/White',
		gender: 'men',
		silhouette: 'Air Max 90',
		releaseYear: 2020,
		releaseDate: '2020-01-01',
		retailPrice: 100,
		estimatedMarketValue: 150,
		story: 'A great shoe.',
		image: {
			'360': [],
			original: `https://example.com/${shoeIDOrIndex}/original.jpg`,
			small: `https://example.com/${shoeIDOrIndex}/small.jpg`,
			thumbnail: `https://example.com/${shoeIDOrIndex}/thumb.jpg`,
		},
		links: {},
		ratings: [],
		rating: 0,
		favorites: [],
		inStock: true,
	} as IShoe;
}
