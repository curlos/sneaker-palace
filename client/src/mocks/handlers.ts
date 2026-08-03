import { http, HttpResponse } from 'msw';
import { makeAuthUser, makeShoe } from '../test-fixtures';

const API_URL = import.meta.env.VITE_API_URL;

export const mockAuthUser = makeAuthUser();

export const mockShoes = [
	makeShoe({ shoeID: 'air-max-1', name: 'Air Max 1', retailPrice: 130 }),
	makeShoe({ shoeID: 'air-force-1', name: 'Air Force 1', retailPrice: 110 }),
];

export const handlers = [
	http.post(`${API_URL}/auth/login`, async ({ request }) => {
		const body = (await request.json()) as { email: string; password: string };

		if (body.email === mockAuthUser.email && body.password === 'correct-password') {
			return HttpResponse.json(mockAuthUser);
		}

		return HttpResponse.json('Wrong credentials', { status: 401 });
	}),

	http.post(`${API_URL}/auth/register`, async ({ request }) => {
		const body = (await request.json()) as { email: string };

		if (body.email === 'taken@example.com') {
			return HttpResponse.json({ error: 'Email taken' }, { status: 400 });
		}

		return HttpResponse.json({ _id: 'new-user' }, { status: 201 });
	}),

	http.get(`${API_URL}/cart`, () =>
		HttpResponse.json({
			_id: 'cart-1',
			userID: mockAuthUser._id,
			products: [{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 }],
			createdAt: '',
			updatedAt: '',
		})
	),

	http.put(`${API_URL}/cart`, async ({ request }) => {
		const body = (await request.json()) as { products: unknown[] };
		return HttpResponse.json({ _id: 'cart-1', userID: mockAuthUser._id, products: body.products });
	}),

	http.get(`${API_URL}/checkout/payment-method/:paymentMethodId`, () =>
		HttpResponse.json({ card: { last4: '4242' }, billing_details: { name: 'Test User' } })
	),

	http.post(`${API_URL}/orders/no-account`, () => HttpResponse.json({ order: { _id: 'order-guest-1' } })),

	http.post(`${API_URL}/orders`, () => HttpResponse.json({ order: { _id: 'order-user-1' } })),

	http.get(`${API_URL}/users/:userId`, () => HttpResponse.json(mockAuthUser)),

	http.post(`${API_URL}/shoes`, () => HttpResponse.json({ docs: mockShoes, totalDocs: mockShoes.length })),

	http.get(`${API_URL}/shoes/:shoeID`, ({ params }) =>
		HttpResponse.json(
			makeShoe({ _id: 'shoe-mongo-1', shoeID: params.shoeID as string, name: 'Air Max 1', retailPrice: 130 })
		)
	),

	http.put(`${API_URL}/shoes/favorite/:shoeID`, () => HttpResponse.json({})),

	// MoreShoes fetches a random page as a fallback while its parent shoe is still loading
	// (or when the search-based results come up empty), so the page number is unpredictable.
	http.get(`${API_URL}/shoes/page/:pageNum`, () => HttpResponse.json({ docs: mockShoes, totalDocs: mockShoes.length })),

	http.get(`${API_URL}/rating/by/shoe/:shoeID`, () => HttpResponse.json([])),

	http.get(`${API_URL}/rating/:ratingId`, ({ params }) =>
		HttpResponse.json({
			_id: params.ratingId,
			userID: mockAuthUser._id,
			shoeID: 'air-max-1',
			ratingNum: 4,
			summary: 'Great shoe',
			text: 'Loved it',
			photo: '',
			size: 'Perfect',
			comfort: 'Comfortable',
			width: 'Perfect',
			quality: 'Pretty great',
			recommended: true,
			helpful: [],
			notHelpful: [],
			createdAt: '',
			updatedAt: '',
			postedByUser: mockAuthUser,
		})
	),

	http.post(`${API_URL}/rating/rate`, () => HttpResponse.json({ rating: { _id: 'new-rating-1' } })),

	http.put(`${API_URL}/rating/edit/:ratingId`, () => HttpResponse.json({ _id: 'edited-rating-1' })),

	http.delete(`${API_URL}/rating/:ratingId`, ({ params }) =>
		HttpResponse.json({ deletedRating: { _id: params.ratingId } })
	),

	http.get(`${API_URL}/rating/by/user/:userID`, () => HttpResponse.json([])),

	http.put(`${API_URL}/rating/like`, () => HttpResponse.json({})),

	http.put(`${API_URL}/rating/dislike`, () => HttpResponse.json({})),

	http.post(`${API_URL}/shoes/bulk`, () => HttpResponse.json([])),

	http.put(`${API_URL}/users`, async ({ request }) => {
		const body = (await request.json()) as object;
		return HttpResponse.json({ ...mockAuthUser, ...body });
	}),

	http.put(`${API_URL}/users/password`, () => HttpResponse.json(mockAuthUser)),

	http.get(`${API_URL}/orders/user`, () =>
		HttpResponse.json([
			{
				_id: 'order-1',
				userID: mockAuthUser._id,
				amount: 130,
				orderDate: new Date().toString(),
				createdAt: new Date().toISOString(),
				products: [{ _id: 'p1', productID: 'air-max-1', size: '10', quantity: 1, retailPrice: 130 }],
				card: { brand: 'visa', last4: '4242' },
				billingDetails: { address: { city: '', country: 'US', line1: '', line2: '', postal_code: '10001', state: '' } },
			},
		])
	),

	http.get(`${API_URL}/orders/:orderId`, ({ params }) =>
		HttpResponse.json({
			_id: params.orderId,
			userID: mockAuthUser._id,
			amount: 130,
			orderDate: new Date().toString(),
			createdAt: new Date().toISOString(),
			products: [{ _id: 'p1', productID: 'air-max-1', size: '10', quantity: 1, retailPrice: 130 }],
			card: { brand: 'visa', last4: '4242' },
			billingDetails: { address: { city: '', country: 'US', line1: '', line2: '', postal_code: '10001', state: '' } },
		})
	),
];
