import { createSlice } from '@reduxjs/toolkit';

const INITIAL_STATE = {
  currentUser: {},
  isFetching: false,
  error: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState: INITIAL_STATE,
  reducers: {
    loginStart: (state) => {
      state.isFetching = true;
    },
    loginSuccess: (state, action) => {
      state.isFetching = false
      state.currentUser = action.payload
    },
    loginFailure: (state) => {
      state.isFetching = false
      state.error = true
    },
    logout: (state) => {
      return INITIAL_STATE
    },
    updateUser: (state, action) => {
      state.currentUser = action.payload
    }
  }
})

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = userSlice.actions
export default userSlice.reducer;