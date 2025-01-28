import { test, expect } from '@playwright/test'

test.describe('Rejestracja użytkownika', () => {
	test('Poprawna rejestracja użytkownika', async ({ page }) => {
		await page.goto('http://localhost:5173/register')

		await page.fill('input[name="name"]', 'Jan')
		await page.fill('input[name="surname"]', 'Kowalski')
		await page.fill('input[name="email"]', 'jan.kowalski@example.com')
		await page.fill('input[type="password"]', 'securepassword123')

		const dialogPromise = page.waitForEvent('dialog')

		await page.click('button[type="submit"]')

		const dialog = await dialogPromise
		const alertText = dialog.message()
		expect(alertText).toMatch(
			/Zarejestrowano użytkownika z kartą biblioteczną: \w+/,
		)

		await dialog.accept()
	})

	test('Rejestracja istniejącego użytkownika', async ({ page }) => {
		await page.goto('http://localhost:5173/register')

		await page.fill('input[name="name"]', 'Jan')
		await page.fill('input[name="surname"]', 'Kowalski')
		await page.fill('input[name="email"]', 'jan.kowalski@example.com')
		await page.fill('input[type="password"]', 'securepassword123')

		const dialogPromise = page.waitForEvent('dialog')

		await page.click('button[type="submit"]')

		const dialog = await dialogPromise
		expect(dialog.message()).toBe(
			'Użytkownik o podanym adresie email już istnieje',
		)

		await dialog.accept()

		expect(await page.inputValue('input[name="email"]')).toBe(
			'jan.kowalski@example.com',
		)
	})

	test('Resetowanie formularza po udanej rejestracji', async ({ page }) => {
		await page.goto('http://localhost:5173/register')

		await page.fill('input[name="name"]', 'Tomasz')
		await page.fill('input[name="surname"]', 'Nowicki')
		await page.fill('input[name="email"]', 'tomasz.nowicki@example.com')
		await page.fill('input[type="password"]', 'password123')

		const dialogPromise = page.waitForEvent('dialog')

		await page.click('button[type="submit"]')

		const dialog = await dialogPromise
		expect(dialog.message()).toMatch(
			/Zarejestrowano użytkownika z kartą biblioteczną: \w+/,
		)

		await dialog.accept()

		expect(await page.inputValue('input[name="name"]')).toBe('')
		expect(await page.inputValue('input[name="surname"]')).toBe('')
		expect(await page.inputValue('input[name="email"]')).toBe('')
		expect(await page.inputValue('input[type="password"]')).toBe('')
	})
})
