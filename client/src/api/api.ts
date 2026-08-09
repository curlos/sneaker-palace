import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { RootState } from '../redux/store';

// Utility function to build query strings
export const buildQueryString = (params?: Record<string, string>) => {
	return params ? new URLSearchParams(params).toString() : '';
};

// Define the base API
export const baseAPI = createApi({
	reducerPath: 'api',
	// maxRetries: 0 keeps today's "no retry" behavior as the default for every endpoint;
	// individual endpoints (e.g. order creation) opt into retries via extraOptions.
	baseQuery: retry(
		fetchBaseQuery({
			baseUrl: import.meta.env.VITE_API_URL,
			prepareHeaders: (headers, { getState }) => {
				// Add auth headers for authenticated requests
				const token = (getState() as RootState).user?.currentUser?.accessToken;
				if (token) {
					headers.set('Authorization', `Bearer ${token}`);
				}
				return headers;
			},
		}),
		{ maxRetries: 0 }
	),
	tagTypes: ['Shoe', 'Rating', 'RatingsByShoe', 'RatingsByUser', 'User', 'Cart', 'Order', 'PaymentIntent'],
	endpoints: () => ({}),
});
