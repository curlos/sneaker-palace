import { ChangeEvent, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import StarRatings from '../utils/StarRatingsCompat';
import { XIcon } from '@heroicons/react/outline';
import { useGetShoeQuery } from '../api/shoesApi';
import {
	useGetRatingQuery,
	useCreateRatingMutation,
	useUpdateRatingMutation,
	CreateRatingPayload,
} from '../api/ratingsApi';
import { useGetLoggedInUserQuery } from '../api/userApi';
import { RootState } from '../redux/store';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import ShoeImage from '../components/ShoeImage';
import { postImage } from '../utils/postImage';

const ReviewForm = () => {
	const history = useHistory();
	const userId = useSelector((s: RootState) => s.user.currentUser?._id);
	const { data: user } = useGetLoggedInUserQuery(userId);

	const { shoeID, reviewID }: { shoeID: string; reviewID: string } = useParams();

	// RTK Query hooks
	const { data: shoe, isLoading: shoeLoading } = useGetShoeQuery(shoeID);
	const { data: existingRating, isLoading: ratingLoading } = useGetRatingQuery(reviewID, { skip: !reviewID });
	const [createRating] = useCreateRatingMutation();
	const [updateRating] = useUpdateRatingMutation();

	type ReviewFormState = Omit<CreateRatingPayload, 'recommended'> & { recommended: boolean | null };

	const [reviewInfo, setReviewInfo] = useState<ReviewFormState>({
		userID: user?._id || '',
		shoeID: shoeID,
		ratingNum: 0,
		summary: '',
		text: '',
		photo: '',
		size: '',
		comfort: '',
		width: '',
		quality: '',
		recommended: null,
	});
	const [file, setFile] = useState<File>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [prevExistingRating, setPrevExistingRating] = useState(existingRating);

	// Update reviewInfo when existing rating is loaded (adjusting state during render
	// per https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
	if (existingRating !== prevExistingRating) {
		setPrevExistingRating(existingRating);
		if (existingRating && reviewID) {
			setReviewInfo((prev) => ({ ...prev, ...existingRating }));
		}
	}

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const handleSubmitReview = async () => {
		setIsSubmitting(true);
		try {
			let imagePath = null;

			if (file) {
				const results = await postImage(file);
				imagePath = results.imagePath;
			}

			const body = {
				...reviewInfo,
				photo: imagePath,
			};

			await createRating(body as CreateRatingPayload).unwrap();
			// If unwrap() succeeds, the mutation was successful
			history.push(`/shoe/${shoe?.shoeID}`);
		} catch (error) {
			console.error('Failed to submit review:', error);
			setIsSubmitting(false);
		}
	};

	const handleSelectFile = (e: ChangeEvent) => {
		const target = e.target as HTMLInputElement;
		const file: File = (target.files as FileList)[0];
		setFile(file);
	};

	const handleRemovePhoto = () => {
		setFile(undefined);
		setReviewInfo((prev) => ({ ...prev, photo: '' }));
	};

	const handleEditReview = async () => {
		setIsSubmitting(true);
		try {
			let imagePath = existingRating?.photo || null;

			if (file) {
				const results = await postImage(file);
				imagePath = results.imagePath;
			} else if (reviewInfo.photo === '') {
				// Photo was explicitly removed
				imagePath = null;
			}

			const body = {
				...reviewInfo,
				photo: imagePath,
			};

			await updateRating({
				ratingId: reviewID,
				ratingData: body as Partial<CreateRatingPayload>,
			}).unwrap();
			// If unwrap() succeeds, the mutation was successful
			history.push(`/shoe/${shoe?.shoeID}`);
		} catch (error) {
			console.error('Failed to edit review:', error);
			setIsSubmitting(false);
		}
	};

	const loading = shoeLoading || (reviewID && ratingLoading);

	return loading ? (
		<div className="flex justify-center py-10 h-screen">
			<CircleLoader size={16} />
		</div>
	) : (
		<div className="flex-grow">
			<div className="container mx-auto px-4 py-10 max-w-4xl">
				<h1 className="font-bold text-2xl">WRITE YOUR REVIEW</h1>
				<div className="flex justify-between items-center border border-gray-300 p-4 rounded-lg my-4">
					<div className="font-bold text-lg">{shoe?.name}</div>
					<ShoeImage
						src={shoe?.image?.original || ''}
						alt={shoe?.name || ''}
						className="h-[150px] w-[150px]"
					/>
				</div>

				<div className="">
					<div className="flex">
						<div className="font-medium flex-[2]">YOUR OVERALL RATING</div>
						<div className="font-medium mb-2 flex-[2]">WOULD YOU RECOMMEND THIS PRODUCT?</div>
					</div>

					<div className="flex my-2">
						<div className="flex-[2]">
							<div className="text-sm mb-2">Please select</div>
							<StarRatings
								rating={reviewInfo.ratingNum}
								starRatedColor="#F5B327"
								starHoverColor="#F5B327"
								changeRating={(newRating) => setReviewInfo({ ...reviewInfo, ratingNum: newRating })}
								numberOfStars={5}
								name="rating"
								starDimension="18px"
							/>
							{/* Accessible parallel control: react-star-ratings only handles mouse events, so
								this visually-hidden native radio group lets keyboard/screen reader users set the
								same reviewInfo.ratingNum state. */}
							<fieldset className="sr-only">
								<legend>Overall rating</legend>
								{[1, 2, 3, 4, 5].map((value) => (
									<label key={value}>
										<input
											type="radio"
											name="overallRating"
											value={value}
											checked={reviewInfo.ratingNum === value}
											onChange={() => setReviewInfo({ ...reviewInfo, ratingNum: value })}
										/>
										{value} {value === 1 ? 'star' : 'stars'}
									</label>
								))}
							</fieldset>
						</div>

						<fieldset className="flex-[2]">
							<legend className="sr-only">Would you recommend this product?</legend>
							<div className="flex items-center mb-2">
								<input
									id="recommended-yes"
									name="recommended"
									type="radio"
									value="Yes"
									className="mr-2 h-4 w-4"
									checked={reviewInfo.recommended === true}
									onChange={() => setReviewInfo({ ...reviewInfo, recommended: true })}
								/>
								<label htmlFor="recommended-yes">Yes</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="recommended-no"
									name="recommended"
									type="radio"
									value="No"
									className="mr-2 h-4 w-4"
									checked={reviewInfo.recommended === false}
									onChange={() => setReviewInfo({ ...reviewInfo, recommended: false })}
								/>
								<label htmlFor="recommended-no">No</label>
							</div>
						</fieldset>
					</div>

					<div className="flex mt-10">
						<div className="font-medium flex-[2]" id="size-label">
							SIZE
						</div>
						<div className="font-medium mb-2 flex-[2]" id="width-label">
							WIDTH
						</div>
					</div>

					<div className="flex my-2">
						<fieldset className="flex-[2]" aria-labelledby="size-label">
							<legend className="sr-only">Size</legend>
							<div className="flex items-center mb-2">
								<input
									id="size-too-small"
									name="sizeInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, size: 'Too small' })}
									checked={reviewInfo.size === 'Too small'}
								/>
								<label htmlFor="size-too-small" className="text-sm">
									Too small
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="size-half-small"
									name="sizeInput"
									type="radio"
									className="mr-2 h-4 w-4"
									checked={reviewInfo.size === '1/2 a size too small'}
									onChange={() => setReviewInfo({ ...reviewInfo, size: '1/2 a size too small' })}
								/>
								<label htmlFor="size-half-small" className="text-sm">
									1/2 a size too small
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="size-perfect"
									name="sizeInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, size: 'Perfect' })}
									checked={reviewInfo.size === 'Perfect'}
								/>
								<label htmlFor="size-perfect" className="text-sm">
									Perfect
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="size-half-big"
									name="sizeInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, size: '1/2 a size too big' })}
									checked={reviewInfo.size === '1/2 a size too big'}
								/>
								<label htmlFor="size-half-big" className="text-sm">
									1/2 a size too big
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="size-too-big"
									name="sizeInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, size: 'Too big' })}
									checked={reviewInfo.size === 'Too big'}
								/>
								<label htmlFor="size-too-big" className="text-sm">
									Too big
								</label>
							</div>
						</fieldset>

						<fieldset className="flex-[2]" aria-labelledby="width-label">
							<legend className="sr-only">Width</legend>
							<div className="flex items-center mb-2">
								<input
									id="width-too-narrow"
									name="widthInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, width: 'Too narrow' })}
									checked={reviewInfo.width === 'Too narrow'}
								/>
								<label htmlFor="width-too-narrow" className="text-sm">
									Too narrow
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="width-slightly-narrow"
									name="widthInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, width: 'Slightly narrow' })}
									checked={reviewInfo.width === 'Slightly narrow'}
								/>
								<label htmlFor="width-slightly-narrow" className="text-sm">
									Slightly narrow
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="width-perfect"
									name="widthInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, width: 'Perfect' })}
									checked={reviewInfo.width === 'Perfect'}
								/>
								<label htmlFor="width-perfect" className="text-sm">
									Perfect
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="width-slightly-wide"
									name="widthInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, width: 'Slightly wide' })}
									checked={reviewInfo.width === 'Slightly wide'}
								/>
								<label htmlFor="width-slightly-wide" className="text-sm">
									Slightly wide
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="width-too-wide"
									name="widthInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, width: 'Too wide' })}
									checked={reviewInfo.width === 'Too wide'}
								/>
								<label htmlFor="width-too-wide" className="text-sm">
									Too wide
								</label>
							</div>
						</fieldset>
					</div>

					<div className="flex mt-10">
						<div className="font-medium flex-[2]" id="comfort-label">
							COMFORT
						</div>
						<div className="font-medium mb-2 flex-[2]" id="quality-label">
							QUALITY
						</div>
					</div>

					<div className="flex my-2">
						<fieldset className="flex-[2]" aria-labelledby="comfort-label">
							<legend className="sr-only">Comfort</legend>
							<div className="flex items-center mb-2">
								<input
									id="comfort-uncomfortable"
									name="comfortInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, comfort: 'Uncomfortable' })}
									checked={reviewInfo.comfort === 'Uncomfortable'}
								/>
								<label htmlFor="comfort-uncomfortable" className="text-sm">
									Uncomfortable
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="comfort-slightly-uncomfortable"
									name="comfortInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, comfort: 'Slightly uncomfortable' })}
									checked={reviewInfo.comfort === 'Slightly uncomfortable'}
								/>
								<label htmlFor="comfort-slightly-uncomfortable" className="text-sm">
									Slightly uncomfortable
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="comfort-ok"
									name="comfortInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, comfort: 'Ok' })}
									checked={reviewInfo.comfort === 'Ok'}
								/>
								<label htmlFor="comfort-ok" className="text-sm">
									Ok
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="comfort-comfortable"
									name="comfortInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, comfort: 'Comfortable' })}
									checked={reviewInfo.comfort === 'Comfortable'}
								/>
								<label htmlFor="comfort-comfortable" className="text-sm">
									Comfortable
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="comfort-perfect"
									name="comfortInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, comfort: 'Perfect' })}
									checked={reviewInfo.comfort === 'Perfect'}
								/>
								<label htmlFor="comfort-perfect" className="text-sm">
									Perfect
								</label>
							</div>
						</fieldset>

						<fieldset className="flex-[2]" aria-labelledby="quality-label">
							<legend className="sr-only">Quality</legend>
							<div className="flex items-center mb-2">
								<input
									id="quality-poor"
									name="qualityInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, quality: 'Poor' })}
									checked={reviewInfo.quality === 'Poor'}
								/>
								<label htmlFor="quality-poor" className="text-sm">
									Poor
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="quality-below-average"
									name="qualityInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, quality: 'Below average' })}
									checked={reviewInfo.quality === 'Below average'}
								/>
								<label htmlFor="quality-below-average" className="text-sm">
									Below average
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="quality-what-i-expected"
									name="qualityInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, quality: 'What I expected' })}
									checked={reviewInfo.quality === 'What I expected'}
								/>
								<label htmlFor="quality-what-i-expected" className="text-sm">
									What I expected
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="quality-pretty-great"
									name="qualityInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, quality: 'Pretty great' })}
									checked={reviewInfo.quality === 'Pretty great'}
								/>
								<label htmlFor="quality-pretty-great" className="text-sm">
									Pretty great
								</label>
							</div>

							<div className="flex items-center mb-2">
								<input
									id="quality-perfect"
									name="qualityInput"
									type="radio"
									className="mr-2 h-4 w-4"
									onChange={() => setReviewInfo({ ...reviewInfo, quality: 'Perfect' })}
									checked={reviewInfo.quality === 'Perfect'}
								/>
								<label htmlFor="quality-perfect" className="text-sm">
									Perfect
								</label>
							</div>
						</fieldset>
					</div>
				</div>
			</div>

			<div className="border-0 border-b border-solid border-gray-300">&nbsp;</div>

			<div className="container mx-auto px-4 py-10 max-w-4xl">
				<h2 className="font-bold text-xl mb-4">YOUR REVIEW</h2>
				<div className="flex mb-4 max-sm:flex-col">
					<div className="flex-[2] w-full max-sm:mb-5">
						<label htmlFor="review-summary" className="text-gray-500 w-10/12 max-sm:w-full block">
							Summary
						</label>
						<input
							id="review-summary"
							required
							placeholder="Summary"
							className="border border-black p-3 w-10/12 max-sm:w-full"
							value={reviewInfo.summary}
							onChange={(e) => setReviewInfo({ ...reviewInfo, summary: e.target.value })}
						/>
						<div className="text-sm text-gray-500 w-10/12 max-sm:w-full">
							What's your opinion in one sentence? Example: Best purchase ever.
						</div>

						<label
							htmlFor="review-text"
							className="text-gray-500 w-10/12 max-sm:w-full max-sm:mt-4 mt-8 block"
						>
							Your Review
						</label>
						<textarea
							id="review-text"
							required
							className="resize-none border w-10/12 h-40 max-sm:w-full"
							onChange={(e) => setReviewInfo({ ...reviewInfo, text: e.target.value })}
							value={reviewInfo.text}
						></textarea>
						<div className="text-sm text-gray-500 w-10/12 max-sm:w-full">
							Tell other people more about the product. What about the quality? Or the comfort?
						</div>
					</div>

					<div className="flex-[2] w-full max-sm:mb-5">
						<label htmlFor="review-photo-upload" className="text-gray-500 w-10/12 block">
							Upload photo
						</label>
						{(file || reviewInfo.photo) && (
							<div className="relative inline-block">
								<img
									src={file ? URL.createObjectURL(file) : `${reviewInfo.photo}`}
									alt="Preview of your upload"
									className="h-[150px] object-cover my-3"
								/>
								<button
									onClick={handleRemovePhoto}
									className="absolute top-2 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md"
									type="button"
									aria-label="Remove photo"
								>
									<XIcon className="w-5 h-5" aria-hidden="true" />
								</button>
							</div>
						)}
						<input
							id="review-photo-upload"
							onChange={handleSelectFile}
							type="file"
							accept="image/*"
							className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-400 file:text-sm file:font-medium file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300"
						></input>
						<div className="text-sm text-gray-500 w-10/12 max-sm:w-full">Upload your .PNG or .JPG file</div>
					</div>
				</div>

				<button
					type="button"
					disabled={isSubmitting}
					className="bg-black text-white rounded-full flex-[2] py-3 mr-5 my-5 hover:bg-gray-700 p-7 disabled:opacity-50"
					onClick={reviewID ? handleEditReview : handleSubmitReview}
				>
					{isSubmitting ? (
						<div className="flex justify-center">
							<CircleLoader size={5} />
						</div>
					) : reviewID ? (
						'EDIT REVIEW'
					) : (
						'SUBMIT REVIEW'
					)}
				</button>
			</div>
		</div>
	);
};

export default ReviewForm;
