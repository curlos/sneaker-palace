import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { server } from '../mocks/server';
import { makeAuthUser } from '../test-fixtures';
import { AVERAGE_SHOE_SIZE } from '../utils/shoeConstants';
import ShopPreferences from './ShopPreferences';

const API_URL = import.meta.env.VITE_API_URL;

const renderShopPreferences = () =>
	renderWithProviders(<ShopPreferences />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

it('renders the default shoe size, gender, and unit of measure selections', async () => {
	renderShopPreferences();
	await screen.findByLabelText("Women's");

	expect(screen.getByLabelText('Shoe Size')).toHaveValue(AVERAGE_SHOE_SIZE);
	expect(screen.getByLabelText("Men's")).toBeChecked();
	expect(screen.getByLabelText('Imperial')).toBeChecked();
});

it("checks Women's and unchecks Men's when Women's is selected", async () => {
	const user = userEvent.setup();
	renderShopPreferences();
	await screen.findByLabelText("Women's");

	await user.click(screen.getByLabelText("Women's"));

	expect(screen.getByLabelText("Women's")).toBeChecked();
	expect(screen.getByLabelText("Men's")).not.toBeChecked();
});

it('checks Metric and unchecks Imperial when Metric is selected', async () => {
	const user = userEvent.setup();
	renderShopPreferences();
	await screen.findByLabelText('Metric');

	await user.click(screen.getByLabelText('Metric'));

	expect(screen.getByLabelText('Metric')).toBeChecked();
	expect(screen.getByLabelText('Imperial')).not.toBeChecked();
});

it('updates the shoe size selection when a different size is chosen', async () => {
	const user = userEvent.setup();
	renderShopPreferences();
	await screen.findByLabelText('Shoe Size');

	await user.selectOptions(screen.getByLabelText('Shoe Size'), 'M 6 / W 7.5');

	expect(screen.getByLabelText('Shoe Size')).toHaveValue('M 6 / W 7.5');
});

it('sends the selected preferences when saving', async () => {
	let receivedBody: Record<string, unknown> = {};
	server.use(
		http.put(`${API_URL}/users`, async ({ request }) => {
			receivedBody = (await request.json()) as Record<string, unknown>;
			return HttpResponse.json(makeAuthUser());
		})
	);
	const user = userEvent.setup();
	renderShopPreferences();
	await screen.findByLabelText("Women's");

	await user.selectOptions(screen.getByLabelText('Shoe Size'), 'M 6 / W 7.5');
	await user.click(screen.getByLabelText("Women's"));
	await user.click(screen.getByLabelText('Metric'));
	await user.click(screen.getByRole('button', { name: /save/i }));

	await waitFor(() =>
		expect(receivedBody).toEqual({
			preselectedShoeSize: 'M 6 / W 7.5',
			preferredGender: 'women',
			unitOfMeasure: 'metric',
		})
	);
});

it('shows a success message after saving shop preferences', async () => {
	const user = userEvent.setup();
	renderShopPreferences();
	await screen.findByLabelText("Women's");

	await user.click(screen.getByLabelText("Women's"));
	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(await screen.findByText('Settings updated!')).toBeInTheDocument();
});

it('shows a failure message when saving fails', async () => {
	server.use(http.put(`${API_URL}/users`, () => HttpResponse.json({}, { status: 500 })));
	const user = userEvent.setup();
	renderShopPreferences();
	await screen.findByLabelText("Women's");

	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(await screen.findByRole('alert')).toHaveTextContent('Settings not updated, error occurred!');
});

it('disables the Save button while the update is in flight', async () => {
	server.use(
		http.put(`${API_URL}/users`, async () => {
			await delay(50);
			return HttpResponse.json(makeAuthUser());
		})
	);
	const user = userEvent.setup();
	renderShopPreferences();
	await screen.findByLabelText("Women's");

	await user.click(screen.getByRole('button', { name: /save/i }));

	expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
});
