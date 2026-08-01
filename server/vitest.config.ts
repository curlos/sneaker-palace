import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		restoreMocks: true,
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			exclude: ['dist/**', 'scripts/**', 'types/**', '**/*.config.*', '**/*.test.ts'],
		},
	},
});
