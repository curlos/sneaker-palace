import { Elements } from '@stripe/react-stripe-js';
import React from 'react';
import { stripePromise } from '../utils/stripePromise';

interface Props {
	children: React.ReactNode;
}

// Provides Stripe Elements context for pages that need useStripe()/useElements() but
// don't render a payment form and don't need a specific clientSecret — e.g. the payment
// success page, which only retrieves an existing PaymentIntent using the client secret
// already present in the URL. Unlike StripeContainer, this doesn't create a new
// PaymentIntent and doesn't depend on the cart having items (which it normally won't,
// right after a successful purchase clears it).
const StripeElementsProvider = ({ children }: Props) => {
	return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeElementsProvider;
