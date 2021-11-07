
export interface Shoe {
  shoeID: string,
  sku: string,
  brand: string,
  name: string,
  colorway: string,
  gender: string,
  silhouette: string,
  releaseYear: number,
  releaseDate: string,
  retailPrice: number,
  estimatedMarketValue: number,
  story: string,
  image: {
    "360": Array<string>
    original: string,
    small: string,
    thumbnail: string,
  },
  links: {
    stockX: string,
    goat: string,
    flightClub: string,
    stadiumGoods: string,
  },
  reviews: Array<string>,
  rating: number,
  favorites: number,

}

export interface Props {
  shoe: Shoe,
}