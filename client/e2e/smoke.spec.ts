import { test, expect } from '@playwright/test';
import shoes from './fixtures/data/shoes.json' with { type: 'json' };

// A minimal, standalone check that the app and its data are actually up -
// deliberately separate from the real flow specs, so infra problems
// (backend/database/seed data not ready, or the fixture failing to import)
// surface here first and fast, instead of getting lost in every other spec
// failing for the same reason.
test('the app is up and serving real product data', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Popular Brands' })).toBeVisible();

	await page.goto('/shoes');
	await expect(page.getByRole('heading', { level: 1 })).toContainText(/Sneakers \(/);

	if (process.env.CI) {
		// CI seeds MongoDB from exactly this fixture (see the workflow's "Seed
		// shoe catalog fixture" step), so the catalog count should match it
		// exactly - a seeding regression fails loudly here instead of
		// silently leaving CI's database empty or partial.
		await expect(page.getByRole('heading', { level: 1 })).toContainText(`Sneakers (${shoes.length})`);

		// The page defaults to sorting by "Newest Arrivals" (releaseDate desc,
		// see shoeRouter.ts's getSortType), so the fixture's most recently
		// released shoe should be on the first page.
		const [newestShoe] = [...shoes].sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1));
		await expect(page.getByRole('link', { name: newestShoe.name })).toBeVisible();
	} else {
		// Locally, the dev database is the full real catalog, not this
		// fixture, so an exact-count/newest-shoe check doesn't apply here -
		// just confirm real products are actually rendering.
		await expect(page.locator('a[href^="/shoe/"]').first()).toBeVisible();
	}
});
