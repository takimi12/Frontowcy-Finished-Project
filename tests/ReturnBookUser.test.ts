import { test, expect } from '@playwright/test'

test('should show return book text for logged in user and handle book return', async ({
	page,
}) => {
	const mockUser = {
		id: '4dd7',
		email: 'test@test.pl',
	}

	await page.goto('http://localhost:5173')

	await page.evaluate((user) => {
		localStorage.setItem('user', JSON.stringify(user))
	}, mockUser)

	await page.reload()

	await page.goto('http://localhost:5173/user')

	await page.waitForSelector('h1:has-text("Twoje wypożyczone książki")')

	const returnButtons = await page
		.getByRole('button', { name: 'Zwróć książkę' })
		.all()
	const noBooksMessage = page.getByText(
		'Nie masz obecnie wypożyczonych książek.',
	)

	if (returnButtons.length > 0) {
		const returnButton = returnButtons[0]
		await expect(returnButton).toBeVisible()
		await returnButton.click()

		const modal = page.getByRole('dialog')
		await expect(modal).toBeVisible()
		await expect(modal).toHaveText(/Książka została zwrócona pomyślnie!/)
	} else {
		await expect(noBooksMessage).toBeVisible()
	}
})
