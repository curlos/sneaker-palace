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
  }),
})

export const {
  useGetUserOrdersQuery,
} = ordersApi