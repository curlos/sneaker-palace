import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Utility function to build query strings
export const buildQueryString = (params?: Record<string, any>) => {
  return params ? new URLSearchParams(params).toString() : ''
}

// Define the base API
export const baseAPI = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_DEV_URL,
    prepareHeaders: (headers) => {
      // Add any auth headers here if needed
      // const token = (getState() as RootState).user?.currentUser?.token
      // if (token) {
      //   headers.set('authorization', `Bearer ${token}`)
      // }
      return headers
    },
  }),
  tagTypes: [
    'Shoe',
    'Rating', 
    'RatingsByShoe',
    'RatingsByUser',
    'User',
    'Cart',
    'Order',
    'PaymentIntent'
  ],
  endpoints: () => ({}),
})