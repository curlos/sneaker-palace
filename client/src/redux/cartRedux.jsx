import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    currentCart: {}
  },
  reducers: {
    updateCart: (state, action) => {
      state.currentCart = action.payload
    }
  }
})

export const { updateCart } = cartSlice.actions
export default cartSlice.reducer