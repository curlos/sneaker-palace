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
          const ratings: any[] = []
          
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

    // Get ratings for a specific shoe (new decoupled approach)
    getRatingsByShoe: builder.query({
      query: (shoeID: string) => `/rating/shoe/${shoeID}`,
      providesTags: (result, error, shoeID) => [
        { type: 'RatingsByShoe' as const, id: shoeID },
        ...(result || []).map((rating: any) => ({ type: 'Rating' as const, id: rating._id })),
      ],
    }),

    // Like a rating
    likeRating: builder.mutation({
      query: ({ ratingID, userID }: { ratingID: string, userID: string }) => ({
        url: '/rating/like',
        method: 'PUT',
        body: { ratingID, userID },
      }),
      invalidatesTags: (result, _error, { ratingID }) => [
        { type: 'Rating', id: ratingID },
        { type: 'User', id: result?.updatedUser?._id }
      ],
    }),

    // Dislike a rating
    dislikeRating: builder.mutation({
      query: ({ ratingID, userID }: { ratingID: string, userID: string }) => ({
        url: '/rating/dislike',
        method: 'PUT',
        body: { ratingID, userID },
      }),
      invalidatesTags: (result, _error, { ratingID }) => [
        { type: 'Rating', id: ratingID },
        { type: 'User', id: result?.updatedUser?._id }
      ],
    }),

    // Delete a rating
    deleteRating: builder.mutation({
      query: (ratingId: string) => ({
        url: `/rating/${ratingId}`,
        method: 'DELETE',
      }),
      // Optimistic deletion - remove rating immediately
      onQueryStarted: async (ratingId, { dispatch, queryFulfilled, getState }) => {
        const patchResults: any[] = []
        
        // Find all getRatingsByShoe queries and optimistically remove the rating
        const state = getState() as any
        const api = state.api
        
        // Look through all cached queries to find ones that contain this rating
        Object.entries(api.queries).forEach(([queryKey, query]: [string, any]) => {
          if (queryKey.startsWith('getRatingsByShoe') && query?.data) {
            const shoeID = queryKey.split('(')[1]?.split(')')[0]?.replace(/"/g, '')
            if (shoeID && query.data.some((rating: any) => rating._id === ratingId)) {
              const patchResult = dispatch(
                ratingsApi.util.updateQueryData('getRatingsByShoe', shoeID, (draft) => {
                  const index = draft.findIndex((rating: any) => rating._id === ratingId)
                  if (index !== -1) {
                    draft.splice(index, 1)
                  }
                })
              )
              patchResults.push(patchResult)
            }
          }
        })

        try {
          await queryFulfilled
        } catch (error) {
          // Rollback optimistic updates on failure
          patchResults.forEach(patchResult => patchResult.undo())
          console.error('Failed to delete rating:', error)
        }
      },
      invalidatesTags: (result, _error, ratingId) => [
        { type: 'Rating', id: ratingId },
        { type: 'RatingsByShoe', id: result?.deletedRating?.shoeID },
        { type: 'Shoe', id: result?.updatedShoe?.shoeID },
        { type: 'User', id: result?.deletedRating?.userID },
      ],
    }),

    // Create a new rating
    createRating: builder.mutation({
      query: (ratingData: any) => ({
        url: '/rating/rate',
        method: 'POST',
        body: ratingData,
      }),
      invalidatesTags: (result, _error, ratingData) => [
        { type: 'RatingsByShoe', id: ratingData.shoeID },
        { type: 'Shoe', id: result?.updatedShoe?.shoeID },
        { type: 'User', id: result?.updatedUser?._id }
      ],
    }),

    // Update an existing rating
    updateRating: builder.mutation({
      query: ({ ratingId, ratingData }: { ratingId: string, ratingData: any }) => ({
        url: `/rating/edit/${ratingId}`,
        method: 'PUT',
        body: ratingData,
      }),
      invalidatesTags: (result, _error, { ratingId, ratingData }) => [
        { type: 'Rating', id: ratingId },
        { type: 'RatingsByShoe', id: ratingData?.shoeID },
      ],
    }),
  }),
})

export const {
  useGetRatingQuery,
  useGetUserQuery, 
  useGetRatingsWithAuthorsQuery,
  useGetRatingsByShoeQuery,
  useLikeRatingMutation,
  useDislikeRatingMutation,
  useDeleteRatingMutation,
  useCreateRatingMutation,
  useUpdateRatingMutation,
} = ratingsApi