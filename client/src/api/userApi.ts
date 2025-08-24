import { RootState } from '../redux/store';
import { baseAPI } from './api'

export const userApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getLoggedInUser: builder.query<any, void>({
      async queryFn(_arg, api, _extraOptions, baseQuery) {
        const state = api.getState() as RootState
        const userId = state.user.currentUser?._id

        if (!userId) {
          return { error: { status: 'CUSTOM_ERROR', error: 'Not logged in' } }
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

          // Update the getLoggedInUser cache directly
          dispatch(
            userApi.util.updateQueryData('getLoggedInUser', undefined, (draft: any) => {
              Object.assign(draft, updatedUser as object)
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