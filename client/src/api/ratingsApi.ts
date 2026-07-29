import { baseAPI } from './api';
import { userApi } from './userApi';
import { IRating, Shoe, UserType } from '../types/types';

export type CreateRatingPayload = Omit<
	IRating,
	'_id' | 'createdAt' | 'updatedAt' | 'postedByUser' | 'helpful' | 'notHelpful'
>;

export const ratingsApi = baseAPI.injectEndpoints({
	endpoints: (builder) => ({
		// Get a single rating by ID
		getRating: builder.query<IRating, string>({
			query: (ratingId: string) => `/rating/${ratingId}`,
			providesTags: (result, error, ratingId) => [{ type: 'Rating', id: ratingId }],
		}),

		// Get ratings for a specific shoe (using new flexible endpoint)
		getRatingsByShoe: builder.query<IRating[], string>({
			query: (shoeID: string) => `/rating/by/shoe/${shoeID}`,
			providesTags: (result, error, shoeID) => [
				{ type: 'RatingsByShoe' as const, id: shoeID },
				...(result || []).map((rating) => ({ type: 'Rating' as const, id: rating._id })),
			],
		}),

		// Get ratings by a specific user with author data
		getRatingsByUser: builder.query<IRating[], string>({
			query: (userID: string) => `/rating/by/user/${userID}`,
			providesTags: (result, error, userID) => [
				{ type: 'RatingsByUser' as const, id: userID },
				...(result || []).map((rating) => ({ type: 'Rating' as const, id: rating._id })),
			],
		}),

		// Like a rating
		likeRating: builder.mutation<
			{ updatedRating: IRating; updatedUser: UserType },
			{ ratingID: string; userID: string; shoeID: string }
		>({
			query: ({ ratingID, userID }) => ({
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
						const rating = draft.find((r) => r._id === ratingID);
						if (rating) {
							// Ensure arrays exist
							rating.helpful = rating.helpful || [];
							rating.notHelpful = rating.notHelpful || [];

							const isAlreadyLiked = rating.helpful.includes(userID);
							if (isAlreadyLiked) {
								// Remove user from helpful array if already liked (toggle off)
								rating.helpful = rating.helpful.filter((id: string) => id !== userID);
							} else {
								// Add user to helpful array if not already there
								rating.helpful = [...rating.helpful, userID];
								// Remove user from notHelpful array if present
								rating.notHelpful = rating.notHelpful.filter((id: string) => id !== userID);
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
			invalidatesTags: (_, _error, { userID }) => [
				{ type: 'User', id: userID },
				// TODO: Commented out these two since every time I like/dislike a rating, it was causing a race condition where the number would not actually update until the API call was done. For example, if the like button had "3" and I clicked it again, it should bring it down to "2". However, it'd stay at 3 until the API call was done. So commenting out this will let the patch reflect immediately instead. If something does go wrong, then the change will be undone.
				// { type: 'Rating', id: ratingID },
				// { type: 'RatingsByShoe', id: shoeID },
			],
		}),

		// Dislike a rating
		dislikeRating: builder.mutation<
			{ updatedRating: IRating; updatedUser: UserType },
			{ ratingID: string; userID: string; shoeID: string }
		>({
			query: ({ ratingID, userID }) => ({
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
						const rating = draft.find((r) => r._id === ratingID);
						if (rating) {
							// Ensure arrays exist
							rating.helpful = rating.helpful || [];
							rating.notHelpful = rating.notHelpful || [];

							const isAlreadyDisliked = rating.notHelpful.includes(userID);
							if (isAlreadyDisliked) {
								// Remove user from notHelpful array if already disliked (toggle off)
								rating.notHelpful = rating.notHelpful.filter((id: string) => id !== userID);
							} else {
								// Add user to notHelpful array if not already there
								rating.notHelpful = [...rating.notHelpful, userID];
								// Remove user from helpful array if present
								rating.helpful = rating.helpful.filter((id: string) => id !== userID);
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
			invalidatesTags: (_, _error, { userID }) => [
				{ type: 'User', id: userID },
				// TODO: Commented out these two since every time I like/dislike a rating, it was causing a race condition where the number would not actually update until the API call was done. For example, if the like button had "3" and I clicked it again, it should bring it down to "2". However, it'd stay at 3 until the API call was done. So commenting out this will let the patch reflect immediately instead. If something does go wrong, then the change will be undone.
				// { type: 'RatingsByShoe', id: shoeID },
				// { type: 'Rating', id: ratingID },
			],
		}),

		// Delete a rating
		deleteRating: builder.mutation<{ deletedRating: IRating; updatedShoe: Shoe }, string>({
			query: (ratingId: string) => ({
				url: `/rating/${ratingId}`,
				method: 'DELETE',
			}),
			// Optimistic deletion - remove rating immediately
			onQueryStarted: async (ratingId, { dispatch, queryFulfilled, getState }) => {
				const patchResults: { undo: () => void }[] = [];

				// Find all getRatingsByShoe queries and optimistically remove the rating
				const state = getState() as { api: ReturnType<typeof baseAPI.reducer> };
				const api = state.api;

				// Look through all cached queries to find ones that contain this rating
				Object.entries(api.queries).forEach(([queryKey, query]) => {
					if (queryKey.startsWith('getRatingsByShoe') && query?.data) {
						const shoeID = queryKey.split('(')[1]?.split(')')[0]?.replace(/"/g, '');
						const ratings = query.data as IRating[];
						if (shoeID && ratings.some((rating) => rating._id === ratingId)) {
							const patchResult = dispatch(
								ratingsApi.util.updateQueryData('getRatingsByShoe', shoeID, (draft) => {
									const index = draft.findIndex((rating) => rating._id === ratingId);
									if (index !== -1) {
										draft.splice(index, 1);
									}
								})
							);
							patchResults.push(patchResult);
						}
					}
				});

				try {
					await queryFulfilled;
				} catch (error) {
					// Rollback optimistic updates on failure
					patchResults.forEach((patchResult) => patchResult.undo());
					console.error('Failed to delete rating:', error);
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
		createRating: builder.mutation<
			{ updatedShoe: Shoe; updatedUser: UserType; rating: IRating },
			CreateRatingPayload
		>({
			query: (ratingData) => ({
				url: '/rating/rate',
				method: 'POST',
				body: ratingData,
			}),
			invalidatesTags: (result, _error, ratingData) => [
				{ type: 'RatingsByShoe', id: ratingData.shoeID },
				{ type: 'Shoe', id: result?.updatedShoe?.shoeID },
				{ type: 'User', id: result?.updatedUser?._id },
			],
		}),

		// Update an existing rating
		updateRating: builder.mutation<IRating, { ratingId: string; ratingData: Partial<CreateRatingPayload> }>({
			query: ({ ratingId, ratingData }) => ({
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
});

export const {
	useGetRatingQuery,
	useGetRatingsByShoeQuery,
	useGetRatingsByUserQuery,
	useLikeRatingMutation,
	useDislikeRatingMutation,
	useDeleteRatingMutation,
	useCreateRatingMutation,
	useUpdateRatingMutation,
} = ratingsApi;
