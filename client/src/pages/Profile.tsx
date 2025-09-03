import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SmallReview from '../components/SmallReview';
import SmallShoe from '../components/SmallShoe';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import { Pagination } from '../components/Pagination';
import { useGetUserProfileQuery } from '../api/userApi';
import { useGetRatingsByUserQuery } from '../api/ratingsApi';
import { useGetShoesByObjectIdsQuery } from '../api/shoesApi';
import { Shoe } from '../types/types';
import { DEFAULT_AVATAR } from '../utils/userConstants';

const ITEMS_PER_PAGE = 10;

const formatJoinDate = (dateString: string) => {
	const date = new Date(dateString);
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	};
	return `Joined ${date.toLocaleDateString('en-US', options)}`;
};

const Profile = () => {
	const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews');
	const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);
	const [favoritesCurrentPage, setFavoritesCurrentPage] = useState(1);
	const tabsRef = useRef<HTMLDivElement>(null);

	const { userID }: { userID: string } = useParams();

	const { data: profileUser, isLoading: userLoading } = useGetUserProfileQuery(userID);
	const { data: profileUserReviews = [], isLoading: reviewsLoading } = useGetRatingsByUserQuery(userID, {
		skip: activeTab !== 'reviews',
	});
	const { data: favoriteShoes = [], isLoading: favoritesLoading } = useGetShoesByObjectIdsQuery(
		profileUser?.favorites || [],
		{ skip: activeTab !== 'favorites' || !profileUser?.favorites || profileUser.favorites.length === 0 }
	);

	// Pagination logic for reviews
	const sortedReviews = [...(profileUserReviews || [])].sort(
		(a: any, b: any) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
	const reviewsTotalPages = Math.ceil(sortedReviews.length / ITEMS_PER_PAGE);
	const reviewsStartIndex = (reviewsCurrentPage - 1) * ITEMS_PER_PAGE;
	const reviewsEndIndex = reviewsStartIndex + ITEMS_PER_PAGE;
	const paginatedReviews = sortedReviews.slice(reviewsStartIndex, reviewsEndIndex);

	// Pagination logic for favorites
	const sortedFavorites = [...(favoriteShoes || [])].sort(
		(a: Shoe, b: Shoe) => (b.rating || 0) - (a.rating || 0)
	);
	const favoritesTotalPages = Math.ceil(sortedFavorites.length / ITEMS_PER_PAGE);
	const favoritesStartIndex = (favoritesCurrentPage - 1) * ITEMS_PER_PAGE;
	const favoritesEndIndex = favoritesStartIndex + ITEMS_PER_PAGE;
	const paginatedFavorites = sortedFavorites.slice(favoritesStartIndex, favoritesEndIndex);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [userID]);

	return (
		<div className="container mx-auto px-4 py-10 bg-gray-100 max-w-6xl flex-grow">
			<div>
				{userLoading ? (
					<div className="flex justify-center py-4">
						<CircleLoader size={16} />
					</div>
				) : (
					<>
						<div className="flex items-center mb-5 border border-gray-300 p-8 rounded-lg bg-white gap-2">
							<div className="">
								<img
									src={
										profileUser?.profilePic
											? `${profileUser.profilePic}`
											: DEFAULT_AVATAR
									}
									alt=""
									className="sm:h-20 sm:w-20 h-36 w-36 rounded-full object-cover mb-3"
								/>
							</div>
							<div className="ml-2">
								<div className="text-2xl font-medium">
									{profileUser?.firstName} {profileUser?.lastName}
								</div>
								<div className="text-gray-500">
									{profileUser?.createdAt ? formatJoinDate(profileUser.createdAt) : ''}
								</div>
							</div>
						</div>

						<div className="border border-gray-300 p-8 rounded-lg bg-white mb-4">
							<div className="font-medium mb-2">Insights</div>
							<div className="flex gap-6 sm:block">
								<div className="sm:flex sm:items-center sm:gap-2">
									<div className="font-bold text-2xl">{profileUser?.helpful?.length || 0}</div>
									<div>Helpful votes</div>
								</div>

								<div className="sm:flex sm:items-center sm:gap-2">
									<div className="font-bold text-2xl">{profileUser?.notHelpful?.length || 0}</div>
									<div>Unhelpful votes</div>
								</div>

								<div className="sm:flex sm:items-center sm:gap-2">
									<div className="font-bold text-2xl">
										{reviewsLoading ? '...' : profileUserReviews.length}
									</div>
									<div>Reviews</div>
								</div>

								<div className="sm:flex sm:items-center sm:gap-2">
									<div className="font-bold text-2xl">{profileUser?.favorites?.length || 0}</div>
									<div>Favorites</div>
								</div>
							</div>
						</div>
					</>
				)}

				<div ref={tabsRef} className="flex border-b border-gray-300 mb-4">
					<button
						onClick={() => setActiveTab('reviews')}
						className={`px-4 py-2 font-medium border-b-2 ${
							activeTab === 'reviews'
								? 'border-black text-black'
								: 'border-transparent text-gray-600 hover:text-gray-800'
						}`}
					>
						Reviews
					</button>
					<button
						onClick={() => setActiveTab('favorites')}
						className={`px-4 py-2 font-medium border-b-2 ${
							activeTab === 'favorites'
								? 'border-black text-black'
								: 'border-transparent text-gray-600 hover:text-gray-800'
						}`}
					>
						Favorites
					</button>
				</div>

				{activeTab === 'reviews' &&
					(reviewsLoading ? (
						<div className="border border-gray-300 p-8 rounded-lg bg-white mb-4">
							<div className="flex justify-center py-4">
								<CircleLoader size={12} />
							</div>
						</div>
					) : sortedReviews.length > 0 && profileUser ? (
						<div>
							<div>
								{paginatedReviews.map((review: any) => (
									<SmallReview key={review._id} review={review} author={profileUser} />
								))}
							</div>
							{sortedReviews.length > ITEMS_PER_PAGE && (
								<Pagination
									pageLimit={reviewsTotalPages}
									dataLimit={ITEMS_PER_PAGE}
									currentPage={reviewsCurrentPage}
									setCurrentPage={setReviewsCurrentPage}
									totalItemCount={sortedReviews.length}
									scrollTarget={tabsRef}
								/>
							)}
						</div>
					) : null)}

				{activeTab === 'favorites' &&
					(favoritesLoading ? (
						<div className="border border-gray-300 p-8 rounded-lg bg-white mb-4">
							<div className="flex justify-center py-4">
								<CircleLoader size={12} />
							</div>
						</div>
					) : sortedFavorites.length > 0 ? (
						<div>
							<div className="flex flex-wrap justify-start bg-white border border-gray-300 rounded-lg p-3">
								{paginatedFavorites.map((shoe: Shoe) => shoe && <SmallShoe key={shoe._id} shoe={shoe} />)}
							</div>
							{sortedFavorites.length > ITEMS_PER_PAGE && (
								<Pagination
									pageLimit={favoritesTotalPages}
									dataLimit={ITEMS_PER_PAGE}
									currentPage={favoritesCurrentPage}
									setCurrentPage={setFavoritesCurrentPage}
									totalItemCount={sortedFavorites.length}
									scrollTarget={tabsRef}
								/>
							)}
						</div>
					) : (
						<div className="border border-gray-300 p-8 rounded-lg bg-white mb-4">
							<div className="text-center text-gray-600">No shoes in favorites.</div>
						</div>
					))}
			</div>
		</div>
	);
};

export default Profile;
