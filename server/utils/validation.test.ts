import { isValidEmail } from './validation';

describe('isValidEmail', () => {
	it('accepts a valid email', () => {
		expect(isValidEmail('user@example.com')).toBe(true);
	});

	it('rejects an email missing an @', () => {
		expect(isValidEmail('userexample.com')).toBe(false);
	});

	it('rejects an email missing a domain', () => {
		expect(isValidEmail('user@')).toBe(false);
	});
});
