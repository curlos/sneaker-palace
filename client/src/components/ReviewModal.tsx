import { XIcon } from '@heroicons/react/outline';
import moment from 'moment';
import React from 'react';
import StarRatings from 'react-star-ratings';
import { IRating } from '../types/types';

interface Props {
	showModal: boolean;
	setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
	review: IRating;
}

const ReviewModal = ({ showModal, setShowModal, review }: Props) => {
	return (
		<div
			className="fixed z-20 max-w-100 w-screen h-screen bg-black bg-opacity-40 p-24 top-0 left-0 flex justify-center items-center sm:py-4 sm:px-2 overflow-auto"
			onClick={() => setShowModal(!showModal)}
		>
			<div className="placeholder-gray-400">
				<div className="flex justify-end rounded-t-2xl bg-gray-300 border-0 border-b border-solid border-gray-400 p-3">
					<XIcon className="h-6 w-6 cursor-pointer" onClick={() => setShowModal(false)} />
				</div>

				<div className="overflow-y bg-white">
					<div className="p-3 flex xl:block">
						<div className="flex-2">
							<img
								src={`${review.photo}`}
								alt=""
								className="mr-4 xl:mr-0"
							/>
						</div>

						<div className="flex-2 ml-4">
							<div className="flex">
								<StarRatings
									rating={review.ratingNum || 0}
									starRatedColor="#F5B327"
									numberOfStars={5}
									name="rating"
									starDimension="18px"
									starSpacing="1px"
								/>

								<div className="ml-2 font-bold">{review.summary}</div>
							</div>

							<div className="flex-2">
								<div className="text-sm text-gray-600">
									By {review.postedByUser.firstName} {review.postedByUser.lastName} on{' '}
									{moment(review.createdAt).format('MMMM Do, YYYY')}
								</div>

								<div>{review.text}</div>
							</div>
						</div>
					</div>
				</div>

				<div className="w-full flex justify-end rounded-b-2xl bg-white p-3 h-7"></div>
			</div>
		</div>
	);
};

export default ReviewModal;
