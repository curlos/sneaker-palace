import { RootState } from '../redux/store';
import { UpdateUserInfoPayload, UpdateUserPasswordPayload, UserType } from '../types/types';
import { baseAPI } from './api';

export const userApi = baseAPI.injectEndpoints({
	endpoints: (builder) => ({
		getLoggedInUser: builder.query<UserType | null, string | null | undefined>({
			async queryFn(userId, _api, _extraOptions, baseQuery) {
				if (!userId) {
					// Explicitly clear the cache when logged out
					return { data: null };
				}
				const result = await baseQuery(`/users/${userId}`);
				if (result.error) return { error: result.error };
				return { data: result.data as UserType };
			},
			providesTags: (_result, _error, userId) => (userId ? [{ type: 'User', id: userId }] : ['User']),
		}),

		updateUserInfo: builder.mutation({
			async queryFn({ body }: { body: UpdateUserInfoPayload }, api, _extraOptions, baseQuery) {
				const s = api.getState() as RootState;
				const userId = s.user.currentUser?._id;

				if (!userId) {
					return { error: { status: 'CUSTOM_ERROR', error: 'Not logged in' } };
				}

				return await baseQuery({
					url: `/users`,
					method: 'PUT',
					body,
				});
			},

			async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
				try {
					const { data: updatedUser } = await queryFulfilled;

					// Assert the type of updatedUser before using it
					const user = updatedUser as UserType;

					// Update the getLoggedInUser cache directly
					dispatch(
						userApi.util.updateQueryData('getLoggedInUser', user._id, (draft) => {
							if (draft) Object.assign(draft, user as object);
						})
					);

					// Update the getUserProfile cache for the same user
					dispatch(
						userApi.util.updateQueryData('getUserProfile', user._id, (draft) => {
							Object.assign(draft, user as object);
						})
					);
				} catch {
					// Handle error if needed
				}
			},

			invalidatesTags: ['User', 'RatingsByShoe', 'RatingsByUser'],
		}),

		updateUserPassword: builder.mutation({
			async queryFn({ body }: { body: UpdateUserPasswordPayload }, api, _extraOptions, baseQuery) {
				const s = api.getState() as RootState;
				const userId = s.user.currentUser?._id;

				if (!userId) {
					return { error: { status: 'CUSTOM_ERROR', error: 'Not logged in' } };
				}

				return await baseQuery({
					url: `/users/password`,
					method: 'PUT',
					body,
				});
			},

			async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
				try {
					const { data: updatedUser } = await queryFulfilled;

					// Assert the type of updatedUser before using it
					const user = updatedUser as UserType;

					// Update the getLoggedInUser cache directly
					dispatch(
						userApi.util.updateQueryData('getLoggedInUser', user._id, (draft) => {
							if (draft) Object.assign(draft, user as object);
						})
					);
				} catch {
					// Handle error if needed
				}
			},

			invalidatesTags: ['User'],
		}),

		getUserProfile: builder.query<UserType, string>({
			query: (userId: string) => `/users/${userId}`,
			providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
		}),
	}),
});

export const {
	useGetLoggedInUserQuery,
	useUpdateUserInfoMutation,
	useUpdateUserPasswordMutation,
	useGetUserProfileQuery,
} = userApi;
