import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{ ignores: ['dist'] }, // Ignoruj katalog `dist`
	{
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommended, // Zalecane ustawienia TypeScript ESLint
		],
		files: ['**/*.{ts,tsx}'], // Lintuj tylko pliki TS i TSX
		languageOptions: {
			ecmaVersion: 2020, // Obsługa składni ES2020
			globals: globals.browser, // Globalne zmienne przeglądarki (np. `window`, `document`)
		},
		plugins: {
			'react-hooks': reactHooks, // Obsługa React Hooks
			'react-refresh': reactRefresh, // Wtyczka React Refresh
		},
		rules: {
			...reactHooks.configs.recommended.rules, // Zalecane reguły dla React Hooks
			'react-refresh/only-export-components': [
				'warn', // Ostrzeż, jeśli komponenty są źle eksportowane
				{ allowConstantExport: true },
			],
			'@typescript-eslint/no-explicit-any': 'warn', // Wyświetlaj ostrzeżenie dla typu `any`
		},
	},
)
