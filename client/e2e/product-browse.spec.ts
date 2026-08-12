import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { NavBar } from './pages/NavBar';
import { SearchModal } from './pages/Modals';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

// Intercepts the real POST /shoes response so the filter is checked against
// the real, currently-filtered dataset (not fixture data, which only exists
// in CI) rather than a hardcoded brand/count - a URL-only assertion would
// prove the checkbox fired a navigation but nothing about whether the filter
// actually filtered correctly on the backend or rendered correctly on the
// frontend.
test('filtering by brand returns only shoes with that brand', async ({ page }) => {
	const productList = new ProductListPage(page);
	await productList.goto();

	await productList.openFilters();
	await productList.expandFilterGroup('Brand');

	const firstBrandLabel = page.locator('#filter-panel-brand label').first();
	const brandName = (await firstBrandLabel.locator('span').textContent())?.trim();

	const [response] = await Promise.all([
		page.waitForResponse((res) => res.url().includes('/shoes') && res.request().method() === 'POST'),
		firstBrandLabel.getByRole('checkbox').check(),
	]);

	await expect(page).toHaveURL(/brands=/);

	const { docs } = await response.json();
	expect(docs.length).toBeGreaterThan(0);
	for (const shoe of docs) {
		expect(shoe.brand).toBe(brandName);
	}
	await expect(productList.productCards).toHaveCount(docs.length);
});

// Parses a price range label like "$25 - $50" or "$150+" into the same
// {low, high} shape shoeRouter.ts's buildFilterMatch() uses, so the
// assertion below mirrors the real backend logic instead of re-guessing it.
function parsePriceRangeLabel(label: string): { low: number; high: number | null } {
	if (label.endsWith('+')) {
		return { low: Number(label.replace(/[$+]/g, '')), high: null };
	}
	const [low, high] = label.split('-').map((part) => Number(part.replace(/[$\s]/g, '')));
	return { low, high };
}

// The test above only proves the *interactive* path works (click a checkbox
// -> updateFilters() -> new URL -> new fetch). Loading a URL that already has
// filters in it - as if a shared or bookmarked link had been opened -
// exercises a different code path entirely: reading filter state back out of
// the URL on initial mount (getInitialFilters()), with no click involved at
// all. A real shared link would typically combine several filter dimensions
// at once (not just one), so this applies brands + a price range + a color
// together and confirms every returned shoe actually satisfies all three.
// Real values are read live from the UI first (not hardcoded), so this
// doesn't depend on specific brands/colors always existing in the catalog -
// and since that specific 3-way combination isn't guaranteed to match
// anything in a catalog that changes over time, the correctness check (does
// every returned shoe satisfy every filter?) doesn't require a non-empty
// result; an empty result is still a fully valid, correctly-filtered outcome.
test('loading a URL with multiple filters (brands, price, color) applied together works correctly', async ({
	page,
}) => {
	const productList = new ProductListPage(page);
	await productList.goto();
	await productList.openFilters();

	await productList.expandFilterGroup('Brand');
	const brandNames = (await page.locator('#filter-panel-brand label span').allTextContents())
		.slice(0, 3)
		.map((name) => name.trim());

	await productList.expandFilterGroup('Price');
	const priceRangeLabel = (await page.locator('#filter-panel-price label span').first().textContent())!.trim();
	const { low, high } = parsePriceRangeLabel(priceRangeLabel);

	await productList.expandFilterGroup('Color');
	const colorName = (await page.locator('#filter-panel-color button').first().getAttribute('aria-label'))!;

	const query = new URLSearchParams({
		brands: brandNames.join(','),
		priceRanges: priceRangeLabel,
		colors: colorName,
	});

	const [response] = await Promise.all([
		page.waitForResponse((res) => res.url().includes('/shoes') && res.request().method() === 'POST'),
		page.goto(`/shoes?${query.toString()}`),
	]);

	const { docs } = await response.json();
	for (const shoe of docs) {
		expect(brandNames).toContain(shoe.brand);
		expect(shoe.colorway.toLowerCase()).toContain(colorName.toLowerCase());
		expect(shoe.retailPrice).toBeGreaterThanOrEqual(low);
		if (high !== null) {
			expect(shoe.retailPrice).toBeLessThanOrEqual(high);
		}
	}
	await expect(productList.productCards).toHaveCount(docs.length);
});

