import { test, expect } from '@playwright/test'

test.describe('Komponent logowania', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:5173/login')
	})

	test('powinien umożliwić użytkownikowi pomyślne zalogowanie', async ({
		page,
	}) => {
		await page.fill('input[name="cardId"]', 'iuum0bl8n')
		await page.fill('input[name="password"]', '123123')
		page.on('dialog', async (dialog) => {
			expect(dialog.message()).toBe('Zalogowano pomyślnie!')
			await dialog.accept()
		})
		await page.click('button[type="submit"]')
	})

	test('powinien wyświetlić komunikat o błędzie, gdy logowanie się nie powiedzie', async ({
		page,
	}) => {
		await page.fill('input[name="cardId"]', 'wrongCardId')
		await page.fill('input[name="password"]', 'wrongPassword')
		page.on('dialog', async (dialog) => {
			expect(dialog.message()).toBe('Błąd logowania')
			await dialog.accept()
		})
		await page.click('button[type="submit"]')
	})

	test('powinien wyświetlić komunikat o błędzie, gdy cardId jest puste', async ({
		page,
	}) => {
		await page.fill('input[name="password"]', '123123')
		await page.click('button[type="submit"]')
		await expect(page.locator('input[name="cardId"]')).toHaveAttribute(
			'aria-invalid',
			'true',
		)
		await expect(page.locator('text=Numer karty jest wymagany')).toBeVisible()
	})

	test('powinien wyświetlić komunikat o błędzie, gdy hasło jest puste', async ({
		page,
	}) => {
		await page.fill('input[name="cardId"]', 'iuum0bl8n')
		await page.click('button[type="submit"]')
		await expect(page.locator('input[name="password"]')).toHaveAttribute(
			'aria-invalid',
			'true',
		)
		await expect(page.locator('text=Hasło jest wymagane')).toBeVisible()
	})

	test('powinien wyświetlić komunikat o błędzie, gdy cardId jest za krótkie', async ({
		page,
	}) => {
		await page.fill('input[name="cardId"]', '123')
		await page.fill('input[name="password"]', '123123')
		await page.click('button[type="submit"]')
		await expect(
			page.locator('text=Numer karty musi zawierać od 4 do 16 cyfr'),
		).toBeVisible()
	})

	test('powinien wyświetlić komunikat o błędzie, gdy hasło jest za krótkie', async ({
		page,
	}) => {
		await page.fill('input[name="cardId"]', 'iuum0bl8n')
		await page.fill('input[name="password"]', '123')
		await page.click('button[type="submit"]')
		await expect(
			page.locator('text=Hasło musi mieć co najmniej 6 znaków'),
		).toBeVisible()
	})

	test('powinien wyświetlić komunikaty o błędach walidacji dla niepoprawnych danych w formularzu', async ({
		page,
	}) => {
		await page.click('button[type="submit"]')
		await expect(page.locator('text=Numer karty jest wymagany')).toBeVisible()
		await expect(page.locator('text=Hasło jest wymagane')).toBeVisible()
	})

	test('powinien włączyć przycisk logowania, gdy formularz jest poprawny', async ({
		page,
	}) => {
		await page.fill('input[name="cardId"]', 'iuum0bl8n')
		await page.fill('input[name="password"]', '123123')
		const loginButton = page.locator('button[type="submit"]')
		await expect(loginButton).toBeEnabled()
	})

	test('powinien wyświetlić komunikat o błędzie serwera, jeśli żądanie logowania nie powiedzie się', async ({
		page,
	}) => {
		page.on('dialog', async (dialog) => {
			expect(dialog.message()).toBe('Błąd logowania')
			await dialog.accept()
		})
		await page.fill('input[name="cardId"]', 'iuum0bl8n')
		await page.fill('input[name="password"]', 'wrongPassword')
		await page.click('button[type="submit"]')
	})
})
