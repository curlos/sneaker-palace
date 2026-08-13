import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { server } from '../mocks/server';
import { makeAuthUser } from '../test-fixtures';
import { postImage } from '../utils/postImage';
import AccountDetails from './AccountDetails';

// axios + jsdom's native FormData don't reliably resolve/reject together in this
// test environment (the request can hang indefinitely) - mock postImage directly
// instead of exercising that real network path.
vi.mock('../utils/postImage');

const API_URL = import.meta.env.VITE_API_URL;

// Drains the initial GET /users/:userId fetch and the resulting re-render before
// interacting, so a late-resolving update can't leak into a later, unrelated assertion.
const waitForUserDataToBeReady = () => screen.findByDisplayValue('Test');

it('shows the default avatar when the user has no profile picture', async () => {
	renderWithProviders(<AccountDetails />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

	const avatar = await screen.findByRole('img');
	expect(avatar).toHaveAttribute('src', expect.stringContaining('default'));
});

it("pre-fills the form with the logged-in user's name and email", async () => {
	renderWithProviders(<AccountDetails />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

	// getByLabelText looks up the <label>, then returns the <input> it's associated with -
	// not the label element itself - so toHaveValue below is checking the input's value.
	await waitFor(() => expect(screen.getByLabelText('First Name')).toHaveValue('Test'));
	expect(screen.getByLabelText('Last Name')).toHaveValue('User');
	expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
});

it('opens the password modal when the password field is clicked', async () => {
	const user = userEvent.setup();
	renderWithProviders(<AccountDetails />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await waitForUserDataToBeReady();

	await user.click(screen.getByLabelText('Password'));

	expect(screen.getByRole('dialog', { name: 'Edit Password' })).toBeInTheDocument();
});

it('opens the password modal when Enter is pressed on the password field', async () => {
	const user = userEvent.setup();
	renderWithProviders(<AccountDetails />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await waitForUserDataToBeReady();

	screen.getByLabelText('Password').focus();
	await user.keyboard('{Enter}');

	expect(screen.getByRole('dialog', { name: 'Edit Password' })).toBeInTheDocument();
});

it('previews the selected file and uploads it when saving', async () => {
	vi.mocked(postImage).mockResolvedValue({ imagePath: 'https://example.com/uploaded.jpg' });

	let receivedBody: Record<string, unknown> = {};
	server.use(
		http.put(`${API_URL}/users`, async ({ request }) => {
			receivedBody = (await request.json()) as Record<string, unknown>;
			return HttpResponse.json(makeAuthUser());
		})
	);
	const user = userEvent.setup();
	renderWithProviders(<AccountDetails />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await waitForUserDataToBeReady();

	const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
	await user.upload(screen.getByLabelText('Profile Picture'), file);

	expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:mock-preview-url');

	await user.click(screen.getByRole('button', { name: /save/i }));

	await waitFor(() => expect(receivedBody.profilePic).toBe('https://example.com/uploaded.jpg'));
});

it('sends the edited field values when saving', async () => {
	let receivedBody: Record<string, unknown> = {};
	server.use(
		http.put(`${API_URL}/users`, async ({ request }) => {
			receivedBody = (await request.json()) as Record<string, unknown>;

			return HttpResponse.json(makeAuthUser());
		})
	);
	const user = userEvent.setup();
	renderWithProviders(<AccountDetails />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await waitForUserDataToBeReady();

	await user.clear(screen.getByLabelText('First Name'));
	await user.type(screen.getByLabelText('First Name'), 'Updated');

	await user.click(screen.getByRole('button', { name: /save/i }));

	await waitFor(() => expect(receivedBody.firstName).toBe('Updated'));
});

it('shows a success message after saving account details', async () => {
	const user = userEvent.setup();
	renderWithProviders(<AccountDetails />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await waitForUserDataToBeReady();

	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(await screen.findByText('Settings updated!')).toBeInTheDocument();
});

it('disables the Save button while the update is in flight', async () => {
	server.use(
		http.put(`${API_URL}/users`, async () => {
			// isLoading flips true synchronously when the click fires (before the request even
			// resolves), so the assertion below doesn't need this delay to see that part. What it
			// guards against is the *reverse*: await user.click() only resolves once userEvent's
			// internal event chain has fully unwound, and a fast-enough response could resolve and
			// flip isLoading back to false during that unwind - making the button look enabled again
			// by the time the assertion runs. 50ms is comfortably above that unwind's overhead
			// (empirically, delay(1) flakes and delay(2) passes on this machine - but that boundary
			// shifts with system load/CI, so 50ms is used for a safe margin, not the observed minimum).
			await delay(50);
			return HttpResponse.json(makeAuthUser());
		})
	);
	const user = userEvent.setup();
	renderWithProviders(<AccountDetails />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await waitForUserDataToBeReady();

	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
});

it('shows the server error message when saving fails', async () => {
	server.use(
		http.put(`${API_URL}/users`, () => HttpResponse.json({ error: 'Email already in use' }, { status: 400 }))
	);
	const user = userEvent.setup();
	renderWithProviders(<AccountDetails />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await waitForUserDataToBeReady();

	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(await screen.findByRole('alert')).toHaveTextContent('Email already in use');
});

it('shows a generic error message when saving fails without a backend error message', async () => {
	server.use(http.put(`${API_URL}/users`, () => HttpResponse.json({}, { status: 500 })));
	const user = userEvent.setup();
	renderWithProviders(<AccountDetails />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await waitForUserDataToBeReady();

	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(await screen.findByRole('alert')).toHaveTextContent('Settings not updated, error occurred!');
});
