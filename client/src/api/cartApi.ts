import { updateCart } from '../redux/cartRedux'
import { baseAPI } from './api'

export const cartApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get user cart
    getUserCart: builder.query({
      query: (userId: string) => `/cart/find/${userId}`,
      providesTags: ['Cart'],
    }),

    // Update cart
    updateUserCart: builder.mutation({
      query: ({ cartId, products }: { cartId: string; products: any[] }) => ({
        url: `/cart/${cartId}`,
        method: 'PUT',
        body: { products },
      }),
      // Handle the response to update cart state
      onQueryStarted: async (arg, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled
          dispatch(updateCart(data))
        } catch (error) {
          console.error('Failed to update cart:', error)
        }
      },
      invalidatesTags: ['Cart'],
    }),
  }),
})

export const {
  useGetUserCartQuery,
  useUpdateUserCartMutation,
} = cartApi