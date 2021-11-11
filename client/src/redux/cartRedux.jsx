import { createSlice } from '@reduxjs/toolkit'

const calcTotal = (products) => {

  console.log(products)

  let total = 0

  for (let product of products) {
    console.log(product)
    total += (product.retailPrice * product.quantity)
  }

  console.log(total)

  return total
}

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    currentCart: {},
    total: 0
  },
  reducers: {
    updateCart: (state, action) => {
      state.currentCart = action.payload

      if (action.payload.currentCart) {
        state.total = calcTotal(action.payload.currentCart.products)
      }
    }
  }
})

export const { updateCart } = cartSlice.actions
export default cartSlice.reducer