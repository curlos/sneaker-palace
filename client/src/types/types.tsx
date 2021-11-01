
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
    stockX: {type: String},
    goat: {type: String},
    flightClub: {type: String},
    stadiumGoods: {type: String},
  },
  reviews: Array<string>,
  rating: number,
  favorites: number,

}

export interface Props {
  shoe: Shoe
}