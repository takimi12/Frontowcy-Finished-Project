

import { test, expect } from '@playwright/test'

test('should show return book text for logged in user and handle book return', async ({
	page,
}) => {
	// Create a mock user that matches the User interface
	const mockUser = {
		id: '4dd7',
		email: 'test@test.pl',
	}

	// Navigate to the page first
	await page.goto('http://localhost:5173')

	// Set up mock authentication via localStorage
	await page.evaluate((user) => {
		localStorage.setItem('user', JSON.stringify(user))
	}, mockUser)

	// Reload the page to ensure localStorage is applied
	await page.reload()

	// Navigate to the user page
	await page.goto('http://localhost:5173/user')

	// Wait for the content to load
	await page.waitForSelector('h1:has-text("Twoje wypożyczone książki")')

	// Look for either the return book text or no books message
	const returnButtons = await page
		.getByRole('button', { name: 'Zwróć książkę' })
		.all()
	const noBooksMessage = page.getByText(
		'Nie masz obecnie wypożyczonych książek.',
	)

	if (returnButtons.length > 0) {
		const returnButton = returnButtons[0] // Use first button
		await expect(returnButton).toBeVisible()
		await returnButton.click()

		// Wait for the modal to appear and check the success message
		const modal = page.getByRole('dialog')
		await expect(modal).toBeVisible()
		await expect(modal).toHaveText(/Książka została zwrócona pomyślnie!/)
	} else {
		await expect(noBooksMessage).toBeVisible()
	}
})
