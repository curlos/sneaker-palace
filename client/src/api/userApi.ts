import { RootState } from '../redux/store';
import { UserType } from '../types/types';
import { baseAPI } from './api'

export const userApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getLoggedInUser: builder.query<any, string | null>({
      async queryFn(userId, _api, _extraOptions, baseQuery) {
        if (!userId) {
          // Explicitly clear the cache when logged out
          return { data: null }
        }
        return await baseQuery(`/users/${userId}`)
      },
      providesTags: ['User'],
    }),

    
    updateUserPreferences: builder.mutation({
      async queryFn({ preferences }: { preferences: any }, api, _extraOptions, baseQuery) {
        const state = api.getState() as RootState
        const userId = state.user.currentUser?._id

        if (!userId) {
          return { error: { status: 'CUSTOM_ERROR', error: 'Not logged in' } }
        }

        return await baseQuery({
          url: `/users/${userId}`,
          method: 'PUT',
          body: preferences,
        })
      },

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedUser } = await queryFulfilled

          // Assert the type of updatedUser before using it
          const user = updatedUser as UserType

          // Update the getLoggedInUser cache directly
          dispatch(
            userApi.util.updateQueryData('getLoggedInUser', user._id, (draft: any) => {
              Object.assign(draft, user as object)
            })
          )
        } catch {
          // Handle error if needed
        }
      },

      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useGetLoggedInUserQuery,
  useUpdateUserPreferencesMutation,
} = userApi