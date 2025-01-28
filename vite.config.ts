/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: './vitest.setup.ts',
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'json', 'html'],
		},
		// Add these lines to explicitly include/exclude test files
		include: ['src/**/*.spec.tsx', 'src/**/*.test.ts'],
		exclude: ['**/e2e/**', '**/*.e2e.ts'],
	},
})
