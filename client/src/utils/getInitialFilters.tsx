import { titleCase } from "./filterShoes"

interface stateType {
  brand?: string,
  gender?: string
}

const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17']

const getInitialFilters = (state: stateType) => {

  let filters: any = {
    colors: {
      'red': false as boolean,
      'white': false as boolean,
      'yellow': false as boolean,
      'black': false as boolean,
      'blue': false as boolean,
      'brown': false as boolean,
      'green': false as boolean,
      'gray': false as boolean,
      'pink': false as boolean,
      'purple': false as boolean,
    },
    brands: {
      "Adidas": false as boolean,
      "Air Jordan": false as boolean,
      "Alexander McQueen": false as boolean,
      "Asics": false as boolean,
      "Balenciaga": false as boolean,
      "Burberry": false as boolean,
      "Chanel": false as boolean,
      "Common Projects": false as boolean,
      "Converse": false as boolean,
      "Crocs": false as boolean,
      "Diadora": false as boolean,
      "Dior": false as boolean,
      "Gucci": false as boolean,
      "Jordan": false as boolean,
      "Li Ning": false as boolean,
      "New Balance": false as boolean,
      "Nike": false as boolean,
      "Louis Vuitton": false as boolean,
      "Off-White": false as boolean,
      "Prada": false as boolean,
      "Puma": false as boolean,
      "Reebok": false as boolean,
      "Saint Laurent": false as boolean,
      "Saucony": false as boolean,
      "Vans": false as boolean,
      "Yeezy": false as boolean,
    },
    genders: {
      "Men": false,
      "Women": false,
      "Infant": false,
      "Youth": false
    },
    priceRanges: {
      "$0 - $25": {
        priceRanges: {
          low: 0,
          high: 25
        },
        checked: false
      },
      "$25 - $50": {
        priceRanges: {
          low: 25,
          high: 50
        },
        checked: false
      },
      "$50 - $100": {
        priceRanges: {
          low: 50,
          high: 100
        },
        checked: false
      },
      "$100 - $150": {
        priceRanges: {
          low: 100,
          high: 150
        },
        checked: false
      },
      "$150+": {
        priceRanges: {
          low: 150,
          high: null
        },
        checked: false

      }

    },
    shoeSizes: {
      ...SHOE_SIZES.reduce((a, v) => ({ ...a, [v]: false }), {})
    }
  }

  if (state && state.gender) {
    filters['genders'][titleCase(state.gender)] = true
  }

  if (state && state.brand) {
    filters['brands'][titleCase(state.brand)] = true
  }

  console.log(state)
  console.log(filters)

  return filters
}

export default getInitialFilters