test('sorting by price returns results in ascending price order', async ({ page }) => {
	const productList = new ProductListPage(page);
	await productList.goto();

	const [response] = await Promise.all([
		page.waitForResponse((res) => res.url().includes('/shoes') && res.request().method() === 'POST'),
		productList.selectSort('Price: Low to High'),
	]);

	await expect(page).toHaveURL(/sort-type=/);

	const { docs } = await response.json();
	expect(docs.length).toBeGreaterThan(0);
	const prices = docs.map((shoe: { retailPrice: number }) => shoe.retailPrice);
	const sortedPrices = [...prices].sort((a, b) => a - b);
	expect(prices).toEqual(sortedPrices);
});

test('sorting by price returns results in descending price order', async ({ page }) => {
	const productList = new ProductListPage(page);
	await productList.goto();

	const [response] = await Promise.all([
		page.waitForResponse((res) => res.url().includes('/shoes') && res.request().method() === 'POST'),
		productList.selectSort('Price: High to Low'),
	]);

	await expect(page).toHaveURL(/sort-type=/);

	const { docs } = await response.json();
	expect(docs.length).toBeGreaterThan(0);
	const prices = docs.map((shoe: { retailPrice: number }) => shoe.retailPrice);
	const sortedPrices = [...prices].sort((a, b) => b - a);
	expect(prices).toEqual(sortedPrices);
});

// Asserts on the response's pagination metadata (page/pagingCounter) rather
// than diffing rendered product hrefs between pages - the backend sorts by
// releaseDate with no tiebreaker field, so items with an identical
// releaseDate aren't guaranteed a stable order across separate page 1/page 2
// queries, which would make an href comparison flaky.
test('clicking next page loads page two from the backend', async ({ page }) => {
	const productList = new ProductListPage(page);
	await productList.goto();

	const [response] = await Promise.all([
		page.waitForResponse((res) => res.url().includes('/shoes') && res.request().method() === 'POST'),
		productList.nextPageLink.click(),
	]);

	await expect(page).toHaveURL(/page=2/);

	const { docs, page: responsePage, pagingCounter } = await response.json();
	expect(responsePage).toBe(2);
	expect(pagingCounter).toBe(13);
	expect(docs.length).toBeGreaterThan(0);
	await expect(productList.productCards).toHaveCount(docs.length);
});

// Searches for a real, known product's exact name (not a hardcoded/generic
// term) so the assertion can check the real backend response actually found
// it, rather than just checking the URL changed - a URL change alone
// wouldn't catch a broken search query or a backend that silently returns
// the wrong (or no) results. The search modal itself is reachable from any
// page via the nav (not home-page-specific), so this belongs alongside the
// other discovery flows (filter/sort/pagination) rather than in home.spec.ts.
test('search returns and renders the real product being searched for', async ({ page }) => {
	const home = new HomePage(page);
	const navBar = new NavBar(page);
	const searchModal = new SearchModal(page);
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);

	await productList.goto();
	await productList.openFirstProduct();
	const productName = await productDetail.heading.textContent();

	await home.goto();
	await navBar.openSearch();
	await expect(searchModal.dialog).toBeVisible();

	const [response] = await Promise.all([
		page.waitForResponse((res) => res.url().includes('/shoes') && res.request().method() === 'POST'),
		searchModal.search(productName!),
	]);

	await expect(page).toHaveURL(/\/shoes\?query=/);

	const { docs } = await response.json();
	expect(docs.some((shoe: { name: string }) => shoe.name === productName)).toBe(true);
	await expect(productList.productCards.filter({ hasText: productName! }).first()).toBeVisible();
});
