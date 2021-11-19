import { Shoe } from "../types/types"

export { }

export const filterByColor = (filters: any, shoesToFilter: Array<Shoe>) => {
  if (Object.values(filters.colors).every((v) => v === false)) {
    return shoesToFilter
  }

  return shoesToFilter.filter((shoe) => {
    let colorIncluded = false
    for (let color of Object.keys(filters.colors)) {
      if (filters.colors[color] && shoe.colorway.toLowerCase().includes(color)) {
        colorIncluded = true
        break
      }
    }

    return colorIncluded
  })
}

export const filterByBrand = (filters: any, shoesToFilter: Array<Shoe>) => {
  if (Object.values(filters.brands).every((v) => v === false)) {
    return shoesToFilter
  }

  return shoesToFilter.filter((shoe: Shoe) => filters.brands[shoe.brand.toUpperCase()])
}

export const filterByGender = (filters: any, shoesToFilter: Array<Shoe>) => {
  if (Object.values(filters.genders).every((v) => v === false)) {
    return shoesToFilter
  }

  return shoesToFilter.filter((shoe) => {
    return filters.genders[titleCase(shoe.gender)]
  })
}

export const filterByPrice = (filters: any, shoesToFilter: Array<Shoe>) => {
  if (Object.values(filters.priceRanges).every((v: any) => v['checked'] === false)) {
    return shoesToFilter
  }

  return shoesToFilter.filter((shoe) => {

    let shoeIncluded = false

    for (let priceRange of Object.keys(filters.priceRanges)) {
      if (filters.priceRanges[priceRange].checked) {
        const low = filters.priceRanges[priceRange].priceRanges.low
        const high = filters.priceRanges[priceRange].priceRanges.high

        if (high === null && shoe.retailPrice >= low) {
          shoeIncluded = true
          break
        }

        if (shoe.retailPrice >= low && shoe.retailPrice <= high) {
          shoeIncluded = true
          break
        }
      }
    }

    return shoeIncluded
  })
}

export const titleCase = (str: string) => {
  let strLowerCase = str.toLowerCase();
  let wordArr = strLowerCase.split(" ").map(function (currentValue) {
    return currentValue[0].toUpperCase() + currentValue.substring(1);
  });

  return wordArr.join(" ");
}