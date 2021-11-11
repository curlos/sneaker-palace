import { createSlice } from '@reduxjs/toolkit'
import { ICart, IProduct } from '../types/types'

interface CartState {
  currentCart: Partial<ICart>,
  total: number
}

const INITIAL_STATE: CartState = {
  currentCart: {},
  total: 0
}

const cartSlice = createSlice({
  name: "cart",
  initialState: INITIAL_STATE,
  reducers: {
    updateCart: (state, action) => {
      state.currentCart = action.payload

      if (action.payload.currentCart) {
        state.total = calcTotal(action.payload.currentCart.products)
      }
    }
  }
})

const calcTotal = (products: Array<IProduct>) => {

  console.log(products)

  let total = 0

  for (let product of products) {
    console.log(product)
    total += (product.retailPrice * product.quantity)
  }

  console.log(total)

  return total
}

export const { updateCart } = cartSlice.actions
export default cartSlice.reducer