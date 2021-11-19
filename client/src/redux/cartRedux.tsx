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
      if (action.payload) {
        state.total = calcTotal(action.payload.products)
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