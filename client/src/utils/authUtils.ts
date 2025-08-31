import axios from 'axios';
import { Dispatch } from '@reduxjs/toolkit';
import { loginStart, loginSuccess } from '../redux/userRedux';
import { UserType } from '../types/types';

export const performLogin = async (
	email: string,
	password: string,
	dispatch: Dispatch,
	updateGuestCart: (cartData: { products: any[]; total: number }) => Promise<any>
): Promise<UserType> => {
	dispatch(loginStart());

	const body = { email, password };
	const response = await axios.post(`${process.env.REACT_APP_DEV_URL}/auth/login`, body);

	if (!response.data) {
		throw new Error('Login failed');
	}

	dispatch(loginSuccess(response.data));

	// Clear guest cart on login using RTK Query
	await updateGuestCart({ products: [], total: 0 });

	return response.data;
};
