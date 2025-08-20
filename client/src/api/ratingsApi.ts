import { baseAPI } from './api'
import { IRating } from '../types/types'

export const ratingsApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get a single rating by ID
    getRating: builder.query({
      query: (ratingId: string) => `/rating/${ratingId}`,
      providesTags: (result, error, ratingId) => [{ type: 'Rating', id: ratingId }],
    }),

    // TODO: There should be a separate usersApi.ts file handling this.
    // Get user data
    getUser: builder.query({
      query: (userId: string) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // Get multiple ratings with their authors (custom endpoint for the complex fetch)
    getRatingsWithAuthors: builder.query({
      queryFn: async (ratingIDs: string[], _api, _extraOptions, fetchWithBQ) => {
        try {
          const ratings = []
          
          if (ratingIDs && ratingIDs.length > 0) {
            for (const ratingID of ratingIDs) {
              // Fetch the rating
              const ratingResponse = await fetchWithBQ(`/rating/${ratingID}`)
              
              if (ratingResponse.error) {
                console.error('Error fetching rating:', ratingResponse.error)
                continue
              }
              
              if (ratingResponse.data !== null && ratingResponse.data) {
                const ratingData = ratingResponse.data as IRating
                // Fetch the author
                const authorResponse = await fetchWithBQ(`/users/${ratingData.userID}`)
                
                if (authorResponse.error) {
                  console.error('Error fetching author:', authorResponse.error)
                  continue
                }
                
                ratings.push({
                  ...ratingData,
                  postedByUser: authorResponse.data
                })
              }
            }
          }
          
          return { data: ratings }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } }
        }
      },
      providesTags: (result, error, ratingIDs) => [
        ...ratingIDs.map(id => ({ type: 'Rating' as const, id })),
        'Rating'
      ],
    }),
  }),
})

export const {
  useGetRatingQuery,
  useGetUserQuery, 
  useGetRatingsWithAuthorsQuery,
} = ratingsApi