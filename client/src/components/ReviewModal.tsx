import { XIcon } from '@heroicons/react/outline';
import moment from 'moment';
import React from 'react';
import ReactMarkdown from 'react-markdown';
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
			className="fixed z-20 inset-0 bg-black bg-opacity-40 p-6 sm:p-4 flex justify-center items-center overflow-auto"
			onClick={() => setShowModal(!showModal)}
		>
			<div className="placeholder-gray-400 max-w-4xl max-h-full w-full overflow-hidden flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-end rounded-t-2xl bg-gray-300 border-0 border-b border-solid border-gray-400 p-3">
					<XIcon className="h-6 w-6 cursor-pointer" onClick={() => setShowModal(false)} />
				</div>

				<div className="bg-white flex-1 overflow-y-auto" style={{scrollbarWidth: 'thin'}}>
					<div className="p-4 flex xl:block">
						<div className="w-full" style={{ maxWidth: '250px' }}>
							<img
								src={`${review.photo}`}
								alt=""
								className="mr-4 xl:mr-0 w-full h-auto rounded-md"
							/>
						</div>

						<div className="sm:ml-0 ml-4">
							<div className="sm:block flex gap-2">
								<StarRatings
									rating={review.ratingNum || 0}
									starRatedColor="#F5B327"
									numberOfStars={5}
									name="rating"
									starDimension="18px"
									starSpacing="1px"
								/>

								<div className="font-bold">{review.summary}</div>
							</div>

							<div>
								<div className="text-sm text-gray-600 mb-2">
									By {review.postedByUser.firstName} {review.postedByUser.lastName} on{' '}
									{moment(review.createdAt).format('MMMM Do, YYYY')}
								</div>

								<div>
									<ReactMarkdown>{review.text}</ReactMarkdown>
								</div>
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
