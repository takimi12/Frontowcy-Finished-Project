import { test, expect, Page } from '@playwright/test'

async function setLocalStorage(page: Page, user: object) {
	await page.goto('http://localhost:5173/user')
	await page.evaluate((userData) => {
		localStorage.setItem('user', JSON.stringify(userData))
	}, user)
}

test('Użytkownik zwraca książkę z użyciem localStorage', async ({ page }) => {
	const apiUrl = 'http://localhost:3001'

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

	await setLocalStorage(page, testUser)

	await page.goto('http://localhost:5173/user')

	const returnButton = page.locator('button:has-text("Zwróć książkę")')
	await returnButton.waitFor({ state: 'visible', timeout: 20000 })

	await returnButton.click()

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

	await page.waitForTimeout(2000)

	const dialogLocator = page.locator('[data-testid="return-book-dialog"]')
	await expect(dialogLocator).toHaveCount(1)
	await expect(dialogLocator).toBeVisible()

	const modalMessage = await dialogLocator.textContent()
	expect(modalMessage).toContain('Książka została zwrócona pomyślnie!')

	const borrowedBooks = await page.locator('.MuiCardContent-root').count()
	expect(borrowedBooks).toBe(0)
})
