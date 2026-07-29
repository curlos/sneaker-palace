import {
	PencilAltIcon,
	ThumbDownIcon as ThumbDownOutline,
	ThumbUpIcon as ThumbUpOutline,
	TrashIcon,
} from '@heroicons/react/outline';
import { ThumbDownIcon as ThumbDownSolid, ThumbUpIcon as ThumbUpSolid } from '@heroicons/react/solid';
import moment from 'moment';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import StarRatings from '../utils/StarRatingsCompat';
import { useDeleteRatingMutation } from '../api/ratingsApi';
import { useGetLoggedInUserQuery } from '../api/userApi';
import { RootState } from '../redux/store';
import { IRating, Shoe } from '../types/types';
import { DEFAULT_AVATAR } from '../utils/userConstants';
import ReviewModal from './ReviewModal';

interface Props {
	shoeRating: IRating;
	shoe: Partial<Shoe>;
	onLike: (ratingID: string) => void;
	onDislike: (ratingID: string) => void;
	isLoading: boolean;
}

const Review = ({ shoeRating, shoe, onLike, onDislike, isLoading }: Props) => {
	const userId = useSelector((s: RootState) => s.user.currentUser?._id);
	const { data: user } = useGetLoggedInUserQuery(userId);
	const review = shoeRating;
	const [showModal, setShowModal] = useState(false);

	// RTK Query mutations
	const [deleteRating] = useDeleteRatingMutation();

	const handleLike = () => {
		onLike(review._id);
	};

	const handleDislike = () => {
		onDislike(review._id);
	};

	const handleDeleteReview = async () => {
		try {
			await deleteRating(review._id).unwrap();
		} catch (error) {
			console.error('Failed to delete review:', error);
		}
	};

	return (
		<article className="mb-6">
			<div className="flex justify-between items-center">
				<div className="flex gap-2 items-center">
					<img
						src={review.postedByUser.profilePic ? `${review.postedByUser.profilePic}` : DEFAULT_AVATAR}
						alt={`${review.postedByUser.firstName || 'User'}'s avatar`}
						className="h-9 w-9 rounded-full object-cover"
					/>

					<Link to={`/profile/${review.postedByUser._id}`} className="text-sm cursor-pointer hover:underline">
						{review.postedByUser.firstName} {review.postedByUser.lastName}
					</Link>
				</div>

				{review.postedByUser._id === user?._id ? (
					<div className="flex gap-2">
						<Link to={`/shoe/edit-review/${shoe.shoeID}/${review._id}`} aria-label="Edit review">
							<PencilAltIcon
								className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer"
								aria-hidden="true"
							/>
						</Link>

						<button type="button" aria-label="Delete review" onClick={handleDeleteReview}>
							<TrashIcon
								className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer"
								aria-hidden="true"
							/>
						</button>
					</div>
				) : (
					<div></div>
				)}
			</div>
			<div className="flex max-sm:block">
				<span aria-label={`Rated ${review.ratingNum || 0} out of 5`}>
					<StarRatings
						rating={review.ratingNum || 0}
						starRatedColor="#F5B327"
						numberOfStars={5}
						name="rating"
						starDimension="16px"
						starSpacing="1px"
					/>
				</span>
				<div className="ml-2 font-bold max-sm:ml-0">{review.summary}</div>
			</div>

			<div className="text-sm text-gray-600">Reviewed on {moment(review.createdAt).format('MMMM Do, YYYY')}</div>
			<div className="text-sm my-2">
				<ReactMarkdown>{review.text}</ReactMarkdown>
			</div>

			{review.photo ? (
				<button
					type="button"
					aria-label="View full review photo"
					onClick={() => setShowModal(true)}
					className="block"
				>
					<img src={`${review.photo}`} alt="" className="h-36 object-cover my-2 cursor-pointer rounded-md" />
				</button>
			) : null}

			<div className="text-sm flex gap-2">
				<div>Helpful? </div>
				<button
					type="button"
					className={`flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-75'}`}
					onClick={handleLike}
					disabled={isLoading}
					aria-pressed={!!user?.helpful?.includes(review._id)}
					aria-label="Mark as helpful"
				>
					{user?.helpful?.includes(review._id) ? (
						<ThumbUpSolid className="h-5 w-5" aria-hidden="true" />
					) : (
						<ThumbUpOutline className="h-5 w-5" aria-hidden="true" />
					)}
					<span className="ml-1">{review.helpful.length}</span>
				</button>
				<button
					type="button"
					className={`flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-75'}`}
					onClick={handleDislike}
					disabled={isLoading}
					aria-pressed={!!user?.notHelpful?.includes(review._id)}
					aria-label="Mark as not helpful"
				>
					{user?.notHelpful?.includes(review._id) ? (
						<ThumbDownSolid className="h-5 w-5" aria-hidden="true" />
					) : (
						<ThumbDownOutline className="h-5 w-5" aria-hidden="true" />
					)}
					<span className="ml-1">{review.notHelpful.length}</span>
				</button>
			</div>

			{showModal ? <ReviewModal showModal={showModal} setShowModal={setShowModal} review={review} /> : null}
		</article>
	);
};

export default Review;
