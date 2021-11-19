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
      ["Adidas".toUpperCase()]: false as boolean,
      ["Air Jordan".toUpperCase()]: false as boolean,
      ["Alexander McQueen".toUpperCase()]: false as boolean,
      ["Asics".toUpperCase()]: false as boolean,
      ["Balenciaga".toUpperCase()]: false as boolean,
      ["Burberry".toUpperCase()]: false as boolean,
      ["Chanel".toUpperCase()]: false as boolean,
      ["Common Projects".toUpperCase()]: false as boolean,
      ["Converse".toUpperCase()]: false as boolean,
      ["Crocs".toUpperCase()]: false as boolean,
      ["Diadora".toUpperCase()]: false as boolean,
      ["Dior".toUpperCase()]: false as boolean,
      ["Gucci".toUpperCase()]: false as boolean,
      ["Jordan".toUpperCase()]: false as boolean,
      ["Li-Ning".toUpperCase()]: false as boolean,
      ["New Balance".toUpperCase()]: false as boolean,
      ["Nike".toUpperCase()]: false as boolean,
      ["Louis Vuitton".toUpperCase()]: false as boolean,
      ["Off-White".toUpperCase()]: false as boolean,
      ["Prada".toUpperCase()]: false as boolean,
      ["Puma".toUpperCase()]: false as boolean,
      ["Reebok".toUpperCase()]: false as boolean,
      ["Saint Laurent".toUpperCase()]: false as boolean,
      ["Saucony".toUpperCase()]: false as boolean,
      ["Vans".toUpperCase()]: false as boolean,
      ["Yeezy".toUpperCase()]: false as boolean,
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
    filters['brands'][state.brand.toUpperCase()] = true
  }

  console.log(state)
  console.log(filters)

  return filters
}

export default getInitialFilters