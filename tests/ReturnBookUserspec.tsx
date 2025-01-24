import { test, expect, Page } from '@playwright/test'

// Funkcja do zapisywania stanu użytkownika w localStorage
async function setLocalStorage(page: Page, user: object) {
	await page.goto('http://localhost:5173/user') // Załaduj stronę, żeby mieć dostęp do localStorage
	await page.evaluate((userData) => {
		localStorage.setItem('user', JSON.stringify(userData)) // Ustaw dane w localStorage
	}, user)
}

test('Użytkownik zwraca książkę z użyciem localStorage', async ({ page }) => {
	const apiUrl = 'http://localhost:3001' // Adres API

	// Przygotowanie danych testowych
	const testUser = {
		id: '991d',
		name: 'ada1',
		surname: 'ada1',
		email: 'adam@adam.pl',
		password: '123123',
		cardId: 'iuum0bl8n',
		role: 'Klient',
		borrowedBooks: ['Władca Pierścieni: Drużyna Pierścienia'],
	}

	const testBook = {
		id: '1',
		title: 'Władca Pierścieni: Drużyna Pierścienia',
		author: 'J.R.R. Tolkien',
		description: 'Pierwsza część trylogii Władca Pierścieni.',
		year: 1954,
		copies: 5,
		borrowedBy: ['iuum0bl8n'],
	}

	const testBorrowing = {
		id: 'borrowing1',
		userId: '991d',
		bookId: '1',
		borrowDate: '2025-01-01T00:00:00.000Z',
		expectedreturnDate: '2025-01-15T00:00:00.000Z',
		returnDate: '',
	}

	// Mockowanie odpowiedzi z API
	await page.route(`${apiUrl}/books`, (route) =>
		route.fulfill({
			status: 200,
			body: JSON.stringify([testBook]),
		}),
	)

	await page.route(`${apiUrl}/borrowings`, (route) =>
		route.fulfill({
			status: 200,
			body: JSON.stringify([testBorrowing]),
		}),
	)

	await page.route(`${apiUrl}/users`, (route) =>
		route.fulfill({
			status: 200,
			body: JSON.stringify([testUser]),
		}),
	)

	// Ustawienie danych użytkownika w localStorage
	await setLocalStorage(page, testUser)

	// Przejście na stronę aplikacji
	await page.goto('http://localhost:5173/user')

	// Czekanie na załadowanie elementu "Zwróć książkę" (przycisk)
	const returnButton = page.locator('button:has-text("Zwróć książkę")')
	await returnButton.waitFor({ state: 'visible', timeout: 20000 })

	// Kliknięcie przycisku "Zwróć książkę"
	await returnButton.click()

	// Mockowanie odpowiedzi API po zwróceniu książki
	await page.route(`${apiUrl}/borrowings/borrowing1`, (route) =>
		route.fulfill({
			status: 200,
			body: JSON.stringify({
				...testBorrowing,
				returnDate: '2025-01-23T00:00:00.000Z',
			}),
		}),
	)

	await page.route(`${apiUrl}/books/1`, (route) =>
		route.fulfill({
			status: 200,
			body: JSON.stringify({
				...testBook,
				borrowedBy: testBook.borrowedBy.filter((id) => id !== testUser.cardId),
			}),
		}),
	)

	await page.route(`${apiUrl}/users/991d`, (route) =>
		route.fulfill({
			status: 200,
			body: JSON.stringify({
				...testUser,
				borrowedBooks: testUser.borrowedBooks.filter(
					(book) => book !== testBook.title,
				),
			}),
		}),
	)

	// Opóźnienie przed sprawdzeniem dialogu
	await page.waitForTimeout(2000)

	// Czekanie na dialog

	// Poczekaj na pojawienie się dialogu
	const dialogLocator = page.locator('[data-testid="return-book-dialog"]') // Użycie data-testid
	await expect(dialogLocator).toHaveCount(1) // Sprawdzenie, czy dialog istnieje
	await expect(dialogLocator).toBeVisible() // Czekaj, aż dialog będzie widoczny

	// Sprawdzenie komunikatu o powodzeniu
	const modalMessage = await dialogLocator.textContent()
	expect(modalMessage).toContain('Książka została zwrócona pomyślnie!')

	// Sprawdzenie, czy książka została usunięta z listy wypożyczonych książek
	const borrowedBooks = await page.locator('.MuiCardContent-root').count()
	expect(borrowedBooks).toBe(0) // Książka powinna zniknąć
})
