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
      let newCart = action.payload

      if (typeof action.payload === 'string') {
        newCart = JSON.parse(newCart)
      }

      state.currentCart = newCart
      if (newCart) {
        state.total = calcTotal(newCart.products)
      }
    },
    resetCart: (state) => {
      return INITIAL_STATE
    }
  }
})

const calcTotal = (products: Array<IProduct>) => {
  let total = 0

  for (let product of products) {

    total += (product.retailPrice * product.quantity)
  }



  return total
}

export const { updateCart, resetCart } = cartSlice.actions
export default cartSlice.reducer