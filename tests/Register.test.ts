import { test, expect } from '@playwright/test'

test.describe('Rejestracja użytkownika', () => {
	test('Poprawna rejestracja użytkownika', async ({ page }) => {
		await page.goto('http://localhost:5173/register')

		await page.fill('input[name="name"]', 'Jan')
		await page.fill('input[name="surname"]', 'Kowalski')
		await page.fill('input[name="email"]', 'jan.kowalski@example.com')
		await page.fill('input[type="password"]', 'securepassword123')

		// Oczekiwanie na alert przed kliknięciem
		const dialogPromise = page.waitForEvent('dialog')

		await page.click('button[type="submit"]')

		const dialog = await dialogPromise
		const alertText = dialog.message()

		// Oczekiwanie na komunikat w alercie
		expect(alertText).toMatch(
			/Zarejestrowano użytkownika z kartą biblioteczną: \w+/,
		)

		await dialog.accept()

		// Możemy sprawdzić, czy po rejestracji nastąpiło przekierowanie do logowania
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

		// Sprawdzamy, czy email nadal jest w polu, ponieważ użytkownik nie został zarejestrowany
		expect(await page.inputValue('input[name="email"]')).toBe('test@test.pl')
	})
})
