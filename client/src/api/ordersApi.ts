import { baseAPI } from './api'

export const ordersApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get orders for a specific user
    getUserOrders: builder.query({
      query: (userId: string) => `/orders/user/${userId}`,
      providesTags: (result, _, userId) => 
        result 
          ? [...result.map((order: any) => ({ type: 'Order', id: order._id })), { type: 'Order', id: `USER_${userId}` }]
          : [{ type: 'Order', id: `USER_${userId}` }],
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
        { type: 'Order', id: `USER_${orderData.userID}` }
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
})

export const {
  useGetUserOrdersQuery,
  useGetOrderByIdQuery,
  useCreateUserOrderMutation,
  useCreateGuestOrderMutation,
} = ordersApi