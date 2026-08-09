import { render, screen } from '../test-utils';
import { makeShoe } from '../test-fixtures';
import CheckoutProduct from './CheckoutProduct';

it('renders the line total as quantity times the shoe price', () => {
	const product = { _id: 'p1', productID: 'shoe-1', size: '9', quantity: 2, retailPrice: 130 };
	const shoe = makeShoe({ shoeID: 'shoe-1', name: 'Air Max 1', retailPrice: 130 });
	render(<CheckoutProduct product={product} shoe={shoe} type="small" />);

	expect(screen.getByText('$260.00')).toBeInTheDocument();
});

it('renders the shoe name, size, colorway, and quantity', () => {
	const product = { _id: 'p1', productID: 'shoe-1', size: '9', quantity: 2, retailPrice: 130 };
	const shoe = makeShoe({ shoeID: 'shoe-1', name: 'Air Max 1', retailPrice: 130, colorway: 'colorway' });
	render(<CheckoutProduct product={product} shoe={shoe} type="small" />);

	expect(screen.getByText('Air Max 1')).toBeInTheDocument();
	expect(screen.getByText('Size: 9')).toBeInTheDocument();
	expect(screen.getByText('Colorway: colorway')).toBeInTheDocument();
	expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
});

it('renders the shoe image with the correct src and alt', () => {
	const product = { _id: 'p1', productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 130 };
	const shoe = makeShoe({
		shoeID: 'shoe-1',
		name: 'Air Max 1',
		retailPrice: 130,
		image: { '360': [], original: '/img/air-max-1.jpg', small: '', thumbnail: '' },
	});
	render(<CheckoutProduct product={product} shoe={shoe} type="small" />);

	expect(screen.getByRole('img', { name: 'Air Max 1' })).toHaveAttribute('src', '/img/air-max-1.jpg');
});
