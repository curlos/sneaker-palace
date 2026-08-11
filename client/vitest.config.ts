import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/setupTests.ts'],
		// e2e/ holds Playwright specs (separate test runner) — Vitest's default
		// **/*.spec.ts glob would otherwise try to execute them too.
		exclude: [...configDefaults.exclude, 'e2e/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/**/*.{ts,tsx}'],
			exclude: [
				'**/*.config.*',
				'**/*.test.{ts,tsx}',
				'src/main.tsx',
				'src/vite-env.d.ts',
				'src/environment.d.ts',
				'src/test-utils.tsx',
				'src/test-fixtures.ts',
				'src/mocks/**',
				'src/skeleton_loaders/**',
			],
		},
	},
});
