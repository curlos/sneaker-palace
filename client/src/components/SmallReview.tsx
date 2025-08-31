import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import StarRatings from 'react-star-ratings';
import { useGetShoeQuery } from '../api/shoesApi';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import ShoeImage from './ShoeImage';
import { IRating, UserType } from '../types/types';
import { DEFAULT_AVATAR } from '../utils/userConstants';

interface Props {
	review: IRating;
	author: Partial<UserType>;
}

const SmallReview = ({ review, author }: Props) => {
	const { data: shoe, isLoading: loading } = useGetShoeQuery(review.shoeID);

	return loading ? (
		<div className="flex justify-center py-4">
			<CircleLoader size={16} />
		</div>
	) : (
		<div className="border border-gray-300 rounded-lg bg-white mb-4">
			<div className="flex items-center gap-3 text-sm my-3 border-0 border-b border-solid border-gray-300 p-3">
				<div>
					<img
						src={
							author.profilePic ? `${author.profilePic}` : DEFAULT_AVATAR
						}
						alt={author?.firstName}
						className="h-9 w-9 rounded-full object-cover"
					/>
				</div>
				<div>
					{author.firstName} {author.lastName}
				</div>
				<div className="text-gray-600 text-xs">
					reviewed a shoe • {moment(review.createdAt).format('MMMM Do, YYYY')}
				</div>
			</div>
			<div className="p-3">
				<div className="flex items-center gap-2">
					<StarRatings
						rating={review.ratingNum || 0}
						starRatedColor="#F5B327"
						numberOfStars={5}
						name="rating"
						starDimension="16px"
						starSpacing="1px"
					/>
				</div>
				<div className="font-bold">{review.summary}</div>
				<div className="text-sm">{review.text}</div>
				{review.photo && (
					<img
						src={review.photo}
						alt=""
						className="max-h-32 w-auto object-cover my-2 rounded"
					/>
				)}
				<div className="border border-gray-300 rounded-lg bg-white mt-2">
					<Link to={`/shoe/${shoe.shoeID}`}>
						<div className="flex items-center gap-2">
							<div>
								<ShoeImage
									src={shoe?.image?.original || ''}
									alt={shoe?.name || ''}
									className="h-24 w-24 sm:h-16 sm:w-16"
								/>
							</div>
							<div>
								<div className="text-sm">{shoe.name}</div>
								<div className="flex items-center gap-2">
									<StarRatings
										rating={shoe.rating || 0}
										starRatedColor="#F5B327"
										numberOfStars={5}
										name="rating"
										starDimension="14px"
										starSpacing="1px"
									/>
									<div className="text-sm text-gray-700">{shoe?.ratings?.length}</div>
								</div>
							</div>
						</div>
					</Link>
				</div>
				<div></div>
			</div>
		</div>
	);
};

export default SmallReview;
