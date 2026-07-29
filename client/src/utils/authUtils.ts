import axios from 'axios';
import { Dispatch } from '@reduxjs/toolkit';
import { loginStart, loginSuccess } from '../redux/userRedux';
import { AuthUser, IProduct } from '../types/types';

export const performLogin = async (
	email: string,
	password: string,
	dispatch: Dispatch,
	updateGuestCart: (cartData: { products: IProduct[]; total: number }) => Promise<unknown>
): Promise<AuthUser> => {
	dispatch(loginStart());

	const body = { email, password };
	const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, body);

	if (!response.data) {
		throw new Error('Login failed');
	}

	dispatch(loginSuccess(response.data));

	// Clear guest cart on login using RTK Query
	await updateGuestCart({ products: [], total: 0 });

	return response.data;
};
