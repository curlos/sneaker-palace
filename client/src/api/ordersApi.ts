import { baseAPI } from './api';

export const ordersApi = baseAPI.injectEndpoints({
	endpoints: (builder) => ({
		// Get orders for logged-in user
		getUserOrders: builder.query({
			query: () => `/orders/user`,
			providesTags: (result) =>
				result
					? [
							...result.map((order: any) => ({ type: 'Order', id: order._id })),
							{ type: 'Order', id: 'USER_ORDERS' },
						]
					: [{ type: 'Order', id: 'USER_ORDERS' }],
		}),

		// Get a single order by ID
		getOrderById: builder.query({
			query: (orderId: string) => `/orders/${orderId}`,
			providesTags: (_, __, orderId) => [{ type: 'Order', id: orderId }],
		}),

		// Create order for logged-in user
		createUserOrder: builder.mutation({
			query: (orderData) => ({
				url: '/orders',
				method: 'POST',
				body: orderData,
			}),
			invalidatesTags: (result, error, orderData) => [
				{ type: 'User', id: orderData.userID },
				{ type: 'Order', id: 'USER_ORDERS' },
			],
		}),

		// Create order for guest user (no account)
		createGuestOrder: builder.mutation({
			query: (orderData) => ({
				url: '/orders/no-account',
				method: 'POST',
				body: orderData,
			}),
		}),
	}),
});

export const { useGetUserOrdersQuery, useGetOrderByIdQuery, useCreateUserOrderMutation, useCreateGuestOrderMutation } =
	ordersApi;
