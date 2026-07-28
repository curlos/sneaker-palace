import { ChangeEvent } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetShoeQuery } from '../api/shoesApi';
import { useCart, useUpdateUserCartMutation, useUpdateGuestCartMutation } from '../api/cartApi';
import { RootState } from '../redux/store';
import CartProductSkeleton from '../skeleton_loaders/CartProductSkeleton';
import ShoeImage from './ShoeImage';
import { IProduct } from '../types/types';
import { useGetLoggedInUserQuery } from '../api/userApi';
import { SHOE_SIZES } from '../utils/shoeConstants';

const QUANTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface Props {
	productInfo: IProduct;
	isLast?: boolean;
}

const CartProduct = ({ productInfo, isLast = false }: Props) => {
	const userId = useSelector((s: RootState) => s.user.currentUser?._id);
	const { data: user } = useGetLoggedInUserQuery(userId);

	// RTK Query hooks
	const { data: shoe, isLoading: loading } = useGetShoeQuery(productInfo.productID);
	const { data: cartData } = useCart();
	const [updateUserCart] = useUpdateUserCartMutation();
	const [updateGuestCart] = useUpdateGuestCartMutation();

	const handleChangeSize = async (e: ChangeEvent<HTMLSelectElement>) => {
		const newSize = e.currentTarget.value;

		if (!cartData?.products) return;

		// Update products array with new size
		const updatedProducts = cartData.products.map((product: IProduct) =>
			product._id === productInfo._id ? { ...product, size: newSize } : product
		);

		if (user?._id && cartData._id) {
			// Logged in user - use updateUserCart with full products array
			try {
				await updateUserCart({
					products: updatedProducts,
				}).unwrap();
			} catch (error) {
				console.error('Failed to update cart size:', error);
			}
		} else {
			// Guest user - use updateGuestCart
			try {
				await updateGuestCart({
					...cartData,
					products: updatedProducts,
					updatedAt: new Date().toISOString(),
				}).unwrap();
			} catch (error) {
				console.error('Failed to update guest cart size:', error);
			}
		}
	};

	const handleChangeQuantity = async (e: ChangeEvent<HTMLSelectElement>) => {
		const newQuantity = Number(e.currentTarget.value);

		if (!cartData?.products) return;

		// Update products array with new quantity
		const updatedProducts = cartData.products.map((product: IProduct) =>
			product._id === productInfo._id ? { ...product, quantity: newQuantity } : product
		);

		if (user?._id && cartData._id) {
			// Logged in user - use updateUserCart with full products array
			try {
				await updateUserCart({
					products: updatedProducts,
				}).unwrap();
			} catch (error) {
				console.error('Failed to update cart quantity:', error);
			}
		} else {
			// Guest user - use updateGuestCart
			try {
				await updateGuestCart({
					...cartData,
					products: updatedProducts,
					updatedAt: new Date().toISOString(),
				}).unwrap();
			} catch (error) {
				console.error('Failed to update guest cart quantity:', error);
			}
		}
	};

	const handleRemoveProduct = async () => {
		if (!cartData?.products) return;

		// Filter out the product to remove
		const updatedProducts = cartData.products.filter((product: IProduct) => product._id !== productInfo._id);

		if (user?._id && cartData._id) {
			// Logged in user - use updateUserCart with filtered products array
			try {
				await updateUserCart({
					products: updatedProducts,
				}).unwrap();
			} catch (error) {
				console.error('Failed to remove from cart:', error);
			}
		} else {
			// Guest user - use updateGuestCart
			try {
				await updateGuestCart({
					...cartData,
					products: updatedProducts,
					updatedAt: new Date().toISOString(),
				}).unwrap();
			} catch (error) {
				console.error('Failed to remove from guest cart:', error);
			}
		}
	};

	return loading ? (
		<CartProductSkeleton />
	) : (
		<div className={`flex py-5 mb-5 ${!isLast ? 'border-0 border-b border-solid border-gray-300' : ''}`}>
			<Link to={`/shoe/${shoe.shoeID}`} className="max-sm:w-1/4">
				<ShoeImage src={shoe?.image?.thumbnail || ''} alt={shoe?.name || ''} className="cart-shoe-image" />
			</Link>

			<div className="ml-5 w-full max-sm:ml-2">
				<div>
					<div className="flex justify-between gap-4">
						<Link to={`/shoe/${shoe.shoeID}`}>
							<span className="font-medium hover:underline">{shoe?.name}</span>
						</Link>
						<span>${Number(shoe?.retailPrice) * productInfo?.quantity}.00</span>
					</div>
					<div className="text-gray-500">
						<span className="capitalize">{shoe?.gender}</span>'s Shoes
					</div>
					<div className="text-gray-500 max-sm:hidden">{shoe?.colorway}</div>
					<div>
						<span className="max-sm:block">
							<label htmlFor={`size-${productInfo._id}`} className="mr-2 text-gray-500 max-sm:mr-1">Size</label>
							<select
								id={`size-${productInfo._id}`}
								name="shoeSizes"
								className="border-none rounded-lg text-gray-500 max-sm:pr-10 max-sm:py-0"
								value={productInfo.size}
								onChange={handleChangeSize}
							>
								{SHOE_SIZES.map((shoeSize) => (
									<option key={shoeSize} value={shoeSize}>
										{shoeSize}
									</option>
								))}
							</select>
						</span>

						<span className="max-sm:block">
							<label htmlFor={`quantity-${productInfo._id}`} className="mx-2 text-gray-500 max-sm:mx-0 max-sm:mr-1">Quantity</label>

							<select
								id={`quantity-${productInfo._id}`}
								name="quantities"
								className="border-none rounded-lg text-gray-500 max-sm:pr-10 max-sm:py-0"
								value={productInfo.quantity}
								onChange={handleChangeQuantity}
							>
								{QUANTITIES.map((quantity) => (
									<option key={quantity} value={quantity}>
										{quantity}
									</option>
								))}
							</select>
						</span>
					</div>
				</div>

				<div className="">
					<button type="button" className="text-gray-500 mr-5 underline cursor-pointer" onClick={handleRemoveProduct}>
						Remove
					</button>
				</div>
			</div>
		</div>
	);
};

export default CartProduct;
