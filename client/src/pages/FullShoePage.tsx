import { HeartIcon as HeartOutline } from '@heroicons/react/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/solid';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useGetRatingsByShoeQuery } from '../api/ratingsApi';
import { useGetShoeQuery, useToggleFavoriteShoeMutation } from '../api/shoesApi';
import { useCart, useUpdateUserCartMutation, useUpdateGuestCartMutation } from '../api/cartApi';
import { useGetLoggedInUserQuery } from '../api/userApi';
import FullShoeReviews from '../components/FullShoeReviews';
import ShoeImage from '../components/ShoeImage';
import ShoppingCartModal from '../components/ShoppingCartModal';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import FullShoeSkeleton from '../skeleton_loaders/FullShoeSkeleton';
import { IProduct } from '../types/types';
import { ObjectId } from 'bson';
import * as short from 'short-uuid';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import MoreShoes from '../components/MoreShoes';
import { SHOE_SIZES, AVERAGE_SHOE_SIZE } from '../utils/shoeConstants';

interface Props {
	setShowShoppingCartModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const FullShoePage = ({ setShowShoppingCartModal }: Props) => {
	const history = useHistory();

	const userId = useSelector((s: RootState) => s.user.currentUser?._id);
	const { data: user, isLoading: userLoading } = useGetLoggedInUserQuery(userId);

	// Get cart data using unified hook
	const { data: cartData } = useCart();

	const { shoeID }: { shoeID: string } = useParams();

	const initialSize = user?.preselectedShoeSize || AVERAGE_SHOE_SIZE;

	// RTK Query hooks
	const { data: shoe, isLoading: shoeLoading } = useGetShoeQuery(shoeID);
	const { data: shoeRatings, isLoading: reviewLoading } = useGetRatingsByShoeQuery(shoeID);
	const [toggleFavorite, { isLoading: isFavoriteLoading }] = useToggleFavoriteShoeMutation();
	const [updateUserCart] = useUpdateUserCartMutation();
	const [updateGuestCart] = useUpdateGuestCartMutation();

	// Local state
	const [selectedSize, setSelectedSize] = useState(initialSize);
	const [imageNum, setImageNum] = useState(0);
	const [showModal, setShowModal] = useState(false);

	// Scroll to top when shoe changes
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [shoeID]);

	useEffect(() => {
		setSelectedSize(initialSize);
	}, [user]);

