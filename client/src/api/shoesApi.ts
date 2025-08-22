import { updateUser } from '../redux/userRedux'
import { baseAPI } from './api'

export const shoesApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get a single shoe by ID
    getShoe: builder.query({
      query: (shoeId: string) => `/shoes/${shoeId}`,
      providesTags: (_, __, shoeId) => [{ type: 'Shoe', id: shoeId }],
    }),

    // Get shoe by ObjectID (used in Favorites)
    getShoeByObjectId: builder.query({
      query: (objectId: string) => `/shoes/objectID/${objectId}`,
      providesTags: (result) => result ? [{ type: 'Shoe', id: result.shoeID }] : [],
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
      onQueryStarted: async ({ shoeID, userID, shoe_id }, { dispatch, queryFulfilled, getState }) => {
        // Get current user from Redux state
        const currentUser = (getState() as any).user?.currentUser
        const originalUser = { ...currentUser }
        
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

        // Optimistic update to user favorites
        if (currentUser && currentUser.favorites && shoe_id) {
          const isFavorited = currentUser.favorites.includes(shoe_id)
          const optimisticUser = {
            ...currentUser,
            favorites: isFavorited 
              ? currentUser.favorites.filter((id: string) => id !== shoe_id)
              : [...currentUser.favorites, shoe_id]
          }
          dispatch(updateUser(optimisticUser))
        }

        try {
          const { data } = await queryFulfilled
          // Update user state with server response
          dispatch(updateUser(data.updatedUser))
        } catch (error) {
          // Rollback optimistic updates on failure
          patchResult.undo()
          dispatch(updateUser(originalUser))
          console.error('Failed to toggle favorite:', error)
        }
      },
      invalidatesTags: (_, __, { shoeID }) => [
        { type: 'Shoe', id: shoeID }
      ],
    }),
  }),
})

export const {
  useGetShoeQuery,
  useGetShoeByObjectIdQuery,
  useGetPaginatedShoesQuery,
  useGetShoesFromPageQuery,
  useSearchShoesMutation,
  useToggleFavoriteShoeMutation,
} = shoesApi