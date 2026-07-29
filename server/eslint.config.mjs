import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		files: ['**/*.ts'],
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		languageOptions: {
			ecmaVersion: 2022,
			globals: globals.node,
		},
		rules: {
			// Pre-existing codebase pattern — real fixes need per-call type modeling,
			// not a blanket rule change. Downgraded to warn rather than ignored.
			'@typescript-eslint/no-explicit-any': 'warn',
			// Codebase idiom: `const { password, ...safeUser } = doc` to strip a field
			// before sending a response — `password` itself is intentionally unused.
			'@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
		},
	}
);
