import { test, expect } from '@playwright/test'

test.describe('Komponent BooksList', () => {
	const BASE_URL = 'http://localhost:5173'

	const TEST_USER = {
		id: '991d',
		name: 'ada1',
		surname: 'ada1',
		email: 'adam@adam.pl',
		password: '123123',
		cardId: 'iuum0bl8n',
		role: 'Klient',
		borrowedBooks: [],
	}

	test.describe('Wypozyczanie ksiazek', () => {
		test.beforeEach(async ({ page, context }) => {
			await context.addInitScript((user) => {
				localStorage.setItem('user', JSON.stringify(user))
			}, TEST_USER)

			await page.goto(`${BASE_URL}/books`)

			await page.waitForSelector('div[class*="MuiCard-root"]', {
				state: 'visible',
				timeout: 10000,
			})
		})

		test('może pomyślnie wypożyczyć dostępną książkę', async ({ page }) => {
			const bookCards = page.locator('div[class*="MuiCard-root"]')
			const bookCount = await bookCards.count()

			let borrowedSuccessfully = false
			for (let i = 0; i < bookCount; i++) {
				const bookCard = bookCards.nth(i)
				const availableCopiesText =
					(await bookCard.getByText(/Dostępne egzemplarze:/).textContent()) ||
					''

				if (!availableCopiesText.includes('Brak dostępnych egzemplarzy')) {
					const borrowButton = bookCard.getByRole('button', {
						name: /Wypożycz/i,
					})

					try {
						await borrowButton.click({ timeout: 5000 })
						borrowedSuccessfully = true
						break
					} catch (error) {
						console.log(`Nie udało się wypożyczyć książki na indeksie ${error}`)
					}
				}
			}

			expect(borrowedSuccessfully).toBe(true)

			const successModal = page.getByRole('dialog')
			await expect(successModal).toBeVisible()
			await expect(
				successModal.getByText('Książka została wypożyczona pomyślnie!'),
			).toBeVisible()

			await page.getByRole('button', { name: /Zamknij/i }).click()
		})

		test('obsługuje książki bez dostępnych egzemplarzy', async ({ page }) => {
			const bookCards = page.locator('div[class*="MuiCard-root"]')
			const bookCount = await bookCards.count()

			let noAvailableCopiesFound = false
			for (let i = 0; i < bookCount; i++) {
				const bookCard = bookCards.nth(i)
				const availableCopiesText =
					(await bookCard.getByText(/Dostępne egzemplarze:/).textContent()) ||
					''

				if (availableCopiesText.includes('Brak dostępnych egzemplarzy')) {
					const borrowButton = bookCard.getByRole('button', {
						name: /Wypożycz/i,
					})
					await expect(borrowButton).toBeDisabled()
					noAvailableCopiesFound = true
					break
				}
			}

			expect(noAvailableCopiesFound).toBe(true)
		})
	})

	test.describe('Niezalogowany użytkownik', () => {
		test.beforeEach(async ({ page, context }) => {
			await context.addInitScript(() => {
				localStorage.removeItem('user')
			})

			await page.goto(`${BASE_URL}/books`)

			await page.waitForSelector('div[class*="MuiCard-root"]', {
				state: 'visible',
				timeout: 10000,
			})
		})

		test('wyświetla modal logowania przy próbie wypożyczenia bez autoryzacji', async ({
			page,
		}) => {
			const bookCards = page.locator('div[class*="MuiCard-root"]')
			const bookCount = await bookCards.count()

			for (let i = 0; i < bookCount; i++) {
				const bookCard = bookCards.nth(i)
				const availableCopiesText =
					(await bookCard.getByText(/Dostępne egzemplarze:/).textContent()) ||
					''

				if (!availableCopiesText.includes('Brak dostępnych egzemplarzy')) {
					const borrowButton = bookCard.getByRole('button', {
						name: /Wypożycz/i,
					})

					await borrowButton.click()

					const loginModal = page.getByRole('dialog')
					await expect(loginModal).toBeVisible()
					await expect(
						loginModal.getByText('Zaloguj się, aby wypożyczyć książkę'),
					).toBeVisible()

					break
				}
			}
		})
	})
})
