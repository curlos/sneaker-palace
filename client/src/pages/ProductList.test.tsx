import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen } from '../test-utils';
import { server } from '../mocks/server';
import { mockShoes } from '../mocks/handlers';
import { makeShoe } from '../test-fixtures';
import ProductList from './ProductList';

const API_URL = import.meta.env.VITE_API_URL;

// Shared across the pagination tests: 13 shoes (one more than a page) so page 2 has content,
// with a handler that actually slices by the `pageNum` sent in the request body - the default
// mock handler ignores pagination entirely and always returns the same 2 shoes.
const paginatedShoes = Array.from({ length: 13 }, (_, i) => makeShoe({ shoeID: `shoe-${i + 1}`, name: `Shoe ${i + 1}` }));

const paginatedShoesHandler = () =>
	http.post(`${API_URL}/shoes`, async ({ request }) => {
		const body = (await request.json()) as { pageNum: number };
		const start = (body.pageNum - 1) * 12;
		return HttpResponse.json({ docs: paginatedShoes.slice(start, start + 12), totalDocs: paginatedShoes.length });
	});

it('renders the shoes returned by the paginated shoes endpoint', async () => {
	renderWithProviders(<ProductList />, { route: '/shoes' });

	expect(await screen.findByText(mockShoes[0].name)).toBeInTheDocument();
});

it('shows a "Search results for" heading when a search query is present', async () => {
	renderWithProviders(<ProductList />, { route: '/shoes?query=air' });

	expect(await screen.findByText('Search results for')).toBeInTheDocument();
});

it('updates the URL sort-type parameter when a sort option is selected', async () => {
	const user = userEvent.setup();
	const { history } = renderWithProviders(<ProductList />, { route: '/shoes' });
	await screen.findByText(mockShoes[0].name);

	await user.click(screen.getByRole('button', { name: /sort by/i }));
	await user.click(screen.getByRole('menuitem', { name: 'Most Popular' }));

	expect(history.location.search).toContain('sort-type=Most+Popular');
});

it('shows the total result count in the default heading', async () => {
	renderWithProviders(<ProductList />, { route: '/shoes' });

	expect(await screen.findByRole('heading', { name: `Sneakers (${mockShoes.length})` })).toBeInTheDocument();
});

it('shows the total result count in the search-results heading', async () => {
	renderWithProviders(<ProductList />, { route: '/shoes?query=air' });

	expect(await screen.findByRole('heading', { name: `air (${mockShoes.length})` })).toBeInTheDocument();
});

it('navigates back to /shoes when Clear search is clicked', async () => {
	const user = userEvent.setup();
	const { history } = renderWithProviders(<ProductList />, { route: '/shoes?query=air' });
	await screen.findByText('Search results for');

	await user.click(screen.getByRole('button', { name: /clear search/i }));

	expect(history.location.pathname).toBe('/shoes');
	expect(history.location.search).toBe('');
});

it('hides the filters sidebar by default and shows it when Filters is clicked', async () => {
	const user = userEvent.setup();
	const { container } = renderWithProviders(<ProductList />, { route: '/shoes' });
	await screen.findByText(mockShoes[0].name);

	const filtersButton = screen.getByRole('button', { name: /^filters$/i });
	expect(filtersButton).toHaveAttribute('aria-expanded', 'false');
	expect(container.querySelector('#shoe-filters-sidebar')).not.toBeInTheDocument();

	await user.click(filtersButton);

	expect(filtersButton).toHaveAttribute('aria-expanded', 'true');
	expect(container.querySelector('#shoe-filters-sidebar')).toBeInTheDocument();
});

it('shows the next page of results and updates the URL when paginating', async () => {
	Element.prototype.scrollIntoView = vi.fn();
	server.use(paginatedShoesHandler());
	const user = userEvent.setup();
	const { history } = renderWithProviders(<ProductList />, { route: '/shoes' });
	await screen.findByText('Shoe 1');
	expect(screen.queryByText('Shoe 13')).not.toBeInTheDocument();

	await user.click(screen.getByRole('link', { name: /^next page$/i }));

	expect(await screen.findByText('Shoe 13')).toBeInTheDocument();
	expect(history.location.search).toContain('page=2');
});

it('renders page 2 results when loading a URL with a page parameter', async () => {
	server.use(paginatedShoesHandler());

	renderWithProviders(<ProductList />, { route: '/shoes?page=2' });

	expect(await screen.findByText('Shoe 13')).toBeInTheDocument();
});

it('resets pagination to page 1 when a new sort option is selected', async () => {
	Element.prototype.scrollIntoView = vi.fn();
	server.use(paginatedShoesHandler());
	const user = userEvent.setup();
	const { history } = renderWithProviders(<ProductList />, { route: '/shoes?page=2' });
	await screen.findByText('Shoe 13');

	await user.click(screen.getByRole('button', { name: /sort by/i }));
	await user.click(screen.getByRole('menuitem', { name: 'Most Popular' }));

	expect(history.location.search).not.toContain('page=2');
});
