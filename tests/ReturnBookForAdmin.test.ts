import { test, expect } from '@playwright/test'

test('Kliknięcie przycisku "Wymuś zwrot" i potwierdzenie w oknie dialogowym', async ({
	page,
}) => {
	await page.goto('http://localhost:5173/')
	await page.evaluate(() => {
		localStorage.setItem(
			'user',
			JSON.stringify({
				email: 'admin@admin.pl',
				password: '123123',
				cardId: '1e2ucxoya',
				role: 'Admin',
			}),
		)
	})

	await page.goto('http://localhost:5173/admin')

	await page.waitForSelector('[data-testid="book-card"]')

	const forceReturnButton = await page.$('[data-testid="force-return-button"]')
	expect(forceReturnButton).not.toBeNull()

	if (forceReturnButton) {
		page.on('dialog', async (dialog) => {
			expect(dialog.message()).toBe(
				'Czy na pewno chcesz wymusić zwrot tej książki?',
			)

			await dialog.accept()
		})

		await forceReturnButton.click()
	}
})

test('Sprawdź, czy strona nie wyświetla danych dla niezalogowanego użytkownika', async ({
	page,
}) => {
	await page.goto('http://localhost:5173/')

	await page.goto('http://localhost:5173/admin')

	await page.waitForSelector('body')

	const forceReturnButton = await page.$('[data-testid="force-return-button"]')
	expect(forceReturnButton).toBeNull()

	const bookCards = await page.$$('[data-testid="book-card"]')
	expect(bookCards.length).toBe(0)

	const editButton = await page.$('button:has-text("Edytuj")')
	const deleteButton = await page.$('button:has-text("Usuń")')
	expect(editButton).toBeNull()
	expect(deleteButton).toBeNull()

	const accessDeniedMessage = await page.$('text="Brak dostępu"')
	const loginPrompt = await page.$('text="Zaloguj się"')
	expect(accessDeniedMessage || loginPrompt).not.toBeNull()
})
