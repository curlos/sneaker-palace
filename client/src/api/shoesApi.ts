import { baseAPI } from './api'
import { userApi } from './userApi'

export const shoesApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get a single shoe by ID
    getShoe: builder.query({
      query: (shoeId: string) => `/shoes/${shoeId}`,
      providesTags: (_, __, shoeId) => [{ type: 'Shoe', id: shoeId }],
    }),

    // Get multiple shoes by ObjectIDs (batch fetch for favorites)
    getShoesByObjectIds: builder.query({
      query: (ids: string[]) => ({
        url: '/shoes/objectIDs',
        method: 'POST',
        body: { ids },
      }),
      providesTags: (result) => 
        result ? result.map((shoe: any) => ({ type: 'Shoe', id: shoe.shoeID })) : [],
    }),

    // Get multiple shoes in bulk by any key (flexible batch fetch)
    getShoesBulk: builder.query({
      query: ({ ids, key = '_id' }: { ids: string[]; key?: string }) => ({
        url: '/shoes/bulk',
        method: 'POST',
        body: { ids, key },
      }),
      providesTags: (result) => 
        result ? result.map((shoe: any) => ({ type: 'Shoe', id: shoe.shoeID })) : [],
    }),

    // Get paginated shoes (used in ProductList)
    getPaginatedShoes: builder.query({
      query: ({ filters, sortType, pageNum, query }: { 
        filters: any; 
        sortType: string; 
        pageNum: number; 
        query: string;
      }) => ({
        url: '/shoes',
        method: 'POST',
        body: { filters, sortType, pageNum, query },
      }),
      providesTags: ['Shoe'],
    }),

    // Get shoes from a specific page (used in MoreShoes)
    getShoesFromPage: builder.query({
      query: (pageNum: number) => `/shoes/page/${pageNum}`,
      providesTags: ['Shoe'],
    }),

    // Search shoes
    searchShoes: builder.mutation({
      query: ({ searchText, pageNum }: { searchText: string; pageNum: number }) => ({
        url: '/shoes/search',
        method: 'POST',
        body: { searchText, pageNum },
      }),
    }),

    // Favorite/unfavorite a shoe
    toggleFavoriteShoe: builder.mutation({
      query: ({ shoeID, userID, shoe_id }: { shoeID: string; userID: string; shoe_id?: string }) => ({
        url: '/shoes/favorite',
        method: 'PUT',
        body: { shoeID, userID },
      }),
      // Optimistic update
      onQueryStarted: async ({ shoeID, userID, shoe_id }, { dispatch, queryFulfilled }) => {
        // Optimistic update to shoe cache
        const patchResult = dispatch(
          shoesApi.util.updateQueryData('getShoe', shoeID, (draft) => {
            if (draft.favorites) {
              const isFavorited = draft.favorites.includes(userID)
              if (isFavorited) {
                // Remove from favorites
                draft.favorites = draft.favorites.filter((id: string) => id !== userID)
              } else {
                // Add to favorites
                draft.favorites.push(userID)
              }
            }
          })
        )

        // Optimistic update to user favorites cache
        let userPatchResult: any = null
        if (shoe_id && userID) {
          userPatchResult = dispatch(
            userApi.util.updateQueryData('getLoggedInUser', userID, (draft) => {
              if (draft && draft.favorites) {
                const isFavorited = draft.favorites.includes(shoe_id)
                if (isFavorited) {
                  draft.favorites = draft.favorites.filter((id: string) => id !== shoe_id)
                } else {
                  draft.favorites.push(shoe_id)
                }
              }
            })
          )
        }

        try {
          await queryFulfilled
        } catch (error) {
          // Rollback optimistic updates on failure
          patchResult.undo()
          if (userPatchResult) {
            userPatchResult.undo()
          }
          console.error('Failed to toggle favorite:', error)
        }
      },
      invalidatesTags: (_, __, { shoeID, userID }) => [
        { type: 'Shoe', id: shoeID },
        { type: 'User', id: userID }
      ],
    }),
  }),
})

export const {
  useGetShoeQuery,
  useGetShoesByObjectIdsQuery,
  useGetShoesBulkQuery,
  useGetPaginatedShoesQuery,
  useGetShoesFromPageQuery,
  useSearchShoesMutation,
  useToggleFavoriteShoeMutation,
} = shoesApi