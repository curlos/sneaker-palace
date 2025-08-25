import { baseAPI } from './api'
import { IRating } from '../types/types'
import { userApi } from './userApi'

export const ratingsApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get a single rating by ID
    getRating: builder.query({
      query: (ratingId: string) => `/rating/${ratingId}`,
      providesTags: (result, error, ratingId) => [{ type: 'Rating', id: ratingId }],
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
      query: ({ ratingID, userID }: { ratingID: string, userID: string, shoeID: string }) => ({
        url: '/rating/like',
        method: 'PUT',
        body: { ratingID, userID },
      }),
      async onQueryStarted({ ratingID, userID, shoeID }, { dispatch, queryFulfilled }) {
        // Optimistic update for user
        const userPatchResult = dispatch(
          userApi.util.updateQueryData('getLoggedInUser', userID, (draft) => {
            if (draft) {
              const isAlreadyLiked = draft.helpful?.includes(ratingID);
              if (isAlreadyLiked) {
                // Remove from helpful array if already liked (toggle off)
                draft.helpful = draft.helpful?.filter((id: string) => id !== ratingID) || [];
              } else {
                // Add to helpful array if not already there
                draft.helpful = [...(draft.helpful || []), ratingID];
                // Remove from notHelpful array if present
                draft.notHelpful = draft.notHelpful?.filter((id: string) => id !== ratingID) || [];
              }
            }
          })
        );

        // Optimistic update for rating in getRatingsByShoe
        const ratingPatchResult = dispatch(
          ratingsApi.util.updateQueryData('getRatingsByShoe', shoeID, (draft) => {
            const rating = draft.find((r: any) => r._id === ratingID);
            if (rating) {
              const isAlreadyLiked = rating.helpful?.includes(userID);
              if (isAlreadyLiked) {
                // Remove user from helpful array if already liked (toggle off)
                rating.helpful = rating.helpful?.filter((id: string) => id !== userID) || [];
              } else {
                // Add user to helpful array if not already there
                rating.helpful = [...(rating.helpful || []), userID];
                // Remove user from notHelpful array if present
                rating.notHelpful = rating.notHelpful?.filter((id: string) => id !== userID) || [];
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on failure
          userPatchResult.undo();
          ratingPatchResult.undo();
        }
      },
      invalidatesTags: (_, _error, { ratingID, userID, shoeID }) => [
        { type: 'Rating', id: ratingID },
        { type: 'User', id: userID },
        { type: 'RatingsByShoe', id: shoeID },
      ],
    }),

    // Dislike a rating
    dislikeRating: builder.mutation({
      query: ({ ratingID, userID }: { ratingID: string, userID: string, shoeID: string }) => ({
        url: '/rating/dislike',
        method: 'PUT',
        body: { ratingID, userID },
      }),
      async onQueryStarted({ ratingID, userID, shoeID }, { dispatch, queryFulfilled }) {
        // Optimistic update for user
        const userPatchResult = dispatch(
          userApi.util.updateQueryData('getLoggedInUser', userID, (draft) => {
            if (draft) {
              const isAlreadyDisliked = draft.notHelpful?.includes(ratingID);
              if (isAlreadyDisliked) {
                // Remove from notHelpful array if already disliked (toggle off)
                draft.notHelpful = draft.notHelpful?.filter((id: string) => id !== ratingID) || [];
              } else {
                // Add to notHelpful array if not already there
                draft.notHelpful = [...(draft.notHelpful || []), ratingID];
                // Remove from helpful array if present
                draft.helpful = draft.helpful?.filter((id: string) => id !== ratingID) || [];
              }
            }
          })
        );

        // Optimistic update for rating in getRatingsByShoe
        const ratingPatchResult = dispatch(
          ratingsApi.util.updateQueryData('getRatingsByShoe', shoeID, (draft) => {
            const rating = draft.find((r: any) => r._id === ratingID);
            if (rating) {
              const isAlreadyDisliked = rating.notHelpful?.includes(userID);
              if (isAlreadyDisliked) {
                // Remove user from notHelpful array if already disliked (toggle off)
                rating.notHelpful = rating.notHelpful?.filter((id: string) => id !== userID) || [];
              } else {
                // Add user to notHelpful array if not already there
                rating.notHelpful = [...(rating.notHelpful || []), userID];
                // Remove user from helpful array if present
                rating.helpful = rating.helpful?.filter((id: string) => id !== userID) || [];
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on failure
          userPatchResult.undo();
          ratingPatchResult.undo();
        }
      },
      invalidatesTags: (_, _error, { ratingID, userID, shoeID }) => [
        { type: 'Rating', id: ratingID },
        { type: 'User', id: userID },
        { type: 'RatingsByShoe', id: shoeID },
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
  useGetRatingsWithAuthorsQuery,
  useGetRatingsByShoeQuery,
  useLikeRatingMutation,
  useDislikeRatingMutation,
  useDeleteRatingMutation,
  useCreateRatingMutation,
  useUpdateRatingMutation,
} = ratingsApi