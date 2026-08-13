import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { server } from '../mocks/server';
import { mockAuthUser } from '../mocks/handlers';
import { makeAuthUser } from '../test-fixtures';
import FullShoeReviews from './FullShoeReviews';

const API_URL = import.meta.env.VITE_API_URL;

const shoe = { shoeID: 'air-max-1', rating: 0 };

it('shows "No reviews" when the shoe has no ratings', () => {
	renderWithProviders(<FullShoeReviews shoe={shoe} shoeRatings={[]} />);

	expect(screen.getByText('No reviews')).toBeInTheDocument();
});

const makeReview = (overrides: { _id: string; summary: string; createdAt: string }) => ({
	userID: 'user-2',
	shoeID: 'air-max-1',
	ratingNum: 4,
	text: 'Loved it',
	photo: '',
	size: 'Perfect',
	comfort: 'Perfect',
	width: 'Perfect',
	quality: 'Perfect',
	recommended: true,
	helpful: [],
	notHelpful: [],
	updatedAt: new Date().toISOString(),
	postedByUser: makeAuthUser({ _id: 'user-2', firstName: 'Jane' }),
	...overrides,
});

it('paginates when there are more than 5 reviews', async () => {
	const shoeRatings = Array.from({ length: 6 }, (_, i) =>
		makeReview({
			_id: `rating-${i}`,
			summary: `Review number ${i}`,
			createdAt: new Date(2024, 0, i + 1).toISOString(),
		})
	);

	renderWithProviders(<FullShoeReviews shoe={shoe} shoeRatings={shoeRatings} />);

	// Sorted newest-first, so the 6th (index 5, most recent) review is on page 1 and the
	// oldest (index 0) is pushed to page 2.
	expect(await screen.findByText('Review number 5')).toBeInTheDocument();
	expect(screen.queryByText('Review number 0')).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
});

