import {
  PaymentElement, useElements, useStripe
} from "@stripe/react-stripe-js"
import moment from "moment"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import CheckoutProduct from "../components/CheckoutProduct"
import { RootState } from "../redux/store"
import CircleLoader from "../skeleton_loaders/CircleLoader"

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const { currentCart, total } = useSelector((state: RootState) => state.cart)

  const [message, setMessage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent) {
        switch (paymentIntent.status) {
          case "succeeded":
            setMessage("Payment succeeded!");
            break;
          case "processing":
            setMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setMessage("Your payment was not successful, please try again.");
            break;
          default:
            setMessage("Something went wrong.");
            break;
        }
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${process.env.REACT_APP_CLIENT_URL}/payment-success`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occured.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="container mx-auto px-4 py-10 max-w-6xl flex gap-4 sm:block flex-grow">
      <div className="flex-6">
        <PaymentElement id="payment-element" />
        <button disabled={isLoading || !stripe || !elements} id="submit" className="bg-black text-white p-3 rounded-lg mt-4 hover:bg-gray-700">
          <span id="button-text">
            {isLoading ? <div className="flex justify-center"><CircleLoader size={5} /></div> : "Pay now"}
          </span>
        </button>
        {/* Show any error or success messages */}
        {message && <div id="payment-message">{message}</div>}
      </div>

      <div className="flex-4 border border-gray-300 rounded-lg sm:my-4">
        <div className="p-5 bg-gray-200 font-bold rounded-t-lg">IN YOUR CART</div>
        <div className="border-0 border-b border-solid border-gray-300 p-5 text-sm">
          <div className="flex justify-between mb-1">
            <div>Subtotal</div>
            <div>${total}.00</div>
          </div>

          <div className="flex justify-between mb-1">
            <div>Estimated Shipping</div>
            <div>$0.00</div>
          </div>

          <div className="flex justify-between mb-3">
            <div>Estimated Tax</div>
            <div>$0.00</div>
          </div>

          <div className="flex justify-between">
            <div className="font-bold">TOTAL</div>
            <div>${total}.00</div>
          </div>
        </div>

        <div className="p-5">
          <div className="font-bold mb-4">ARRIVES BY {moment().add(2, 'days').format("ddd, MMM D").toUpperCase()}</div>

          <div className="">
            {currentCart.products?.map((product) => <CheckoutProduct key={product._id} product={product} type="small" />)}
          </div>
        </div>
      </div>
    </form>
  );
}