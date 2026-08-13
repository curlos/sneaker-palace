import { useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useCart, useUpdateGuestCartMutation, useUpdateUserCartMutation } from '../api/cartApi';
import { useCreateUserOrderMutation, useCreateGuestOrderMutation } from '../api/ordersApi';
import { RootState } from '../redux/store';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import { useGetLoggedInUserQuery } from '../api/userApi';
import { CreateOrderPayload } from '../types/types';

interface PaymentInfo {
	paymentMethod?: {
		card?: unknown;
		billing_details?: unknown;
	};
	paymentIntentID?: string;
}

const PaymentSuccess = () => {
	const userId = useSelector((s: RootState) => s.user.currentUser?._id);
	const { data: user } = useGetLoggedInUserQuery(userId);

	// Use unified cart hook
	const { data: cartData, isLoading: cartLoading } = useCart();
	const currentCart = cartData;
	const total = cartData?.total || 0;

	// Cart mutations for clearing cart after payment
	const [updateGuestCart] = useUpdateGuestCartMutation();
	const [updateUserCart] = useUpdateUserCartMutation();

	// Order mutations
	const [createUserOrder] = useCreateUserOrderMutation();
	const [createGuestOrder] = useCreateGuestOrderMutation();

	// Starts already-resolved when there's no payment intent to look up (e.g. landing here
	// directly) - nothing will ever set it false otherwise.
	const [loading, setLoading] = useState(
		() => !!new URLSearchParams(window.location.search).get('payment_intent_client_secret')
	);
	const [orderID, setOrderID] = useState('');
	const [orderFailed, setOrderFailed] = useState(false);

	const stripe = useStripe();
	const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({});

	useEffect(() => {
		window.scrollTo(0, 0);
		const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
		let cancelled = false;

		if (stripe && clientSecret) {
			stripe.retrievePaymentIntent(clientSecret).then((paymentIntent) => {
				if (cancelled) return;
				if (paymentIntent && paymentIntent.paymentIntent) {
					axios
						.get(
							`${import.meta.env.VITE_API_URL}/checkout/payment-method/${paymentIntent.paymentIntent.payment_method}`
						)
						.then((result) => {
							if (cancelled) return;
							setPaymentInfo({
								paymentMethod: result.data,
								paymentIntentID: paymentIntent.paymentIntent.id,
							});
						});
				}
			});
		}

		return () => {
			cancelled = true;
		};
	}, [stripe]);

	useEffect(() => {
		const { paymentMethod, paymentIntentID } = paymentInfo;
		let cancelled = false;

		if (paymentMethod && paymentIntentID && paymentMethod.card && paymentMethod.billing_details) {
			const addToOrders = async () => {
				if (currentCart && currentCart.products && currentCart.products.length > 0) {
					const body: CreateOrderPayload = {
						products: [...currentCart.products],
						amount: total,
						card: paymentMethod.card as CreateOrderPayload['card'],
						billingDetails: paymentMethod.billing_details as CreateOrderPayload['billingDetails'],
						paymentIntentID: paymentIntentID as string,
						orderDate: new Date().toISOString(),
						deliveryDate: new Date(moment().add(2, 'days').format('ddd, MMM D').toUpperCase()).toString(),
						userID: user?._id as string, // Add userID for cache invalidation
					};

					if (user?._id) {
						// Only create order if there are products in cart
						if (currentCart.products.length > 0) {
							try {
								const response = await createUserOrder(body).unwrap();

								if (response && response.error) {
									if (!cancelled) setOrderID(response.orderID || '');
								} else if (response.order) {
									const { order } = response;

									if (!cancelled) setOrderID(order._id);

									// Clear the user's cart after successful payment
									if (currentCart?._id) {
										try {
											await updateUserCart({
												products: [],
											}).unwrap();
										} catch (error) {
											console.error('Failed to clear user cart after payment:', error);
										}
									}
								}
							} catch (err) {
								console.log(err);
								if (!cancelled) setOrderFailed(true);
							}
						}
					} else {
						// Only create order if there are products in cart
						if (currentCart.products.length > 0) {
							try {
								const response = await createGuestOrder(body).unwrap();

								if (response && response.error) {
									if (!cancelled) setOrderID(response.orderID || '');
								} else if (response.order) {
									const { order } = response;

									if (!cancelled) setOrderID(order._id);
									// Clear guest cart on successful order using RTK Query
									await updateGuestCart({ products: [], total: 0 });
								}
							} catch (err) {
								console.log(err);
								if (!cancelled) setOrderFailed(true);
							}
						}
					}

					if (!cancelled) setLoading(false);
				} else if (!cartLoading) {
					// Cart has finished loading and is genuinely empty - nothing to order, stop waiting.
					if (!cancelled) setLoading(false);
				}
			};
			addToOrders();
		}

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentCart, paymentInfo, total, user?._id, cartLoading]);

	return loading ? (
		<div className="flex justify-center h-screen p-10">
			<CircleLoader size={16} />
		</div>
	) : (
		<div className="container mx-auto px-4 py-7 max-w-6xl flex-grow">
			<div className="text-lg">
				{user ? (
					<h1 className="text-4xl">Hello {user.firstName},</h1>
				) : (
					<h1 className="text-4xl">Hello Guest,</h1>
				)}
				{orderFailed ? (
					<div role="alert">
						Payment succeeded, but we couldn't confirm your order. Please contact support.
					</div>
				) : (
					<div>Your order has been placed successfully.</div>
				)}

				<div className="flex gap-3 mt-3 max-sm:flex-col">
					<Link to="/shoes" className="bg-black p-4 text-white rounded-full text-center">
						Continue Shopping
					</Link>
					{!orderFailed && (
						<Link
							to={`/order-details/${orderID}`}
							className="bg-white p-4 text-black border border-black rounded-full text-center"
						>
							View or manage order
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};

export default PaymentSuccess;