it('marks a review as helpful when a logged-in user clicks "Mark as helpful"', async () => {
	// likeRating invalidates the User tag, which refetches getLoggedInUser — so the mock has to
	// reflect the persisted "helpful" list afterwards too, or the refetch stomps the optimistic
	// update back to the pre-click state (see the same pattern in FullShoePage.test.tsx).
	let liked = false;
	server.use(
		http.get(`${API_URL}/users/:userId`, () =>
			HttpResponse.json({ ...mockAuthUser, helpful: liked ? ['rating-1'] : [] })
		),
		http.put(`${API_URL}/rating/like`, () => {
			liked = true;
			return HttpResponse.json({});
		})
	);
	const shoeRatings = [makeReview({ _id: 'rating-1', summary: 'Great shoe', createdAt: new Date().toISOString() })];
	const user = userEvent.setup();
	renderWithProviders(<FullShoeReviews shoe={shoe} shoeRatings={shoeRatings} />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

	await screen.findByText('Great shoe');

	// findByText only proves the review rendered from props - the click handler also depends on
	// useGetLoggedInUserQuery resolving (it treats an unresolved user as a guest and redirects
	// instead of liking), so the click is retried inside waitFor until that's settled too.
	await waitFor(async () => {
		await user.click(screen.getByRole('button', { name: /mark as helpful/i }));
		expect(screen.getByRole('button', { name: /mark as helpful/i })).toHaveAttribute('aria-pressed', 'true');
	});
});

it('redirects a guest user to /login instead of liking a rating', async () => {
	const shoeRatings = [makeReview({ _id: 'rating-1', summary: 'Great shoe', createdAt: new Date().toISOString() })];
	const user = userEvent.setup();
	const { history } = renderWithProviders(<FullShoeReviews shoe={shoe} shoeRatings={shoeRatings} />);
	await screen.findByText('Great shoe');

	await user.click(screen.getByRole('button', { name: /mark as helpful/i }));

	expect(history.location.pathname).toBe('/login');
});

it('marks a review as not helpful when a logged-in user clicks "Mark as not helpful"', async () => {
	let disliked = false;
	server.use(
		http.get(`${API_URL}/users/:userId`, () =>
			HttpResponse.json({ ...mockAuthUser, notHelpful: disliked ? ['rating-1'] : [] })
		),
		http.put(`${API_URL}/rating/dislike`, () => {
			disliked = true;
			return HttpResponse.json({});
		})
	);
	const shoeRatings = [makeReview({ _id: 'rating-1', summary: 'Great shoe', createdAt: new Date().toISOString() })];
	const user = userEvent.setup();
	renderWithProviders(<FullShoeReviews shoe={shoe} shoeRatings={shoeRatings} />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await screen.findByText('Great shoe');

	// See the comment on the "Mark as helpful" test above - same reasoning applies to dislike.
	await waitFor(async () => {
		await user.click(screen.getByRole('button', { name: /mark as not helpful/i }));
		expect(screen.getByRole('button', { name: /mark as not helpful/i })).toHaveAttribute('aria-pressed', 'true');
	});
});

it('shows the other page of reviews when "Page 2" is clicked', async () => {
	Element.prototype.scrollIntoView = vi.fn();
	const shoeRatings = Array.from({ length: 6 }, (_, i) =>
		makeReview({
			_id: `rating-${i}`,
			summary: `Review number ${i}`,
			createdAt: new Date(2024, 0, i + 1).toISOString(),
		})
	);
	const user = userEvent.setup();
	renderWithProviders(<FullShoeReviews shoe={shoe} shoeRatings={shoeRatings} />);
	await screen.findByText('Review number 5');

	await user.click(screen.getByRole('button', { name: 'Page 2' }));

	expect(await screen.findByText('Review number 0')).toBeInTheDocument();
	expect(screen.queryByText('Review number 5')).not.toBeInTheDocument();
});

it('renders the correct percentage for each star rating', () => {
	const shoeRatings = [
		{ ...makeReview({ _id: 'r1', summary: 'a', createdAt: new Date().toISOString() }), ratingNum: 5 },
		{ ...makeReview({ _id: 'r2', summary: 'b', createdAt: new Date().toISOString() }), ratingNum: 5 },
		{ ...makeReview({ _id: 'r3', summary: 'c', createdAt: new Date().toISOString() }), ratingNum: 3 },
		{ ...makeReview({ _id: 'r4', summary: 'd', createdAt: new Date().toISOString() }), ratingNum: 1 },
	];
	renderWithProviders(<FullShoeReviews shoe={shoe} shoeRatings={shoeRatings} />);

	expect(screen.getByRole('progressbar', { name: '5 stars' })).toHaveAttribute('aria-valuenow', '50');
	expect(screen.getByRole('progressbar', { name: '4 stars' })).toHaveAttribute('aria-valuenow', '0');
	expect(screen.getByRole('progressbar', { name: '3 stars' })).toHaveAttribute('aria-valuenow', '25');
	expect(screen.getByRole('progressbar', { name: '2 stars' })).toHaveAttribute('aria-valuenow', '0');
	expect(screen.getByRole('progressbar', { name: '1 star' })).toHaveAttribute('aria-valuenow', '25');
});

it('renders the average rating and total review count when reviews exist', async () => {
	const ratedShoe = { shoeID: 'air-max-1', rating: 4.5 };
	const shoeRatings = [makeReview({ _id: 'rating-1', summary: 'Great shoe', createdAt: new Date().toISOString() })];
	renderWithProviders(<FullShoeReviews shoe={ratedShoe} shoeRatings={shoeRatings} />);

	expect(await screen.findByText('4.50 out of 5')).toBeInTheDocument();
	expect(screen.getByText('1 global ratings')).toBeInTheDocument();
});

it("logs an error and doesn't crash when liking a rating fails", async () => {
	server.use(
		http.put(`${API_URL}/rating/like`, () => HttpResponse.json({ message: 'Server error' }, { status: 500 }))
	);
	const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
	const shoeRatings = [makeReview({ _id: 'rating-1', summary: 'Great shoe', createdAt: new Date().toISOString() })];
	const user = userEvent.setup();
	renderWithProviders(<FullShoeReviews shoe={shoe} shoeRatings={shoeRatings} />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await screen.findByText('Great shoe');

	// See the comment on the "Mark as helpful" test above - retry until the user query has
	// resolved and the click actually reaches the (failing) mutation instead of a no-op redirect.
	await waitFor(async () => {
		await user.click(screen.getByRole('button', { name: /mark as helpful/i }));
		expect(consoleError).toHaveBeenCalledWith('Failed to like rating:', expect.anything());
	});

	consoleError.mockRestore();
});

it('does not render pagination controls when there are 5 or fewer reviews', async () => {
	const shoeRatings = [makeReview({ _id: 'rating-1', summary: 'Great shoe', createdAt: new Date().toISOString() })];
	renderWithProviders(<FullShoeReviews shoe={shoe} shoeRatings={shoeRatings} />);
	await screen.findByText('Great shoe');

	expect(screen.queryByRole('button', { name: /page 2/i })).not.toBeInTheDocument();
});