	const handleAddToCart = async () => {
		setShowShoppingCartModal(true);

		if (!shoe?.shoeID || shoe.retailPrice === undefined || shoe.retailPrice < 0) {
			console.error('Invalid shoe data');
			return;
		}

		const newProduct: IProduct = {
			_id: new ObjectId().toString(),
			productID: shoe.shoeID,
			size: selectedSize,
			quantity: 1,
			retailPrice: shoe.retailPrice,
		};

		if (user?._id) {
			// Logged in user - add to existing cart (getUserCart API ensures cart exists)
			const updatedProducts = [...(cartData?.products || []), newProduct];
			try {
				await updateUserCart({
					products: updatedProducts,
				}).unwrap();
			} catch (error) {
				console.error('Failed to add to cart:', error);
			}
		} else {
			// Guest user - use unified guest cart mutation
			const currentProducts = cartData?.products || [];
			const updatedCart = {
				_id: cartData?._id || new ObjectId().toString(),
				products: [...currentProducts, newProduct],
				createdAt: cartData?.createdAt || new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			try {
				await updateGuestCart(updatedCart).unwrap();
			} catch (error) {
				console.error('Failed to add to guest cart:', error);
			}
		}
	};

	const handleFavorite = async () => {
		if (!user?._id) {
			history.push('/login');
			return;
		}

		if (isFavoriteLoading) return; // Prevent multiple clicks

		try {
			await toggleFavorite({
				shoeID: shoeID,
				userID: user._id!,
				shoe_id: shoe?._id,
			}).unwrap();
			// Optimistic update is handled in the API slice
		} catch (error) {
			console.error('Failed to toggle favorite:', error);
		}
	};

	return (
		<div className="flex-grow">
			<div className="container mx-auto px-4 py-5 max-w-7xl w-full h-full">
				<div className="w-full h-full">
					{shoeLoading || userLoading ? (
						<FullShoeSkeleton />
					) : (
						<div className="flex md:block">
							<div className="flex-3">
								{shoe && shoe.image && shoe.image['360'].length > 0 ? (
									<div className="xl:px-4">
										<img src={shoe?.image['360'][imageNum]} alt={shoe.name} />
										<input
											type="range"
											id="volume"
											name="volume"
											value={imageNum}
											onChange={(e) => setImageNum(Number(e.target.value))}
											min="0"
											max={shoe.image['360'].length - 1}
											className="w-full"
										></input>
									</div>
								) : (
									<ShoeImage src={shoe?.image?.original || ''} alt={shoe?.name || ''} />
								)}
							</div>

							<div className="flex-2 p-10 xl:p-4">
								<div className="text-2xl">{shoe?.name}</div>
								<div className="text-gray-500">
									{shoe?.gender?.charAt(0).toUpperCase() + shoe?.gender?.slice(1)}'s Shoes
								</div>
								<div className="text-xl text-red-800 mt-1">${shoe?.retailPrice}</div>
								<div className="mt-5 mb-2">Select Size</div>
								<div className="flex flex-wrap box-border justify-between">
									{SHOE_SIZES.map((shoeSize) => {
										return (
											<div
												key={shoeSize + '-' + short.generate()}
												className={
													`box-border cursor-pointer text-center border py-2 mb-2 hover:border-gray-600 w-32/100 ` +
													(shoeSize === selectedSize ? 'border-black' : 'border-gray-300')
												}
												onClick={() => setSelectedSize(shoeSize)}
											>
												{shoeSize}
											</div>
										);
									})}
								</div>

								<div className="flex justify-between xl:block gap-2">
									<button
										className="bg-black text-white rounded-full py-3 my-5 hover:bg-gray-700 w-1/2 xl:w-full xl:mb-0"
										onClick={handleAddToCart}
									>
										Add to Bag
									</button>

									<button
										className={`flex justify-center items-center bg-white border border-gray-300 text-black rounded-full py-3 my-5 w-1/2 xl:w-full xl:mb-0 ${isFavoriteLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}`}
										onClick={handleFavorite}
										disabled={isFavoriteLoading}
									>
										{user && shoe?._id && user?.favorites?.includes(shoe?._id) ? (
											<span className="inline-flex items-center">
												{' '}
												<HeartSolid className="mr-2 h-5 w-5" />
											</span>
										) : (
											<span className="inline-flex items-center">
												{' '}
												<HeartOutline className="mr-2 h-5 w-5" />
											</span>
										)}
										{shoe?.favorites?.length}
									</button>
								</div>

								<div className="my-5">{shoe?.story}</div>

								<div>
									<span className="font-bold">Brand:</span> {shoe?.brand}
								</div>

								<div>
									<span className="font-bold">Colorway:</span> {shoe?.colorway}
								</div>

								<div>
									<span className="font-bold">Gender:</span> {shoe?.gender?.toUpperCase()}
								</div>

								<div>
									<span className="font-bold">Release date:</span>{' '}
									{shoe?.releaseDate && moment(shoe.releaseDate).isValid()
										? moment(shoe.releaseDate).format('MMMM Do, YYYY')
										: 'TBA'}
								</div>

								<div>
									<span className="font-bold">SKU:</span> {shoe?.sku}
								</div>

								<div className="flex w-full my-5">
									{shoe?.links?.flightClub ? (
										<a href={shoe.links.flightClub} target="_blank" rel="noreferrer">
											<img src="/assets/flight_club.png" alt={'Flight Club'} className="w-32" />
										</a>
									) : null}

									{shoe?.links?.goat ? (
										<a href={shoe.links.goat} target="_blank" rel="noreferrer">
											<img src="/assets/goat.png" alt={'Goat'} className="w-32" />
										</a>
									) : null}

									{shoe?.links?.stadiumGoods ? (
										<a href={shoe.links.stadiumGoods} target="_blank" rel="noreferrer">
											<img
												src="/assets/stadium_goods.svg"
												alt={'Stadium Goods'}
												className="w-32"
											/>
										</a>
									) : null}

									{shoe?.links?.stockX ? (
										<a href={shoe.links.stockX} target="_blank" rel="noreferrer">
											<img src="/assets/stockx.jpeg" alt={'Stock X'} className="w-32" />
										</a>
									) : null}
								</div>
							</div>
						</div>
					)}

					{reviewLoading ? (
						<div className="flex justify-center">
							<CircleLoader size={16} />
						</div>
					) : (
						<FullShoeReviews shoe={shoe || {}} shoeRatings={(shoeRatings as any) || []} />
					)}

					<MoreShoes currentShoeId={shoeID} />
				</div>
			</div>

			<ShoppingCartModal showModal={showModal} setShowModal={setShowModal} />
		</div>
	);
};

export default FullShoePage;
