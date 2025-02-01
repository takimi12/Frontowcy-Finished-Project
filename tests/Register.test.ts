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

		await expect(page).toHaveURL('http://localhost:5173/login')
	})

	test('Rejestracja istniejącego użytkownika', async ({ page }) => {
		await page.goto('http://localhost:5173/register')

		await page.fill('input[name="name"]', 'test')
		await page.fill('input[name="surname"]', 'testowany')
		await page.fill('input[name="email"]', 'test@test.pl')
		await page.fill('input[type="password"]', '123123')

		const dialogPromise = page.waitForEvent('dialog')

		await page.click('button[type="submit"]')

		const dialog = await dialogPromise
		expect(dialog.message()).toBe(
			'Użytkownik o podanym adresie email już istnieje',
		)

		await dialog.accept()

		expect(await page.inputValue('input[name="email"]')).toBe('test@test.pl')
	})
})
