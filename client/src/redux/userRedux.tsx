import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  currentUser: any
  isFetching: boolean
  error: boolean
}

const INITIAL_STATE: UserState = {
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
    updatePasswordRequirement: (state, action) => {
      if (state.currentUser) {
        state.currentUser.requiresPasswordUpdate = action.payload
      }
    }
  }
})

export const { loginStart, loginSuccess, loginFailure, logout, updatePasswordRequirement } = userSlice.actions
export default userSlice.reducer;