import { baseAPI } from './api';
import { CreatePaymentIntentResponse, IProduct } from '../types/types';

export const checkoutApi = baseAPI.injectEndpoints({
	endpoints: (builder) => ({
		// Create payment intent for Stripe checkout
		createPaymentIntent: builder.query<CreatePaymentIntentResponse, { items: IProduct[]; total: number }>({
			query: ({ items, total }) => ({
				url: '/checkout/create-payment-intent',
				method: 'POST',
				body: { items, total },
			}),
			// Cache based on cart contents and total to prevent duplicate calls
			providesTags: (result, error, { items, total }) => [
				{ type: 'PaymentIntent', id: `${JSON.stringify(items || [])}_${total}` },
			],
			// Transform response to extract clientSecret
			transformResponse: (response: CreatePaymentIntentResponse) => {
				if (response.error) {
					throw new Error(response.error);
				}
				return response;
			},
		}),
	}),
});

export const { useCreatePaymentIntentQuery } = checkoutApi;
