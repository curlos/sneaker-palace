import { SHOE_SIZES } from './shoeConstants';

interface stateType {
	brands?: string[];
	gender?: string;
}

const BRANDS_LOWERCASE: any = {
	adidas: 'adidas',
	'air jordan': 'Air Jordan',
	'alexander mcqueen': 'Alexander McQueen',
	asics: 'ASICS',
	balenciaga: 'Balenciaga',
	burberry: 'Burberry',
	chanel: 'Chanel',
	'common projects': 'Common Projects',
	converse: 'Converse',
	crocs: 'Crocs',
	diadora: 'Diadora',
	dior: 'Dior',
	gucci: 'Gucci',
	'hoka one one': 'Hoka One One',
	jordan: 'Jordan',
	'li-ning': 'Li-Ning',
	'louis vuitton': 'Louis Vuitton',
	'off-white': 'Off-White',
	on: 'On',
	'new balance': 'New Balance',
	nike: 'Nike',
	prada: 'Prada',
	puma: 'Puma',
	reebok: 'Reebok',
	'saint laurent': 'Saint Laurent',
	saucony: 'Saucony',
	vans: 'Vans',
	yeezy: 'Yeezy',
};

const getInitialFilters = (state: stateType) => {
	let filters: any = {
		colors: {
			red: false as boolean,
			white: false as boolean,
			yellow: false as boolean,
			black: false as boolean,
			blue: false as boolean,
			brown: false as boolean,
			green: false as boolean,
			gray: false as boolean,
			pink: false as boolean,
			purple: false as boolean,
		},
		brands: {
			adidas: false as boolean,
			'Air Jordan': false as boolean,
			'Alexander McQueen': false as boolean,
			ASICS: false as boolean,
			Balenciaga: false as boolean,
			Burberry: false as boolean,
			Chanel: false as boolean,
			'Common Projects': false as boolean,
			Converse: false as boolean,
			Crocs: false as boolean,
			Diadora: false as boolean,
			Dior: false as boolean,
			Gucci: false as boolean,
			'Hoka One One': false as boolean,
			Jordan: false as boolean,
			'Li-Ning': false as boolean,
			'New Balance': false as boolean,
			Nike: false as boolean,
			'Louis Vuitton': false as boolean,
			On: false as boolean,
			'Off-White': false as boolean,
			Prada: false as boolean,
			Puma: false as boolean,
			Reebok: false as boolean,
			'Saint Laurent': false as boolean,
			Saucony: false as boolean,
			Vans: false as boolean,
			Yeezy: false as boolean,
		},
		genders: {
			men: false,
			women: false,
			infant: false,
			youth: false,
		},
		priceRanges: {
			'$0 - $25': {
				priceRanges: {
					low: 0,
					high: 25,
				},
				checked: false,
			},
			'$25 - $50': {
				priceRanges: {
					low: 25,
					high: 50,
				},
				checked: false,
			},
			'$50 - $100': {
				priceRanges: {
					low: 50,
					high: 100,
				},
				checked: false,
			},
			'$100 - $150': {
				priceRanges: {
					low: 100,
					high: 150,
				},
				checked: false,
			},
			'$150+': {
				priceRanges: {
					low: 150,
					high: null,
				},
				checked: false,
			},
		},
		releaseYears: {
			2025: false,
			2024: false,
			2023: false,
			2022: false,
			2021: false,
			2020: false,
			2019: false,
			2018: false,
			2017: false,
			2016: false,
			2015: false,
			2014: false,
			2013: false,
			2012: false,
			2011: false,
			2010: false,
			2009: false,
			2008: false,
			2007: false,
			2006: false,
			2005: false,
			2004: false,
			2003: false,
			2002: false,
			2001: false,
			2000: false,
			1996: false,
			1987: false,
			1985: false,
		},
		shoeSizes: {
			...SHOE_SIZES.reduce((a, v) => ({ ...a, [v]: false }), {}),
		},
	};

	if (state && state.gender) {
		filters['genders'][state.gender] = true;
	}

	if (state && state.brands) {
		state.brands.forEach(brand => {
			const brandName = BRANDS_LOWERCASE[brand.toLowerCase()];
			if (brandName) {
				filters['brands'][brandName] = true;
			}
		});
	}

	return filters;
};

export default getInitialFilters;
