import { CheckIcon, XIcon } from '@heroicons/react/outline';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetShoeQuery } from '../api/shoesApi';
import { useCart } from '../api/cartApi';
import { useModalA11y } from '../hooks/useModalA11y';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import ShoeImage from './ShoeImage';
import { IProduct } from '../types/types';

interface Props {
	showModal: boolean;
	setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ShoppingCartModal = ({ showModal, setShowModal }: Props) => {
	// Use unified cart hook
	const { data: cartData } = useCart();
	const cartProducts = cartData?.products || [];

	const [productInfo, setProductInfo] = useState<IProduct>();

	// Get the last product added to cart
	const lastProduct = cartProducts[cartProducts.length - 1];

	// Use RTK Query to fetch shoe data
	const { data: shoe, isLoading: loading } = useGetShoeQuery(lastProduct?.productID || '', {
		skip: !lastProduct?.productID,
	});

	// Update product info when cart changes
	useEffect(() => {
		if (lastProduct) {
			setProductInfo(lastProduct);
		}
	}, [lastProduct]);

	const handleBubblingDownClick = (e: React.FormEvent) => {
		e.stopPropagation();
	};

	const dialogRef = useModalA11y<HTMLElement>(() => setShowModal(false));

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<div
			className="fixed z-20 max-w-100 w-screen h-screen bg-black bg-opacity-40"
			onClick={() => setShowModal(!showModal)}
		>
			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions */}
			<aside
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-label="Added to cart"
				className={`transform z-30 top-0 right-0 w-96 bg-white text-black fixed h-full overflow-y-scroll sm:no-scrollbar ease-in-out transition-all duration-1000 ${showModal ? 'translate-x-0' : 'translate-x-full'} sm:w-10/12`}
				onClick={handleBubblingDownClick}
			>
				<div className="p-5">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<CheckIcon className="h-4 w-4 bg-green-500 rounded-full text-white" aria-hidden="true" />
							<div>Added to cart</div>
						</div>

						<button type="button" aria-label="Close" onClick={() => setShowModal(false)}>
							<XIcon className="h-5 w-5 cursor-pointer" aria-hidden="true" />
						</button>
					</div>

					{loading ? (
						<div className="p-5 flex justify-center">
							<CircleLoader size={16} />
						</div>
					) : (
						shoe &&
						productInfo && (
							<div className="">
								<div>
									<ShoeImage src={shoe.image?.original || ''} alt={shoe.name || ''} />
								</div>

								<div className="">
									<div>{shoe.name}</div>
									<div className="text-gray-600 capitalize">{shoe.gender}'s Shoe</div>
									<div className="text-gray-600">Size {productInfo.size}</div>
									<div>${shoe.retailPrice}</div>
								</div>
							</div>
						)
					)}

					<div className="my-3">
						<Link to={`/cart`} onClick={() => setShowModal(false)}>
							<button className="rounded-full border border-gray-400 w-full p-3">
								View Bag ({cartProducts.length})
							</button>
						</Link>
					</div>

					<div>
						<Link to={`/payment`} onClick={() => setShowModal(false)}>
							<button className="bg-black text-white rounded-full w-full p-3">Checkout</button>
						</Link>
					</div>
				</div>
			</aside>
		</div>
	);
};

export default ShoppingCartModal;
