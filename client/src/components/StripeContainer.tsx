import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';
import { Redirect } from 'react-router';
import { useCart } from '../api/cartApi';
import { useCreatePaymentIntentQuery } from '../api/checkoutApi';
import CircleLoader from '../skeleton_loaders/CircleLoader';

// Initialize Stripe with publishable key (safe for frontend)
const REACT_APP_STRIPE = process.env.REACT_APP_STRIPE;
const stripePromise = loadStripe(REACT_APP_STRIPE);

interface Props {
	children: React.ReactNode;
}

const StripeContainer = ({ children }: Props) => {
	// Use unified cart hook
	const { data: cartData } = useCart();
	const currentCart = cartData;
	const total = cartData?.total || 0;

	// Use RTK Query to create payment intent - automatically cached and deduplicated
	const {
		data: paymentIntentData,
		isLoading,
		error,
	} = useCreatePaymentIntentQuery(
		{ items: currentCart?.products, total },
		{ skip: !currentCart?.products?.length } // Only call when cart has products
	);

	const clientSecret = paymentIntentData?.clientSecret || '';

	// Stripe Elements configuration
	const appearance: any = {
		theme: 'stripe', // Use Stripe's default styling theme
	};
	const options = {
		clientSecret, // Required: authorizes this frontend to collect payment
		appearance,
	};

	return isLoading ? (
		<div className="flex justify-center h-screen p-10">
			<CircleLoader size={16} />
		</div>
	) : (
		<div className="App">
			{clientSecret && !error ? (
				// Only render Stripe Elements if we have a valid client secret
				// This ensures payment form only appears for authorized payments
				<Elements options={options} stripe={stripePromise}>
					{children}
				</Elements>
			) : (
				// Redirect home if no client secret (payment intent creation failed)
				<Redirect to="/" />
			)}
		</div>
	);
};

export default StripeContainer;
