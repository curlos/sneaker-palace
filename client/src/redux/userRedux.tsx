import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from '../types/types';

export interface UserState {
	currentUser: AuthUser | null;
	isFetching: boolean;
	error: boolean;
}

const INITIAL_STATE: UserState = {
	currentUser: null,
	isFetching: false,
	error: false,
};

const userSlice = createSlice({
	name: 'user',
	initialState: INITIAL_STATE,
	reducers: {
		loginStart: (state) => {
			state.isFetching = true;
		},
		loginSuccess: (state, action: PayloadAction<AuthUser>) => {
			state.isFetching = false;
			state.currentUser = action.payload;
		},
		loginFailure: (state) => {
			state.isFetching = false;
			state.error = true;
		},
		logout: () => {
			return INITIAL_STATE;
		},
	},
});

export const { loginStart, loginSuccess, loginFailure, logout } = userSlice.actions;
export default userSlice.reducer;
