import { baseAPI } from './api'
import { IProduct, ICart } from '../types/types'
import { useSelector } from 'react-redux'

// Utility function to calculate cart total
export const calculateCartTotal = (products: IProduct[] = []): number => {
  return products.reduce((total, product) => {
    return total + (product.retailPrice * product.quantity)
  }, 0)
}

// Guest cart management utilities
const GUEST_CART_KEY = 'currentCart'

const getGuestCart = (): Partial<ICart> => {
  try {
    const cartString = localStorage.getItem(GUEST_CART_KEY)
    if (cartString) {
      const cart = JSON.parse(cartString)
      return {
        ...cart,
        total: calculateCartTotal(cart.products || [])
      }
    }
  } catch (error) {
    console.error('Error parsing guest cart from localStorage:', error)
  }
  return { products: [], total: 0 }
}

const saveGuestCart = (cart: Partial<ICart>): void => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving guest cart to localStorage:', error)
  }
}

export const cartApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Guest cart query - for localStorage cart management
    getGuestCart: builder.query({
      queryFn: async () => {
        const guestCart = getGuestCart()
        return { data: guestCart }
      },
      providesTags: ['Cart'],
    }),

    getUserCart: builder.query({
      query: (userId: string) => `/cart/find/${userId}`,
      providesTags: ['Cart'],
      transformResponse: (response: any) => {
        if (response && response.products) {
          return {
            ...response,
            total: calculateCartTotal(response.products)
          }
        }
        return response
      },
    }),

    // Update entire cart (the only backend endpoint that actually exists)
    updateUserCart: builder.mutation({
      query: ({ cartId, products }: { cartId: string; products: any[] }) => ({
        url: `/cart/${cartId}`,
        method: 'PUT',
        body: { products },
      }),
      invalidatesTags: ['Cart'],
      transformResponse: (response: any) => {
        // Add computed total to the response
        if (response && response.products) {
          return {
            ...response,
            total: calculateCartTotal(response.products)
          }
        }
        return response
      },
    }),

    // Update guest cart manually (for localStorage management)
    updateGuestCart: builder.mutation({
      queryFn: async (cartData: Partial<ICart>) => {
        saveGuestCart({
          ...cartData,
          total: calculateCartTotal(cartData.products || [])
        })
        return { data: cartData }
      },
      invalidatesTags: ['Cart'],
    }),
  }),
})

export const {
  // Cart query hooks
  useGetGuestCartQuery,
  useGetUserCartQuery,
  
  // Cart mutation hooks
  useUpdateUserCartMutation,
  useUpdateGuestCartMutation,
} = cartApi

// Cart invalidation utilities for login/logout
export const invalidateAllCarts = (dispatch: any) => {
  // Invalidate all cart-related queries
  dispatch(cartApi.util.invalidateTags(['Cart']))
}

// Custom hook for unified cart management
export const useCart = () => {
  const user = useSelector((state: any) => state.user?.currentUser)
  const userId = user?._id
  
  // Use appropriate query based on authentication status
  const userCartQuery = useGetUserCartQuery(userId, { skip: !userId })
  const guestCartQuery = useGetGuestCartQuery(undefined, { skip: !!userId })
  
  // Return the appropriate data
  if (userId) {
    return {
      data: userCartQuery.data,
      isLoading: userCartQuery.isLoading,
      error: userCartQuery.error,
      refetch: userCartQuery.refetch
    }
  } else {
    return {
      data: guestCartQuery.data,
      isLoading: guestCartQuery.isLoading,
      error: guestCartQuery.error,
      refetch: guestCartQuery.refetch
    }
  }
}