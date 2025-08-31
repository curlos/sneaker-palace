import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Utility function to build query strings
export const buildQueryString = (params?: Record<string, any>) => {
	return params ? new URLSearchParams(params).toString() : '';
};

// Define the base API
export const baseAPI = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.REACT_APP_DEV_URL,
		prepareHeaders: (headers, { getState }) => {
			// Add auth headers for authenticated requests
			const token = (getState() as any).user?.currentUser?.accessToken;
			if (token) {
				headers.set('Authorization', `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ['Shoe', 'Rating', 'RatingsByShoe', 'RatingsByUser', 'User', 'Cart', 'Order', 'PaymentIntent'],
	endpoints: () => ({}),
});
