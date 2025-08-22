import { baseAPI } from './api'

export const userApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Update user preferences
    updateUserPreferences: builder.mutation({
      query: ({ userId, preferences }: { userId: string; preferences: any }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useUpdateUserPreferencesMutation,
} = userApi