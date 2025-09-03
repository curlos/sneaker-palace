import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../api/cartApi';
import CartProduct from '../components/CartProduct';
import { IProduct } from '../types/types';

const Cart = () => {
	// Unified cart hook - handles both logged-in and guest users
	const { data: cartData } = useCart();

	const cartProducts = cartData?.products || [];
	const cartTotal = cartData?.total || 0;

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<div className="container mx-auto px-4 py-6 max-w-6xl flex flex-start flex-grow sm:block ">
			<div className="flex-6">
				<div className="font-medium text-xl mb-5">Bag</div>
				{cartProducts.map((product: IProduct, index: number) => (
					<CartProduct 
						key={product._id} 
						productInfo={product} 
						isLast={index === cartProducts.length - 1}
					/>
				))}
			</div>

			<div className="flex-2 pl-7 sm:pl-0">
				<div className="font-medium text-xl mb-5">Summary</div>
				<div className="flex justify-between items-center mb-2">
					<div>Subtotal</div>
					<div>${cartTotal}.00</div>
				</div>

				<div className="flex justify-between items-center mb-2">
					<div>Estimated Shipping & Handling</div>
					<div>$0.00</div>
				</div>

				<div className="flex justify-between items-center mb-2">
					<div>Estimated Tax</div>
					<div>-</div>
				</div>

				<div className="border-0 border-b border-solid border-gray-300 my-3"></div>
				<div className="flex justify-between items-center">
					<div>Total</div>
					<div>${cartTotal}.00</div>
				</div>
				<div className="border-0 border-b border-solid border-gray-300 my-3"></div>

				<Link
					to={'/payment'}
					className="bg-black text-white my-4 w-full py-4 px-9 rounded-full hover:bg-gray-900 text-center block"
				>
					Checkout
				</Link>
			</div>
		</div>
	);
};

export default Cart;
