import { render, screen, fireEvent } from '../test-utils';
import ShoeImage from './ShoeImage';

it('shows the given image when it loads successfully', () => {
	render(<ShoeImage src="https://example.com/shoe.png" alt="A shoe" />);

	expect(screen.getByRole('img', { name: 'A shoe' })).toHaveAttribute('src', 'https://example.com/shoe.png');
});

it('falls back to the default image when the image fails to load', () => {
	render(<ShoeImage src="https://example.com/broken.png" alt="A shoe" />);

	fireEvent.error(screen.getByRole('img', { name: 'A shoe' }));

	expect(screen.getByRole('img', { name: 'A shoe' })).toHaveAttribute('src', '/assets/icon.png');
});
