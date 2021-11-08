
export interface Shoe {
  _id: string | undefined,
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
  favorites: Array<string>,
  createdAt: string,
  updatedAt: string
}

export interface Props {
  shoe: Shoe,
}

export interface UserType {
  _id: string,
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  isAdmin: boolean,
  profilePic: string,
  reviews: Array<string>,
  favorites: Array<string>,
  reviewUpvotes: Array<string>,
  reviewDownvotes: Array<string>,
  shoppingCartItems: Array<string>,
  itemsBought: Array<string>,
  lowerCaseEmail: string,
  createdAt: string,
  updatedAt: string
}

export interface IProduct {
  _id: string,
  productID: string,
  size: number,
  quantity: number,
}

export interface ICart {
  _id: string,
  userID: string,
  products: Array<IProduct>,
  createdAt: string,
  updatedAt: string
}

export interface CartState {
  currentCart: ICart
}