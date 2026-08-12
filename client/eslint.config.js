import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		files: ['**/*.{ts,tsx}'],
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		languageOptions: {
			ecmaVersion: 2022,
			globals: globals.browser,
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'jsx-a11y': jsxA11y,
		},
		rules: {
			...reactHooks.configs['recommended-latest'].rules,
			...jsxA11y.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			// Pre-existing codebase pattern (73 instances) — real fixes need per-call type
			// modeling, not a blanket rule change. Downgraded to warn rather than ignored.
			'@typescript-eslint/no-explicit-any': 'warn',
		},
	},
	{
		// Playwright test files, not React - the react-hooks plugin's
		// rules-of-hooks rule matches on function names starting with "use",
		// which false-positives on Playwright fixtures' own `use` callback
		// param (an unrelated, official part of the Playwright fixture API).
		files: ['e2e/**/*.ts'],
		rules: {
			'react-hooks/rules-of-hooks': 'off',
			// Destructuring a fixture only to trigger its setup side effect
			// (e.g. `testUser: _testUser` to force a test user to be
			// registered/logged in) without needing the value is a deliberate,
			// common pattern here - Playwright fixtures only run when
			// destructured. The leading underscore is the intentional signal.
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		},
	},
);
