import { test, expect } from './fixtures/auth';
import { NavBar } from './pages/NavBar';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProfilePage } from './pages/ProfilePage';

test('favoriting a shoe shows it in the profile favorites tab', async ({ page, testUser }) => {
	const navBar = new NavBar(page);
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);
	const profile = new ProfilePage(page);

	await productList.goto();
	await productList.openFirstProduct();
	const productName = await productDetail.heading.textContent();
	await productDetail.favoriteButton.click();
	await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

	await navBar.openUserMenu(testUser.firstName);
	await navBar.profileLink().click();
	await profile.favoritesTab.click();

	// Confirm it's specifically the shoe that was favorited, not just any shoe.
	await expect(profile.favoritesPanel.locator('a[href^="/shoe/"]').filter({ hasText: productName! })).toBeVisible();
});

test('un-favoriting a shoe removes it from the profile favorites tab', async ({ page, testUser }) => {
	const navBar = new NavBar(page);
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);
	const profile = new ProfilePage(page);

	await productList.goto();
	await productList.openFirstProduct();
	await productDetail.favoriteButton.click();
	await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

	await productDetail.favoriteButton.click();
	await expect(page.getByRole('button', { name: 'Add to favorites' })).toBeVisible();

	await navBar.openUserMenu(testUser.firstName);
	await navBar.profileLink().click();
	await profile.favoritesTab.click();

	await expect(profile.favoritesPanel.locator('a[href^="/shoe/"]')).toHaveCount(0);
});

// Deliberately not requesting the `testUser` fixture - handleFavorite in
// FullShoePage.tsx redirects a logged-out user to /login instead of
// favoriting, so this documents that guard is real, not an oversight.
test('favoriting as a guest redirects to login', async ({ page }) => {
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);

	await productList.goto();
	await productList.openFirstProduct();
	await productDetail.favoriteButton.click();

	await expect(page).toHaveURL('/login');
});
