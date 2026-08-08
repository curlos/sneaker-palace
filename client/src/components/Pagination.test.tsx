import userEvent from '@testing-library/user-event';
import { render, renderWithProviders, screen } from '../test-utils';
import { Pagination } from './Pagination';

it('does not go below page 1 when already on the first page', async () => {
	const setCurrentPage = vi.fn();
	const user = userEvent.setup();
	render(
		<Pagination pageLimit={5} dataLimit={10} currentPage={1} setCurrentPage={setCurrentPage} totalItemCount={50} />
	);

	await user.click(screen.getByRole('button', { name: /previous page/i }));

	expect(setCurrentPage).not.toHaveBeenCalled();
});

it('advances to the next page when "Next page" is clicked', async () => {
	const setCurrentPage = vi.fn();
	const user = userEvent.setup();
	render(
		<Pagination pageLimit={5} dataLimit={10} currentPage={2} setCurrentPage={setCurrentPage} totalItemCount={50} />
	);

	await user.click(screen.getByRole('button', { name: /next page/i }));

	expect(setCurrentPage).toHaveBeenCalledWith(3);
});

it('jumps directly to the page number that was clicked', async () => {
	const setCurrentPage = vi.fn();
	const user = userEvent.setup();
	render(
		<Pagination pageLimit={5} dataLimit={10} currentPage={1} setCurrentPage={setCurrentPage} totalItemCount={50} />
	);

	await user.click(screen.getByRole('button', { name: 'Page 4' }));

	expect(setCurrentPage).toHaveBeenCalledWith(4);
});

it('does not go above the last page when already on the last page', async () => {
	const setCurrentPage = vi.fn();
	const user = userEvent.setup();
	render(
		<Pagination pageLimit={5} dataLimit={10} currentPage={5} setCurrentPage={setCurrentPage} totalItemCount={50} />
	);

	await user.click(screen.getByRole('button', { name: /next page/i }));

	expect(setCurrentPage).not.toHaveBeenCalled();
});

it('jumps to the first page when "First page" is clicked', async () => {
	const setCurrentPage = vi.fn();
	const user = userEvent.setup();
	render(
		<Pagination pageLimit={5} dataLimit={10} currentPage={3} setCurrentPage={setCurrentPage} totalItemCount={50} />
	);

	await user.click(screen.getByRole('button', { name: /first page/i }));

	expect(setCurrentPage).toHaveBeenCalledWith(1);
});

it('jumps to the last page when "Last page" is clicked', async () => {
	const setCurrentPage = vi.fn();
	const user = userEvent.setup();
	render(
		<Pagination pageLimit={5} dataLimit={10} currentPage={1} setCurrentPage={setCurrentPage} totalItemCount={50} />
	);

	await user.click(screen.getByRole('button', { name: /last page/i }));

	expect(setCurrentPage).toHaveBeenCalledWith(5);
});

it('marks the current page button as the active page for assistive tech', () => {
	render(
		<Pagination
			pageLimit={5}
			dataLimit={10}
			currentPage={3}
			setCurrentPage={vi.fn()}
			totalItemCount={50}
		/>
	);

	expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
});

it('shows the correct result range for a full page', () => {
	const { container } = render(
		<Pagination pageLimit={3} dataLimit={10} currentPage={2} setCurrentPage={vi.fn()} totalItemCount={25} />
	);

	const values = Array.from(container.querySelectorAll('strong')).map((el) => el.textContent);
	expect(values).toEqual(['11', '20', '25']);
});

it('caps the result range at the total item count on a partial last page', () => {
	const { container } = render(
		<Pagination pageLimit={3} dataLimit={10} currentPage={3} setCurrentPage={vi.fn()} totalItemCount={25} />
	);

	const values = Array.from(container.querySelectorAll('strong')).map((el) => el.textContent);
	expect(values).toEqual(['21', '25', '25']);
});

it('renders all page numbers when pageLimit is 5 or fewer', () => {
	render(
		<Pagination pageLimit={3} dataLimit={10} currentPage={1} setCurrentPage={vi.fn()} totalItemCount={30} />
	);

	const pageButtons = screen.getAllByRole('button', { name: /^page \d+$/i });
	expect(pageButtons.map((button) => button.textContent)).toEqual(['1', '2', '3']);
});

it('renders the last 5 pages when the current page is near the end', () => {
	render(
		<Pagination pageLimit={10} dataLimit={10} currentPage={9} setCurrentPage={vi.fn()} totalItemCount={100} />
	);

	const pageButtons = screen.getAllByRole('button', { name: /^page \d+$/i });
	expect(pageButtons.map((button) => button.textContent)).toEqual(['6', '7', '8', '9', '10']);
});

it('renders a 5-page window starting at the current page when in the middle', () => {
	render(
		<Pagination pageLimit={10} dataLimit={10} currentPage={5} setCurrentPage={vi.fn()} totalItemCount={100} />
	);

	const pageButtons = screen.getAllByRole('button', { name: /^page \d+$/i });
	expect(pageButtons.map((button) => button.textContent)).toEqual(['5', '6', '7', '8', '9']);
});

it('renders page controls as links with the correct href when getPageHref is provided', () => {
	renderWithProviders(
		<Pagination
			pageLimit={5}
			dataLimit={10}
			currentPage={1}
			setCurrentPage={vi.fn()}
			totalItemCount={50}
			getPageHref={(page) => `/shop?page=${page}`}
		/>
	);

	expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute('href', '/shop?page=2');
});
