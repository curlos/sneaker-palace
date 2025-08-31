import {
	PencilAltIcon,
	ThumbDownIcon as ThumbDownOutline,
	ThumbUpIcon as ThumbUpOutline,
	TrashIcon,
} from '@heroicons/react/outline';
import { ThumbDownIcon as ThumbDownSolid, ThumbUpIcon as ThumbUpSolid } from '@heroicons/react/solid';
import moment from 'moment';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import StarRatings from 'react-star-ratings';
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
		<div className="mb-6">
			<div className="flex justify-between items-center">
				<div className="flex gap-2 items-center">
					<img
						src={
							review.postedByUser.profilePic
								? `${process.env.REACT_APP_DEV_URL}${review.postedByUser.profilePic}`
								: DEFAULT_AVATAR
						}
						alt={review.postedByUser.firstName}
						className="h-9 w-9 rounded-full object-cover"
					/>

					<Link to={`/profile/${review.postedByUser._id}`} className="text-sm cursor-pointer hover:underline">
						{review.postedByUser.firstName} {review.postedByUser.lastName}
					</Link>
				</div>

				{review.postedByUser._id === user?._id ? (
					<div className="flex gap-2">
						<Link to={`/shoe/edit-review/${shoe.shoeID}/${review._id}`}>
							<PencilAltIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
						</Link>

						<TrashIcon
							className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer"
							onClick={handleDeleteReview}
						/>
					</div>
				) : (
					<div></div>
				)}
			</div>
			<div className="flex sm:block">
				<StarRatings
					rating={review.ratingNum || 0}
					starRatedColor="#F5B327"
					numberOfStars={5}
					name="rating"
					starDimension="16px"
					starSpacing="1px"
				/>
				<div className="ml-2 font-bold sm:ml-0">{review.summary}</div>
			</div>

			<div className="text-sm text-gray-600">Reviewed on {moment(review.createdAt).format('MMMM Do, YYYY')}</div>
			{/* <div className="text-sm font-medium text-orange-700">Verified Purchase</div> */}
			<div className="text-sm my-2">{review.text}</div>

			{review.photo ? (
				<img
					src={`${process.env.REACT_APP_DEV_URL}${review.photo}`}
					alt=""
					className="h-36 object-cover my-2 cursor-pointer"
					onClick={() => setShowModal(true)}
				/>
			) : null}

			<div className="text-sm flex gap-2">
				<div>Helpful? </div>
				<button
					className={`flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-75'}`}
					onClick={handleLike}
					disabled={isLoading}
				>
					{user?.helpful?.includes(review._id) ? (
						<ThumbUpSolid className="h-5 w-5" />
					) : (
						<ThumbUpOutline className="h-5 w-5" />
					)}
					<span className="ml-1">{review.helpful.length}</span>
				</button>
				<button
					className={`flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-75'}`}
					onClick={handleDislike}
					disabled={isLoading}
				>
					{user?.notHelpful?.includes(review._id) ? (
						<ThumbDownSolid className="h-5 w-5" />
					) : (
						<ThumbDownOutline className="h-5 w-5" />
					)}
					<span className="ml-1">{review.notHelpful.length}</span>
				</button>
			</div>

			{showModal ? <ReviewModal showModal={showModal} setShowModal={setShowModal} review={review} /> : null}
		</div>
	);
};

export default Review;
