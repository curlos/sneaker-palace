import { Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { server } from '../mocks/server';
import { postImage } from '../utils/postImage';
import ReviewForm from './ReviewForm';

// axios + jsdom's native FormData don't reliably resolve/reject together in this test
// environment (same issue documented in AccountDetails.test.tsx) - mock postImage directly.
vi.mock('../utils/postImage');

const API_URL = import.meta.env.VITE_API_URL;

const renderCreateForm = () =>
	renderWithProviders(
		<Route path="/shoe/submit-review/:shoeID">
			<ReviewForm />
		</Route>,
		{ route: '/shoe/submit-review/air-max-1' }
	);

const renderEditForm = () =>
	renderWithProviders(
		<Route path="/shoe/edit-review/:shoeID/:reviewID">
			<ReviewForm />
		</Route>,
		{ route: '/shoe/edit-review/air-max-1/rating-1' }
	);

it('checks the corresponding accessible radio when a star rating is selected', async () => {
	const user = userEvent.setup();
	renderCreateForm();
	await screen.findByText('Air Max 1');

	await user.click(screen.getByLabelText('3 stars'));

	expect(screen.getByLabelText('3 stars')).toBeChecked();
});

it('checks "Yes" when the user says they recommend the product', async () => {
	const user = userEvent.setup();
	renderCreateForm();
	await screen.findByText('Air Max 1');

	await user.click(screen.getByLabelText('Yes'));

	expect(screen.getByLabelText('Yes')).toBeChecked();
});

it('submits the selected rating and recommendation in the create payload', async () => {
	let capturedBody: { ratingNum?: number; recommended?: boolean; summary?: string; text?: string } = {};
	server.use(
		http.post(`${API_URL}/rating/rate`, async ({ request }) => {
			capturedBody = (await request.json()) as typeof capturedBody;
			return HttpResponse.json({ rating: { _id: 'new-rating-1' } });
		})
	);
	const user = userEvent.setup();
	const { history } = renderCreateForm();
	await screen.findByText('Air Max 1');

	await user.click(screen.getByLabelText('3 stars'));
	await user.click(screen.getByLabelText('Yes'));
	await user.type(screen.getByLabelText('Summary'), 'Great shoe');
	await user.type(screen.getByLabelText('Your Review'), 'Really comfortable.');
	await user.click(screen.getByRole('button', { name: /submit review/i }));

	await waitFor(() => expect(history.location.pathname).toBe('/shoe/air-max-1'));
	expect(capturedBody).toMatchObject({
		ratingNum: 3,
		recommended: true,
		summary: 'Great shoe',
		text: 'Really comfortable.',
	});
});

it('pre-fills the summary field with the existing review when editing', async () => {
	renderEditForm();

	expect(await screen.findByDisplayValue('Great shoe')).toBeInTheDocument();
});

it('navigates to the shoe page after successfully saving an edited review', async () => {
	const user = userEvent.setup();
	const { history } = renderEditForm();
	await screen.findByDisplayValue('Great shoe');

	await user.click(screen.getByRole('button', { name: /edit review/i }));

	await waitFor(() => expect(history.location.pathname).toBe('/shoe/air-max-1'));
});

it('pre-fills the star rating and recommendation when editing', async () => {
	renderEditForm();
	await screen.findByDisplayValue('Great shoe');

	expect(screen.getByLabelText('4 stars')).toBeChecked();
	expect(screen.getByLabelText('Yes')).toBeChecked();
});

it('shows a photo preview after selecting a file', async () => {
	const user = userEvent.setup();
	renderCreateForm();
	await screen.findByText('Air Max 1');
	const file = new File(['photo'], 'shoe.png', { type: 'image/png' });

	await user.upload(screen.getByLabelText('Upload photo'), file);

	expect(screen.getByRole('img', { name: 'Preview of your upload' })).toHaveAttribute('src', 'blob:mock-preview-url');
});

it('removes the photo preview when "Remove photo" is clicked', async () => {
	const user = userEvent.setup();
	renderCreateForm();
	await screen.findByText('Air Max 1');
	const file = new File(['photo'], 'shoe.png', { type: 'image/png' });
	await user.upload(screen.getByLabelText('Upload photo'), file);
	await screen.findByRole('img', { name: 'Preview of your upload' });

	await user.click(screen.getByRole('button', { name: /remove photo/i }));

	expect(screen.queryByRole('img', { name: 'Preview of your upload' })).not.toBeInTheDocument();
});

it('uploads the selected photo and includes its path in the submitted review', async () => {
	vi.mocked(postImage).mockResolvedValue({ imagePath: 'https://example.com/review-photo.jpg' });
	let capturedBody: { photo?: string | null } = {};
	server.use(
		http.post(`${API_URL}/rating/rate`, async ({ request }) => {
			capturedBody = (await request.json()) as typeof capturedBody;
			return HttpResponse.json({ rating: { _id: 'new-rating-1' } });
		})
	);
	const user = userEvent.setup();
	renderCreateForm();
	await screen.findByText('Air Max 1');
	const file = new File(['photo'], 'shoe.png', { type: 'image/png' });
	await user.upload(screen.getByLabelText('Upload photo'), file);

	await user.click(screen.getByRole('button', { name: /submit review/i }));

	await waitFor(() => expect(capturedBody.photo).toBe('https://example.com/review-photo.jpg'));
});

it('submits photo: null when an existing photo is explicitly removed while editing', async () => {
	server.use(
		http.get(`${API_URL}/rating/:ratingId`, ({ params }) =>
			HttpResponse.json({
				_id: params.ratingId,
				userID: 'user-1',
				shoeID: 'air-max-1',
				ratingNum: 4,
				summary: 'Great shoe',
				text: 'Loved it',
				photo: 'https://example.com/existing.jpg',
				size: 'Perfect',
				comfort: 'Perfect',
				width: 'Perfect',
				quality: 'Perfect',
				recommended: true,
				helpful: [],
				notHelpful: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
		)
	);
	let capturedBody: { photo?: string | null } = {};
	server.use(
		http.put(`${API_URL}/rating/edit/:ratingId`, async ({ request }) => {
			capturedBody = (await request.json()) as typeof capturedBody;
			return HttpResponse.json({ _id: 'edited-rating-1' });
		})
	);
	const user = userEvent.setup();
	renderEditForm();
	await screen.findByRole('button', { name: /remove photo/i });

	await user.click(screen.getByRole('button', { name: /remove photo/i }));
	await user.click(screen.getByRole('button', { name: /edit review/i }));

	await waitFor(() => expect(capturedBody.photo).toBeNull());
});

it('does not navigate away and re-enables the submit button when saving fails', async () => {
	server.use(http.post(`${API_URL}/rating/rate`, () => HttpResponse.json({ error: 'Server error' }, { status: 500 })));
	const user = userEvent.setup();
	const { history } = renderCreateForm();
	await screen.findByText('Air Max 1');
	await user.click(screen.getByLabelText('3 stars'));
	await user.click(screen.getByLabelText('Yes'));
	await user.type(screen.getByLabelText('Summary'), 'Great shoe');
	await user.type(screen.getByLabelText('Your Review'), 'Really comfortable.');

	await user.click(screen.getByRole('button', { name: /submit review/i }));

	await waitFor(() => expect(screen.getByRole('button', { name: /submit review/i })).not.toBeDisabled());
	expect(history.location.pathname).toBe('/shoe/submit-review/air-max-1');
});
