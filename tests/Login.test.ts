import { test, expect } from '@playwright/test'
import axios from 'axios'

const API_URL = 'http://localhost:3001'

test.describe('Komponent logowania', () => {
	const testUser = {
		cardId: 'lr090fz3e',
		password: '123123',
	}

	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:5173/login')
	})

	test('powinien umożliwić użytkownikowi pomyślne zalogowanie i utworzyć log', async ({
		page,
	}) => {
		const initialLogsResponse = await axios.get(`${API_URL}/logs`)
		const initialLogsCount = initialLogsResponse.data.length

		await page.fill('input[name="cardId"]', testUser.cardId)
		await page.fill('input[name="password"]', testUser.password)

		page.on('dialog', async (dialog) => {
			expect(dialog.message()).toBe('Zalogowano pomyślnie!')
			await dialog.accept()
		})

		await Promise.all([
			page.click('button[type="submit"]'),
			page.waitForNavigation({ url: '**/user' }),
		])

		await new Promise((resolve) => setTimeout(resolve, 2000))

		const logsResponse = await axios.get(`${API_URL}/logs`)
		const currentLogs = logsResponse.data

		expect(currentLogs.length).toBe(initialLogsCount + 1)

		const loginLog = currentLogs[currentLogs.length - 1]

		expect(loginLog).toBeTruthy()
		expect(loginLog.action).toBe('Logowanie')
		expect(loginLog.details).toContain('zalogował się')

		const logTime = new Date(loginLog.date).getTime()
		const now = new Date().getTime()
		expect(logTime).toBeLessThanOrEqual(now)
		expect(logTime).toBeGreaterThan(now - 10000)
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
})
