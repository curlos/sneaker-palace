import { http, HttpResponse } from 'msw';
import { Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test-utils';
import { server } from '../mocks/server';
import { mockAuthUser } from '../mocks/handlers';
import { makeShoe } from '../test-fixtures';
import { DEFAULT_AVATAR } from '../utils/userConstants';
import Profile from './Profile';

const API_URL = import.meta.env.VITE_API_URL;

const renderProfile = () =>
	renderWithProviders(
		<Route path="/profile/:userID">
			<Profile />
		</Route>,
		{ route: `/profile/${mockAuthUser._id}` }
	);

const mockReview = {
	_id: 'rating-1',
	userID: mockAuthUser._id,
	shoeID: 'air-max-1',
	ratingNum: 5,
	summary: 'Best shoe ever',
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
};

it('shows "No reviews found." when the user has no reviews or favorites', async () => {
	renderProfile();

	expect(await screen.findByText('No reviews found.')).toBeInTheDocument();
});

it("shows a review's summary when the user has reviews", async () => {
	server.use(http.get(`${API_URL}/rating/by/user/:userID`, () => HttpResponse.json([mockReview])));

	renderProfile();

	expect(await screen.findByText('Best shoe ever')).toBeInTheDocument();
});

it('auto-selects the Favorites tab when the user has favorites but no reviews', async () => {
	server.use(
		http.get(`${API_URL}/users/:userId`, () => HttpResponse.json({ ...mockAuthUser, favorites: ['fav-shoe-1'] })),
		http.post(`${API_URL}/shoes/bulk`, () => HttpResponse.json([makeShoe({ _id: 'fav-shoe-1', name: 'Air Force 1' })]))
	);

	renderProfile();

	expect(await screen.findByText('Air Force 1')).toBeInTheDocument();
});

it('switches to the Favorites tab when it is clicked manually', async () => {
	server.use(
		http.get(`${API_URL}/users/:userId`, () => HttpResponse.json({ ...mockAuthUser, favorites: ['fav-shoe-1'] })),
		http.post(`${API_URL}/shoes/bulk`, () => HttpResponse.json([makeShoe({ _id: 'fav-shoe-1', name: 'Air Force 1' })]))
	);
	// Give the user a review too, so the default/auto-selected tab is Reviews, not Favorites —
	// isolating the manual-click switch from the auto-select-on-load behavior above.
	server.use(http.get(`${API_URL}/rating/by/user/:userID`, () => HttpResponse.json([mockReview])));
	const user = userEvent.setup();
	renderProfile();
	await screen.findByText('Best shoe ever');

	await user.click(screen.getByRole('tab', { name: /favorites/i }));

	expect(await screen.findByText('Air Force 1')).toBeInTheDocument();
});

it('shows "No shoes in favorites." when the Favorites tab has no favorites', async () => {
	// Give the user a review so the default tab is Reviews, not the auto-selected Favorites tab.
	server.use(http.get(`${API_URL}/rating/by/user/:userID`, () => HttpResponse.json([mockReview])));
	const user = userEvent.setup();
	renderProfile();
	await screen.findByText('Best shoe ever');

	await user.click(screen.getByRole('tab', { name: /favorites/i }));

	expect(await screen.findByText('No shoes in favorites.')).toBeInTheDocument();
});

it('shows the helpful votes, unhelpful votes, review, and favorites counts in Insights', async () => {
	server.use(
		http.get(`${API_URL}/users/:userId`, () =>
			HttpResponse.json({ ...mockAuthUser, helpful: ['h1', 'h2'], notHelpful: ['n1'], favorites: ['fav-shoe-1'] })
		),
		http.get(`${API_URL}/rating/by/user/:userID`, () => HttpResponse.json([mockReview])),
		http.post(`${API_URL}/shoes/bulk`, () => HttpResponse.json([makeShoe({ _id: 'fav-shoe-1', name: 'Air Force 1' })]))
	);

	renderProfile();
	await screen.findByText('Best shoe ever');

	expect(screen.getByText('Helpful votes').previousSibling).toHaveTextContent('2');
	expect(screen.getByText('Unhelpful votes').previousSibling).toHaveTextContent('1');
	expect(screen.getByText('Reviews', { selector: 'div' }).previousSibling).toHaveTextContent('1');
	expect(screen.getByText('Favorites', { selector: 'div' }).previousSibling).toHaveTextContent('1');
});

it('renders the formatted join date', async () => {
	server.use(
		http.get(`${API_URL}/users/:userId`, () => HttpResponse.json({ ...mockAuthUser, createdAt: '2023-05-15T12:00:00.000Z' }))
	);

	renderProfile();

	expect(await screen.findByText('Joined May 15, 2023')).toBeInTheDocument();
});

it('falls back to the default avatar when the user has no profile picture', async () => {
	renderProfile();

	expect(await screen.findByAltText('')).toHaveAttribute('src', DEFAULT_AVATAR);
});

it('moves tab focus and selection with the right arrow key', async () => {
	const user = userEvent.setup();
	renderProfile();
	await screen.findByText('No reviews found.');

	screen.getByRole('tab', { name: /reviews/i }).focus();
	await user.keyboard('{ArrowRight}');

	const favoritesTab = screen.getByRole('tab', { name: /favorites/i });
	expect(favoritesTab).toHaveFocus();
	expect(favoritesTab).toHaveAttribute('aria-selected', 'true');
});

it('paginates favorites when there are more than one page of results', async () => {
	Element.prototype.scrollIntoView = vi.fn();
	const favorites = Array.from({ length: 13 }, (_, i) => `fav-shoe-${i + 1}`);
	const favoriteShoes = favorites.map((id, i) => makeShoe({ _id: id, name: `Favorite Shoe ${i + 1}` }));
	server.use(
		http.get(`${API_URL}/users/:userId`, () => HttpResponse.json({ ...mockAuthUser, favorites })),
		http.post(`${API_URL}/shoes/bulk`, () => HttpResponse.json(favoriteShoes))
	);
	const user = userEvent.setup();
	renderProfile();
	await screen.findByText('Favorite Shoe 1');
	expect(screen.queryByText('Favorite Shoe 13')).not.toBeInTheDocument();

	await user.click(screen.getByRole('button', { name: /^next page$/i }));

	expect(await screen.findByText('Favorite Shoe 13')).toBeInTheDocument();
});
