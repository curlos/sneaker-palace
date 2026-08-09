import { Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { server } from '../mocks/server';
import { makeAuthUser, makeShoe } from '../test-fixtures';
import { mockAuthUser } from '../mocks/handlers';
import { RootState } from '../redux/store';
import FullShoePage from './FullShoePage';

const API_URL = import.meta.env.VITE_API_URL;

const renderShoePage = (preloadedState?: Partial<RootState>) =>
	renderWithProviders(
		<Route path="/shoe/:shoeID">
			<FullShoePage setShowShoppingCartModal={vi.fn()} />
		</Route>,
		{ route: '/shoe/test-shoe-xyz', preloadedState }
	);

const readGuestCart = () => JSON.parse(localStorage.getItem('currentCart') || '{}');

beforeEach(() => localStorage.clear());

it("renders the shoe's name and price from the shoe detail endpoint", async () => {
	renderShoePage();

	expect(await screen.findByRole('heading', { name: 'Air Max 1' })).toBeInTheDocument();
	expect(screen.getByText('$130')).toBeInTheDocument();
});

it('opens the shopping cart modal when "Add to Bag" is clicked', async () => {
	const setShowShoppingCartModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(
		<Route path="/shoe/:shoeID">
			<FullShoePage setShowShoppingCartModal={setShowShoppingCartModal} />
		</Route>,
		{ route: '/shoe/test-shoe-xyz' }
	);
	await screen.findByRole('heading', { name: 'Air Max 1' });

	await user.click(screen.getByRole('button', { name: /add to bag/i }));

	expect(setShowShoppingCartModal).toHaveBeenCalledWith(true);
});

it('redirects to login when favoriting while logged out', async () => {
	const user = userEvent.setup();
	const { history } = renderShoePage();
	await screen.findByRole('heading', { name: 'Air Max 1' });

	await user.click(screen.getByRole('button', { name: /add to favorites/i }));

	expect(history.location.pathname).toBe('/login');
});

it('adds the product to the guest cart when "Add to Bag" is clicked', async () => {
	const user = userEvent.setup();
	renderShoePage();
	await screen.findByRole('heading', { name: 'Air Max 1' });

	await user.click(screen.getByRole('button', { name: /add to bag/i }));

	await waitFor(() => expect(readGuestCart().products).toHaveLength(1));
});

it("adds the product to the logged-in user's cart", async () => {
	let capturedBody: { products?: unknown[] } = {};
	server.use(
		http.put(`${API_URL}/cart`, async ({ request }) => {
			capturedBody = (await request.json()) as { products?: unknown[] };
			return HttpResponse.json({ _id: 'cart-1', products: capturedBody.products });
		})
	);
	const user = userEvent.setup();
	renderShoePage({ user: { currentUser: makeAuthUser(), isFetching: false, error: false } });
	await screen.findByRole('heading', { name: 'Air Max 1' });

	await user.click(screen.getByRole('button', { name: /add to bag/i }));

	// The mocked GET /cart already has 1 product, so adding one more should bring it to 2.
	await waitFor(() => expect(capturedBody.products).toHaveLength(2));
});

it('removes a review from the page after deleting it', async () => {
	// deleteRating optimistically splices the rating out of the getRatingsByShoe cache, but also
	// invalidates that same tag, triggering a refetch - so the mock has to stop returning the
	// deleted review afterwards too, or the refetch stomps the optimistic removal back (same
	// pattern as the "helpful"/"favorite" tests above).
	let deleted = false;
	const review = {
		_id: 'rating-1',
		userID: 'user-1',
		shoeID: 'test-shoe-xyz',
		ratingNum: 4,
		summary: 'Great shoe',
		text: 'Loved it',
		photo: '',
		size: 'Perfect',
		comfort: 'Perfect',
		width: 'Perfect',
		quality: 'Perfect',
		recommended: true,
		helpful: [],
		notHelpful: [],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		postedByUser: makeAuthUser(),
	};
	server.use(
		http.get(`${API_URL}/rating/by/shoe/:shoeID`, () => HttpResponse.json(deleted ? [] : [review])),
		http.delete(`${API_URL}/rating/:ratingId`, ({ params }) => {
			deleted = true;
			return HttpResponse.json({ deletedRating: { _id: params.ratingId, shoeID: 'test-shoe-xyz', userID: 'user-1' } });
		})
	);
	const user = userEvent.setup();
	renderShoePage({ user: { currentUser: makeAuthUser(), isFetching: false, error: false } });
	const deleteButton = await screen.findByRole('button', { name: /delete review/i });

	await user.click(deleteButton);

	await waitFor(() => expect(screen.queryByText('Great shoe')).not.toBeInTheDocument());
});

it('toggles the favorite state when logged in', async () => {
	// toggleFavoriteShoe invalidates the User tag, which refetches GET /users/:userId — so the
	// mock has to reflect the persisted favorite afterwards too, not just the optimistic patch,
	// or the refetch stomps the optimistic update back to the pre-toggle state.
	let favorited = false;
	server.use(
		http.get(`${API_URL}/users/:userId`, () =>
			HttpResponse.json({ ...mockAuthUser, favorites: favorited ? ['shoe-mongo-1'] : [] })
		),
		http.put(`${API_URL}/shoes/favorite/:shoeID`, () => {
			favorited = true;
			return HttpResponse.json({});
		})
	);
	const user = userEvent.setup();
	renderShoePage({ user: { currentUser: makeAuthUser(), isFetching: false, error: false } });
	await screen.findByRole('heading', { name: 'Air Max 1' });
	expect(screen.getByRole('button', { name: /add to favorites/i })).toHaveAttribute('aria-pressed', 'false');

	await user.click(screen.getByRole('button', { name: /add to favorites/i }));

	await waitFor(() =>
		expect(screen.getByRole('button', { name: /remove from favorites/i })).toHaveAttribute('aria-pressed', 'true')
	);
});

it('selects a size when its radio button is clicked', async () => {
	const user = userEvent.setup();
	renderShoePage();
	await screen.findByRole('heading', { name: 'Air Max 1' });
	expect(screen.getByRole('radio', { name: 'M 10.5 / W 12' })).toHaveAttribute('aria-checked', 'true');

	await user.click(screen.getByRole('radio', { name: 'M 9 / W 10.5' }));

	expect(screen.getByRole('radio', { name: 'M 9 / W 10.5' })).toHaveAttribute('aria-checked', 'true');
	expect(screen.getByRole('radio', { name: 'M 10.5 / W 12' })).toHaveAttribute('aria-checked', 'false');
});

it('moves size selection and focus with the ArrowRight key', async () => {
	const user = userEvent.setup();
	renderShoePage();
	await screen.findByRole('heading', { name: 'Air Max 1' });
	screen.getByRole('radio', { name: 'M 10.5 / W 12' }).focus();

	await user.keyboard('{ArrowRight}');

	const nextSize = screen.getByRole('radio', { name: 'M 11 / W 12.5' });
	expect(nextSize).toHaveFocus();
	expect(nextSize).toHaveAttribute('aria-checked', 'true');
});

it('adds the currently selected size to the guest cart', async () => {
	const user = userEvent.setup();
	renderShoePage();
	await screen.findByRole('heading', { name: 'Air Max 1' });
	await user.click(screen.getByRole('radio', { name: 'M 9 / W 10.5' }));

	await user.click(screen.getByRole('button', { name: /add to bag/i }));

	await waitFor(() => expect(readGuestCart().products[0].size).toBe('M 9 / W 10.5'));
});

it('renders a retailer link that is present and omits one that is not', async () => {
	server.use(
		http.get(`${API_URL}/shoes/:shoeID`, () =>
			HttpResponse.json(
				makeShoe({
					_id: 'shoe-mongo-1',
					shoeID: 'test-shoe-xyz',
					name: 'Air Max 1',
					retailPrice: 130,
					links: {
						stockX: 'https://stockx.com/air-max-1',
						goat: '',
						flightClub: 'https://flightclub.com/air-max-1',
						stadiumGoods: '',
					},
				})
			)
		)
	);

	renderShoePage();

	expect(await screen.findByText(/view air max 1 on stockx/i)).toBeInTheDocument();
	expect(screen.getByText(/view air max 1 on flight club/i)).toBeInTheDocument();
	expect(screen.queryByText(/view air max 1 on stadium goods/i)).not.toBeInTheDocument();
	expect(screen.queryByText(/view air max 1 on goat/i)).not.toBeInTheDocument();
});

it('shows "TBA" for the release date when the shoe has none', async () => {
	server.use(
		http.get(`${API_URL}/shoes/:shoeID`, () =>
			HttpResponse.json(
				makeShoe({ _id: 'shoe-mongo-1', shoeID: 'test-shoe-xyz', name: 'Air Max 1', retailPrice: 130, releaseDate: '' })
			)
		)
	);

	renderShoePage();

	expect(await screen.findByText('TBA')).toBeInTheDocument();
});

it('shows a static image with no rotation slider when the shoe has no 360 images', async () => {
	server.use(
		http.get(`${API_URL}/shoes/:shoeID`, () =>
			HttpResponse.json(
				makeShoe({
					_id: 'shoe-mongo-1',
					shoeID: 'test-shoe-xyz',
					name: "Air Jordan 11 Retro 'Gamma Blue' 2025",
					retailPrice: 230,
					image: {
						'360': [],
						original: 'https://image.goat.com/attachments/product_template_pictures/images/107/717/709/original/CT8012_017.png.png',
						small: '',
						thumbnail: '',
					},
				})
			)
		)
	);

	renderShoePage();

	await screen.findByRole('heading', { name: "Air Jordan 11 Retro 'Gamma Blue' 2025" });
	expect(screen.queryByLabelText(/rotate .* image/i)).not.toBeInTheDocument();
});

it('shows a rotation slider when the shoe has 360 images', async () => {
	server.use(
		http.get(`${API_URL}/shoes/:shoeID`, () =>
			HttpResponse.json(
				makeShoe({
					_id: 'shoe-mongo-1',
					shoeID: 'test-shoe-xyz',
					name: 'Nike LeBron 8 South Beach (2021)',
					retailPrice: 200,
					image: {
						'360': [
							'https://images.stockx.com/360/Nike-LeBron-8-South-Beach-2021/Images/Nike-LeBron-8-South-Beach-2021/Lv2/img01.jpg',
							'https://images.stockx.com/360/Nike-LeBron-8-South-Beach-2021/Images/Nike-LeBron-8-South-Beach-2021/Lv2/img02.jpg',
						],
						original: 'https://image.goat.com/attachments/product_template_pictures/images/054/966/981/original/694880_00.png.png',
						small: '',
						thumbnail: '',
					},
				})
			)
		)
	);

	renderShoePage();

	await screen.findByRole('heading', { name: 'Nike LeBron 8 South Beach (2021)' });
	expect(screen.getByLabelText(/rotate .* image/i)).toBeInTheDocument();
});
