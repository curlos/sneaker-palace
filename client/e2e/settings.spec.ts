import { test, expect } from './fixtures/auth';
import { NavBar } from './pages/NavBar';
import { SettingsPage } from './pages/SettingsPage';
import { NewPasswordModal } from './pages/Modals';
import { LoginPage } from './pages/LoginPage';

test('updating account details is reflected live in the nav without a reload', async ({ page, testUser }) => {
	const navBar = new NavBar(page);
	const settings = new SettingsPage(page);
	const updatedFirstName = `Updated${Date.now()}`;

	await navBar.openUserMenu(testUser.firstName);
	await navBar.settingsLink().click();

	await settings.firstNameInput.fill(updatedFirstName);
	await settings.saveButton.click();
	await expect(page.getByText('Settings updated!')).toBeVisible();

	await expect(navBar.userMenuButton(updatedFirstName)).toBeVisible();

	// Reload to confirm the update actually persisted server-side, not just
	// an optimistic UI update.
	await page.reload();
	await expect(navBar.userMenuButton(updatedFirstName)).toBeVisible();
});

test('changing the password updates which credentials can log in', async ({ page, testUser }) => {
	const navBar = new NavBar(page);
	const settings = new SettingsPage(page);
	const passwordModal = new NewPasswordModal(page);
	const loginPage = new LoginPage(page);
	const newPassword = `${testUser.password}-new`;

	await navBar.openUserMenu(testUser.firstName);
	await navBar.settingsLink().click();
	await settings.passwordField.click();
	await passwordModal.changePassword(testUser.password, newPassword);

	await expect(page.getByText('Password updated!')).toBeVisible();
	await expect(passwordModal.dialog).not.toBeVisible({ timeout: 5000 });

	await navBar.openUserMenu(testUser.firstName);
	await navBar.signOutButton().click();

	await loginPage.goto();
	await loginPage.login(testUser.email, testUser.password);
	await expect(loginPage.errorAlert).toContainText('Invalid credentials!');

	await loginPage.login(testUser.email, newPassword);
	await expect(page).toHaveURL('/');
});
