export interface TestUser {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

/**
 * Every test that needs an account gets its own throwaway user (unique email
 * per call) so tests never collide with each other or with real dev data in
 * the local Mongo instance.
 */
export function makeTestUser(): TestUser {
	const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

	return {
		email: `e2e_${unique}@example.com`,
		password: 'TestPassword123!',
		firstName: 'E2E',
		lastName: `Tester${unique}`,
	};
}
