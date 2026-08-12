import { renderWithProviders, screen } from '../test-utils';
import Home from './Home';

it('shows the popular brands section with a link to see all shoes', () => {
	renderWithProviders(<Home />);

	expect(screen.getByRole('heading', { name: 'Popular Brands' })).toBeInTheDocument();
	expect(screen.getByRole('link', { name: /see all/i })).toHaveAttribute('href', '/shoes');
});
