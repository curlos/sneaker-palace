import { test as base } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { makeTestUser, TestUser } from '../utils/testUser';

export const test = base.extend<{ testUser: TestUser }>({
	testUser: async ({ page }, use) => {
		const user = makeTestUser();
		const registerPage = new RegisterPage(page);
		await registerPage.goto();
		await registerPage.register(user);
		await page.waitForURL('/');
		await use(user);
	},
});

export { expect } from '@playwright/test';
