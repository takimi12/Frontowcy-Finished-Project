import { test, expect } from '@playwright/test'

test.describe('Rejestracja użytkownika', () => {
	test('Poprawna rejestracja użytkownika', async ({ page }) => {
		// Otwórz stronę rejestracji
		await page.goto('http://localhost:5173/register')

		// Wypełnij pola formularza
		await page.fill('input[name="name"]', 'Jan')
		await page.fill('input[name="surname"]', 'Kowalski')
		await page.fill('input[name="email"]', 'jan.kowalski@example.com')
		await page.fill('input[type="password"]', 'securepassword123')

		// Zarejestruj listener dialogów
		const dialogPromise = page.waitForEvent('dialog')

		// Kliknij przycisk "Zarejestruj się"
		await page.click('button[type="submit"]')

		// Poczekaj na dialog i sprawdź jego zawartość
		const dialog = await dialogPromise
		const alertText = dialog.message()
		expect(alertText).toMatch(
			/Zarejestrowano użytkownika z kartą biblioteczną: \w+/,
		)

		// Akceptuj dialog
		await dialog.accept()
	})

	test('Rejestracja istniejącego użytkownika', async ({ page }) => {
		// Otwórz stronę rejestracji
		await page.goto('http://localhost:5173/register')

		// Wypełnij pola formularza danymi istniejącego użytkownika
		await page.fill('input[name="name"]', 'Jan')
		await page.fill('input[name="surname"]', 'Kowalski')
		await page.fill('input[name="email"]', 'jan.kowalski@example.com')
		await page.fill('input[type="password"]', 'securepassword123')

		// Zarejestruj listener dialogów
		const dialogPromise = page.waitForEvent('dialog')

		// Kliknij przycisk "Zarejestruj się"
		await page.click('button[type="submit"]')

		// Poczekaj na dialog i sprawdź jego zawartość
		const dialog = await dialogPromise
		expect(dialog.message()).toBe(
			'Użytkownik o podanym adresie email już istnieje',
		)

		// Akceptuj dialog
		await dialog.accept()

		// Sprawdź, czy formularz nie został wyczyszczony
		expect(await page.inputValue('input[name="email"]')).toBe(
			'jan.kowalski@example.com',
		)
	})

	test('Resetowanie formularza po udanej rejestracji', async ({ page }) => {
		// Otwórz stronę rejestracji
		await page.goto('http://localhost:5173/register')

		// Wypełnij pola formularza
		await page.fill('input[name="name"]', 'Tomasz')
		await page.fill('input[name="surname"]', 'Nowicki')
		await page.fill('input[name="email"]', 'tomasz.nowicki@example.com')
		await page.fill('input[type="password"]', 'password123')

		// Zarejestruj listener dialogów
		const dialogPromise = page.waitForEvent('dialog')

		// Kliknij przycisk "Zarejestruj się"
		await page.click('button[type="submit"]')

		// Poczekaj na dialog i sprawdź jego zawartość
		const dialog = await dialogPromise
		expect(dialog.message()).toMatch(
			/Zarejestrowano użytkownika z kartą biblioteczną: \w+/,
		)

		// Akceptuj dialog
		await dialog.accept()

		// Sprawdź, czy wszystkie pola formularza zostały wyczyszczone
		expect(await page.inputValue('input[name="name"]')).toBe('')
		expect(await page.inputValue('input[name="surname"]')).toBe('')
		expect(await page.inputValue('input[name="email"]')).toBe('')
		expect(await page.inputValue('input[type="password"]')).toBe('')
	})
})
