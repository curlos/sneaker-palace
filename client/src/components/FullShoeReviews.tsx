import { Link } from 'react-router-dom';
import StarRatings from '../utils/StarRatingsCompat';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useState, useRef } from 'react';
import { IRating, Shoe } from '../types/types';
import Review from './Review';
import StarRatingProgress from './StarRatingProgress';
import { Pagination } from './Pagination';
import { useLikeRatingMutation, useDislikeRatingMutation } from '../api/ratingsApi';
import { useGetLoggedInUserQuery } from '../api/userApi';
import { RootState } from '../redux/store';

interface Props {
	shoe: Partial<Shoe>;
	shoeRatings: Array<IRating>;
}

const REVIEWS_PER_PAGE = 5;

const FullShoeReviews = ({ shoe, shoeRatings }: Props) => {
	const userId = useSelector((s: RootState) => s.user.currentUser?._id);
	const { data: user } = useGetLoggedInUserQuery(userId);
	const history = useHistory();
	const [currentPage, setCurrentPage] = useState(1);
	const reviewsRef = useRef<HTMLDivElement>(null);

	// RTK Query mutations
	const [likeRating, { isLoading: isLikeLoading }] = useLikeRatingMutation();
	const [dislikeRating, { isLoading: isDislikeLoading }] = useDislikeRatingMutation();

	// Sort reviews from newest to oldest
	const sortedReviews = [...shoeRatings].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

	// Percentage of reviews with a given star rating (0 when there are no reviews, to avoid NaN)
	const getStarPercentage = (starNum: number) =>
		shoeRatings.length > 0
			? shoeRatings.filter((rating) => rating.ratingNum === starNum).length / shoeRatings.length
			: 0;

	// Pagination logic
	const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE);
	const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
	const endIndex = startIndex + REVIEWS_PER_PAGE;
	const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

	const handleLike = async (ratingID: string) => {
		if (!user) {
			history.push('/login');
			return;
		}

		try {
			await likeRating({
				ratingID: ratingID,
				userID: user._id!,
				shoeID: shoe.shoeID!,
			}).unwrap();
		} catch (error) {
			console.error('Failed to like rating:', error);
		}
	};

	const handleDislike = async (ratingID: string) => {
		if (!user) {
			history.push('/login');
			return;
		}

		try {
			await dislikeRating({
				ratingID: ratingID,
				userID: user._id!,
				shoeID: shoe.shoeID!,
			}).unwrap();
		} catch (error) {
			console.error('Failed to dislike rating:', error);
		}
	};

	return (
		<div className="border-t border-gray-300 flex pt-8 max-xl:block max-xl:px-4">
			<div className="mr-12 flex-[2] max-xl:mb-10">
				<h2 className="text-2xl font-bold">Customer Reviews</h2>
				<div className="flex gap-2 items-center">
					<span aria-label={`Rated ${(shoe.rating || 0).toFixed(2)} out of 5`}>
						<StarRatings
							rating={Number((shoe.rating || 0).toFixed(2))}
							starRatedColor="#F5B327"
							numberOfStars={5}
							name="rating"
							starDimension="20px"
							starSpacing="2px"
						/>
					</span>
					{shoeRatings.length === 0 ? (
						<span className="text-lg">No reviews</span>
					) : (
						<span className="text-lg">{(shoe.rating || 0).toFixed(2)} out of 5</span>
					)}
				</div>

				<div className="text-gray-700">{shoeRatings.length} global ratings</div>

				<div>
					<StarRatingProgress rating={5} percentage={getStarPercentage(5)} />
					<StarRatingProgress rating={4} percentage={getStarPercentage(4)} />
					<StarRatingProgress rating={3} percentage={getStarPercentage(3)} />
					<StarRatingProgress rating={2} percentage={getStarPercentage(2)} />
					<StarRatingProgress rating={1} percentage={getStarPercentage(1)} />
				</div>

				<div className="mb-4">
					<h3 className="text-xl font-bold">Review this product</h3>
					<div className="my-3">Share your thoughts with other customers</div>
					<Link to={`/shoe/submit-review/${shoe.shoeID}`} className="px-5 py-2 border border-gray-300">
						Write a customer review
					</Link>
				</div>
			</div>

			{shoeRatings.length > 0 ? (
				<div className="flex-[8]">
					<h3 ref={reviewsRef} tabIndex={-1} className="text-2xl font-bold mb-4 outline-none">
						Reviews
					</h3>

					<div>
						{paginatedReviews.map((shoeRating) => (
							<Review
								key={shoeRating._id}
								shoeRating={shoeRating}
								shoe={shoe}
								onLike={handleLike}
								onDislike={handleDislike}
								isLoading={isLikeLoading || isDislikeLoading}
							/>
						))}
					</div>

					{shoeRatings.length > REVIEWS_PER_PAGE && (
						<Pagination
							pageLimit={totalPages}
							dataLimit={REVIEWS_PER_PAGE}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							totalItemCount={shoeRatings.length}
							scrollTarget={reviewsRef}
						/>
					)}
				</div>
			) : null}
		</div>
	);
};

export default FullShoeReviews;
