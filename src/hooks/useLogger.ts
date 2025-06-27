export const useLogger = () => {
	const logAction = async ({
		userId,
		userEmail,
		action,
		details,
	}: {
		userId: string
		userEmail: string
		action: string
		details: string
	}) => {
		const logEntry = {
			date: new Date().toISOString(),
			userId,
			action,
			details: `Użytkownik ${userEmail} ${details}`,
		}

		try {
			await fetch('http://localhost:3002/logs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(logEntry),
			})
		} catch (error) {
			console.error('Błąd logowania akcji:', error)
		}
	}

	return { logAction }
}
