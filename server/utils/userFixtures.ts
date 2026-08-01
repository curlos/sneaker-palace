let userCounter = 0;

export function buildUser(overrides: Record<string, unknown> = {}) {
	userCounter += 1;
	const email = `user${userCounter}@example.com`;

	return {
		email,
		lowerCaseEmail: email,
		password: 'password123',
		firstName: 'Test',
		lastName: 'User',
		...overrides,
	};
}
