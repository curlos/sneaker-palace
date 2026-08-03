import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen } from '../test-utils';
import { server } from '../mocks/server';
import { makeShoe } from '../test-fixtures';
import CheckoutProduct from './CheckoutProduct';

const API_URL = import.meta.env.VITE_API_URL;

it('renders the line total as quantity times the shoe price', async () => {
	const product = { _id: 'p1', productID: 'shoe-1', size: '9', quantity: 2, retailPrice: 130 };
	renderWithProviders(<CheckoutProduct product={product} type="small" />);

	expect(await screen.findByText('$260.00')).toBeInTheDocument();
});

it('shows the loading spinner before the shoe data loads', async () => {
	const product = { _id: 'p1', productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 130 };
	renderWithProviders(<CheckoutProduct product={product} type="small" />);

	expect(screen.getByRole('status')).toBeInTheDocument();

	await screen.findByText('Air Max 1');

	expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('renders the shoe name, size, colorway, and quantity', async () => {
	const product = { _id: 'p1', productID: 'shoe-1', size: '9', quantity: 2, retailPrice: 130 };
	renderWithProviders(<CheckoutProduct product={product} type="small" />);

	expect(await screen.findByText('Air Max 1')).toBeInTheDocument();
	expect(screen.getByText('Size: 9')).toBeInTheDocument();
	expect(screen.getByText('Colorway: colorway')).toBeInTheDocument();
	expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
});

it('renders the shoe image with the correct src and alt', async () => {
	server.use(
		http.get(`${API_URL}/shoes/:shoeID`, ({ params }) =>
			HttpResponse.json(
				makeShoe({
					shoeID: params.shoeID as string,
					name: 'Air Max 1',
					retailPrice: 130,
					image: { '360': [], original: '/img/air-max-1.jpg', small: '', thumbnail: '' },
				})
			)
		)
	);
	const product = { _id: 'p1', productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 130 };
	renderWithProviders(<CheckoutProduct product={product} type="small" />);

	const image = await screen.findByRole('img', { name: 'Air Max 1' });

	expect(image).toHaveAttribute('src', '/img/air-max-1.jpg');
});
