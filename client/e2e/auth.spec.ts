import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { NavBar } from './pages/NavBar';
import { makeTestUser } from './utils/testUser';

test('a registered user can log out', async ({ page }) => {
	const registerPage = new RegisterPage(page);
	const navBar = new NavBar(page);
	const user = makeTestUser();

	await registerPage.goto();
	await registerPage.register(user);
	await navBar.openUserMenu(user.firstName);
	await navBar.signOutButton().click();

	await expect(navBar.loginLink).toBeVisible();
	await expect(navBar.registerLink).toBeVisible();
});

test('a registered user can log back in with valid credentials', async ({ page }) => {
	const registerPage = new RegisterPage(page);
	const loginPage = new LoginPage(page);
	const navBar = new NavBar(page);
	const user = makeTestUser();

	await registerPage.goto();
	await registerPage.register(user);
	await navBar.openUserMenu(user.firstName);
	await navBar.signOutButton().click();
	// loginPage.goto() below is a hard navigation, which rehydrates Redux
	// from localStorage - wait for the logged-out state to actually be
	// visible (and therefore persisted) first, or a fresh page load can
	// still pick up the pre-sign-out session.
	await expect(navBar.loginLink).toBeVisible();

	await loginPage.goto();
	await loginPage.login(user.email, user.password);

	await expect(page).toHaveURL('/');
	await expect(navBar.userMenuButton(user.firstName)).toBeVisible();
});

test('logging in with the wrong password shows an error and does not log in', async ({ page }) => {
	const registerPage = new RegisterPage(page);
	const loginPage = new LoginPage(page);
	const navBar = new NavBar(page);
	const user = makeTestUser();

	await registerPage.goto();
	await registerPage.register(user);
	await navBar.openUserMenu(user.firstName);
	await navBar.signOutButton().click();
	// loginPage.goto() below is a hard navigation, which rehydrates Redux
	// from localStorage - wait for the logged-out state to actually be
	// visible (and therefore persisted) first, or a fresh page load can
	// still pick up the pre-sign-out session.
	await expect(navBar.loginLink).toBeVisible();

	await loginPage.goto();
	await loginPage.login(user.email, 'WrongPassword123!');

	await expect(loginPage.errorAlert).toContainText('Invalid credentials!');
	await expect(page).toHaveURL('/login');
	await expect(navBar.loginLink).toBeVisible();
});
