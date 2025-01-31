import { test, expect } from '@playwright/test'

const TEST_USER = {
	id: 'c4ad',
	name: 'admin',
	surname: 'admin',
	email: 'admin@admin.pl',
	password: '123123',
	borrowedBooks: [],
	cardId: 'jnem32ykz',
	role: 'Admin',
}

test.describe('Testy E2E Aplikacji Bibliotecznej', () => {
	let liczbaKsiazekPoczatkowa: number

	test.beforeEach(async ({ page }) => {
		const response = await fetch('http://localhost:3001/books')
		const books = await response.json()
		liczbaKsiazekPoczatkowa = books.length

		await page.goto('http://localhost:5173')
	})

	test('powinno wyświetlić listę książek z poprawną liczbą', async ({
		page,
	}) => {
		await expect(page.locator('h1')).toContainText('Lista książek')
		const books = page.locator('.MuiCard-root')
		await expect(books).toHaveCount(liczbaKsiazekPoczatkowa)
	})

	test('powinno wyświetlić szczegóły książki', async ({ page }) => {
		await page.waitForSelector('.MuiCard-root')
		await page.locator('text=Szczegóły').first().click()
		await expect(page.url()).toMatch(/\/books\/\d+/)
		await page.waitForSelector('.MuiCard-root')
	})

	test('powinno obsłużyć wypożyczenie książki bez logowania', async ({
		page,
	}) => {
		await page.waitForSelector('button:has-text("Wypożycz")')

		const activeButton = page
			.locator('button:has-text("Wypożycz"):not([disabled])')
			.first()

		await expect(activeButton).toBeEnabled()

		await activeButton.click()

		const dialog = page.locator('.MuiDialog-root')
		await expect(dialog).toBeVisible()
		await expect(dialog).toContainText('Zaloguj się, aby wypożyczyć książkę')
	})

	test.describe('Wypożyczenie książki i liczba dni do zwrotu', () => {
		test.beforeEach(async ({ page }) => {
			await page.addInitScript((user) => {
				localStorage.setItem('user', JSON.stringify(user))
			}, TEST_USER)

			await page.goto('http://localhost:5173')
		})

		test('powinno poprawnie wypożyczyć książkę i obliczyć liczbę dni do zwrotu', async ({
			page,
		}) => {
			await page.waitForSelector('.MuiCard-root')

			const wypozyczButton = page.locator('button:has-text("Wypożycz")').first()
			await wypozyczButton.click()

			const dialog = page.locator('.MuiDialog-root')
			await expect(dialog).toBeVisible()
			await expect(dialog).toContainText(
				'Książka została wypożyczona pomyślnie!',
			)

			await page.locator('.MuiDialog-root button:has-text("Zamknij")').click()
			await expect(dialog).not.toBeVisible()

			await page.waitForSelector('text=Twoje terminy zwrotu')
			const daysText = await page
				.locator('text=Termin zwrotu:')
				.first()
				.textContent()

			const today = new Date()
			const expectedReturnDate = new Date()
			expectedReturnDate.setDate(today.getDate() + 14)
			const expectedReturnDateString = expectedReturnDate.toLocaleDateString()

			expect(daysText).toContain(expectedReturnDateString)
			expect(daysText).toMatch(/\(\d+ dni\)/)
		})
	})
})
