import { loadStripe } from '@stripe/stripe-js';

// Shared singleton so loadStripe() (which injects Stripe.js's script tag) only runs once
// across the whole app, regardless of how many components need Stripe Elements context.
const VITE_STRIPE = import.meta.env.VITE_STRIPE;

export const stripePromise = loadStripe(VITE_STRIPE);
