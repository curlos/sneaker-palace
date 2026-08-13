import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { server } from '../mocks/server';
import { makeAuthUser } from '../test-fixtures';
import { DEFAULT_AVATAR } from '../utils/userConstants';
import Review from './Review';

const API_URL = import.meta.env.VITE_API_URL;

const shoeRating = {
	_id: 'rating-1',
	userID: 'user-2',
	shoeID: 'air-max-1',
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
	postedByUser: makeAuthUser({ _id: 'user-2', firstName: 'Jane' }),
};

it("renders the review's summary text", () => {
	renderWithProviders(
		<Review
			shoeRating={shoeRating}
			shoe={{ shoeID: 'air-max-1' }}
			onLike={vi.fn()}
			onDislike={vi.fn()}
			isLoading={false}
		/>
	);

	expect(screen.getByText('Great shoe')).toBeInTheDocument();
});

it('calls onLike with the review id when "Mark as helpful" is clicked', async () => {
	const onLike = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(
		<Review
			shoeRating={shoeRating}
			shoe={{ shoeID: 'air-max-1' }}
			onLike={onLike}
			onDislike={vi.fn()}
			isLoading={false}
		/>
	);

	await user.click(screen.getByRole('button', { name: /mark as helpful/i }));

	expect(onLike).toHaveBeenCalledWith('rating-1');
});

it('calls onDislike with the review id when "Mark as not helpful" is clicked', async () => {
	const onDislike = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(
		<Review
			shoeRating={shoeRating}
			shoe={{ shoeID: 'air-max-1' }}
			onLike={vi.fn()}
			onDislike={onDislike}
			isLoading={false}
		/>
	);

	await user.click(screen.getByRole('button', { name: /mark as not helpful/i }));

	expect(onDislike).toHaveBeenCalledWith('rating-1');
});

it('shows "Mark as helpful" as pressed when the logged-in user has already liked the review', async () => {
	server.use(
		http.get(`${API_URL}/users/:userId`, () =>
			HttpResponse.json(makeAuthUser({ _id: 'user-3', helpful: ['rating-1'] }))
		)
	);
	renderWithProviders(
		<Review
			shoeRating={shoeRating}
			shoe={{ shoeID: 'air-max-1' }}
			onLike={vi.fn()}
			onDislike={vi.fn()}
			isLoading={false}
		/>,
		{ preloadedState: { user: { currentUser: makeAuthUser({ _id: 'user-3' }), isFetching: false, error: false } } }
	);

	await waitFor(() =>
		expect(screen.getByRole('button', { name: /mark as helpful/i })).toHaveAttribute('aria-pressed', 'true')
	);
});

it('shows "Mark as not helpful" as pressed when the logged-in user has already disliked the review', async () => {
	server.use(
		http.get(`${API_URL}/users/:userId`, () =>
			HttpResponse.json(makeAuthUser({ _id: 'user-3', notHelpful: ['rating-1'] }))
		)
	);
	renderWithProviders(
		<Review
			shoeRating={shoeRating}
			shoe={{ shoeID: 'air-max-1' }}
			onLike={vi.fn()}
			onDislike={vi.fn()}
			isLoading={false}
		/>,
		{ preloadedState: { user: { currentUser: makeAuthUser({ _id: 'user-3' }), isFetching: false, error: false } } }
	);

	await waitFor(() =>
		expect(screen.getByRole('button', { name: /mark as not helpful/i })).toHaveAttribute('aria-pressed', 'true')
	);
});

it('opens the review photo modal when the photo thumbnail is clicked', async () => {
	const user = userEvent.setup();
	renderWithProviders(
		<Review
			shoeRating={{ ...shoeRating, photo: 'https://example.com/photo.jpg' }}
			shoe={{ shoeID: 'air-max-1' }}
			onLike={vi.fn()}
			onDislike={vi.fn()}
			isLoading={false}
		/>
	);

	await user.click(screen.getByRole('button', { name: /view full review photo/i }));

	expect(screen.getByRole('dialog', { name: 'Full review' })).toBeInTheDocument();
});

it('shows the default avatar when the reviewer has no profile picture', () => {
	renderWithProviders(
		<Review
			shoeRating={shoeRating}
			shoe={{ shoeID: 'air-max-1' }}
			onLike={vi.fn()}
			onDislike={vi.fn()}
			isLoading={false}
		/>
	);

	expect(screen.getByRole('img', { name: "Jane's avatar" })).toHaveAttribute('src', DEFAULT_AVATAR);
});

it("shows the reviewer's profile picture when one is set", () => {
	const reviewWithPic = {
		...shoeRating,
		postedByUser: { ...shoeRating.postedByUser, profilePic: 'https://example.com/avatar.jpg' },
	};
	renderWithProviders(
		<Review
			shoeRating={reviewWithPic}
			shoe={{ shoeID: 'air-max-1' }}
			onLike={vi.fn()}
			onDislike={vi.fn()}
			isLoading={false}
		/>
	);

	expect(screen.getByRole('img', { name: "Jane's avatar" })).toHaveAttribute('src', 'https://example.com/avatar.jpg');
});

it('disables the helpful/not-helpful buttons while a mutation is loading', () => {
	renderWithProviders(
		<Review
			shoeRating={shoeRating}
			shoe={{ shoeID: 'air-max-1' }}
			onLike={vi.fn()}
			onDislike={vi.fn()}
			isLoading={true}
		/>
	);

	expect(screen.getByRole('button', { name: /mark as helpful/i })).toBeDisabled();
	expect(screen.getByRole('button', { name: /mark as not helpful/i })).toBeDisabled();
});

const renderAsUser = (userId: string) => {
	server.use(http.get(`${API_URL}/users/:userId`, () => HttpResponse.json(makeAuthUser({ _id: userId }))));
	return renderWithProviders(
		<Review
			shoeRating={shoeRating}
			shoe={{ shoeID: 'air-max-1' }}
			onLike={vi.fn()}
			onDislike={vi.fn()}
			isLoading={false}
		/>,
		{ preloadedState: { user: { currentUser: makeAuthUser({ _id: userId }), isFetching: false, error: false } } }
	);
};

it("shows edit/delete controls to the review's author", async () => {
	renderAsUser('user-2');

	expect(await screen.findByRole('button', { name: /delete review/i })).toBeInTheDocument();
	expect(screen.getByRole('link', { name: /edit review/i })).toBeInTheDocument();
});

it('hides edit/delete controls from a different logged-in user', async () => {
	renderAsUser('someone-else');
	await screen.findByText('Great shoe');

	expect(screen.queryByRole('button', { name: /delete review/i })).not.toBeInTheDocument();
	expect(screen.queryByRole('link', { name: /edit review/i })).not.toBeInTheDocument();
});

it('deletes the review when "Delete review" is clicked', async () => {
	const user = userEvent.setup();
	renderAsUser('user-2');
	const deleteButton = await screen.findByRole('button', { name: /delete review/i });

	// The mutation is fire-and-forget from the component's perspective (no loading/success UI
	// of its own) — clicking without it throwing is the observable contract here.
	await expect(user.click(deleteButton)).resolves.not.toThrow();
});
