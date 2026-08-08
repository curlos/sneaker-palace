import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen } from '../test-utils';
import { server } from '../mocks/server';
import { makeAuthUser } from '../test-fixtures';
import NewPasswordModal from './NewPasswordModal';

const API_URL = import.meta.env.VITE_API_URL;

const renderModal = () =>
	renderWithProviders(<NewPasswordModal showModal={true} setShowModal={vi.fn()} />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

it('shows a success message after a valid password change', async () => {
	const user = userEvent.setup();
	renderModal();

	await user.type(screen.getByLabelText('Current Password'), 'oldpassword');
	await user.type(screen.getByLabelText('New Password'), 'newpassword123');
	await user.type(screen.getByLabelText('Confirm New Password'), 'newpassword123');
	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(await screen.findByText('Password updated!')).toBeInTheDocument();
});

it('shows a failure message when the new password is too short', async () => {
	const user = userEvent.setup();
	renderModal();

	await user.type(screen.getByLabelText('Current Password'), 'oldpassword');
	await user.type(screen.getByLabelText('New Password'), 'short');
	await user.type(screen.getByLabelText('Confirm New Password'), 'short');
	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(await screen.findByRole('alert')).toHaveTextContent('Password not updated, error occurred!');
});

it('shows a failure message when the new and confirm passwords do not match', async () => {
	const user = userEvent.setup();
	renderModal();

	await user.type(screen.getByLabelText('Current Password'), 'oldpassword');
	await user.type(screen.getByLabelText('New Password'), 'newpassword123');
	await user.type(screen.getByLabelText('Confirm New Password'), 'somethingelse123');
	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(await screen.findByRole('alert')).toHaveTextContent('Password not updated, error occurred!');
});

it('shows a failure message when submitted with empty fields', async () => {
	const user = userEvent.setup();
	renderModal();

	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(await screen.findByRole('alert')).toHaveTextContent('Password not updated, error occurred!');
});

it('shows a failure message when the server rejects the password update', async () => {
	server.use(http.put(`${API_URL}/users/password`, () => HttpResponse.json({}, { status: 500 })));
	const user = userEvent.setup();
	renderModal();

	await user.type(screen.getByLabelText('Current Password'), 'oldpassword');
	await user.type(screen.getByLabelText('New Password'), 'newpassword123');
	await user.type(screen.getByLabelText('Confirm New Password'), 'newpassword123');
	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(await screen.findByRole('alert')).toHaveTextContent('Password not updated, error occurred!');
});
