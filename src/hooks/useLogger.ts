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
			await fetch(`${process.env.BASE_URL}api/logs`, {
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
