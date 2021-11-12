
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
  ratings: Array<string>,
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
  helpful: Array<string>,
  notHelpful: Array<string>,
  shoppingCartItems: Array<string>,
  itemsBought: Array<string>,
  lowerCaseEmail: string,
  createdAt: string,
  updatedAt: string,
  shoeSize: number,
  preferredGender: string,
  unitOfMeasure: string
}

export interface IProduct {
  _id: string,
  productID: string,
  size: number,
  quantity: number,
  retailPrice: number
}

export interface ICart {
  _id: string,
  userID: string,
  products: Array<IProduct>,
  total: number,
  createdAt: string,
  updatedAt: string
}

export interface CartState {
  currentCart: ICart
}

export interface IRating {
  _id: string,
  userID: string,
  shoeID: string,
  ratingNum: number,
  summary: string,
  text: string,
  photo: string,
  size: string,
  comfort: string,
  width: string,
  quality: string,
  recommended: boolean,
  helpful: Array<string>,
  notHelpful: Array<string>,
  createdAt: string,
  updatedAt: string,
  postedByUser: UserType
}