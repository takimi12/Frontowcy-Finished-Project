import axios from 'axios'

const API_URL = 'http://localhost:3001'

export interface User {
	id: string
	name: string
	surname: string
	email: string
	cardId: string
	password: string
	role: string
	borrowedBooks: string[]
}

export interface Log {
	id: string
	date: string
	userId: string
	action: string
	details: string
}

export const registerUser = async (
	user: Omit<User, 'id' | 'cardId' | 'role'>,
) => {
	try {
		const cardId = Math.random().toString(36).substr(2, 9) // Generowanie unikalnego kodu karty
		const response = await axios.post(`${API_URL}/users`, {
			...user,
			cardId,
			role: 'Klient',
			borrowedBooks: [], // Inicjalizacja borrowedBooks jako pustej tablicy
		})

		const newUser = response.data

		// Zapisanie logu systemowego po pomyślnej rejestracji
		await axios.post(`${API_URL}/logs`, {
			date: new Date().toISOString(),
			userId: newUser.id,
			action: 'Rejestracja',
			details: `Zarejestrowano użytkownika ${newUser.email}`,
		})

		return newUser
	} catch (error) {
		console.error('Błąd podczas rejestracji użytkownika:', error)
		throw new Error('Nie udało się zarejestrować użytkownika.')
	}
}

export const loginUser = async (cardId: string, password: string) => {
	try {
		const response = await axios.get(
			`${API_URL}/users?cardId=${cardId}&password=${password}`,
		)
		if (response.data.length > 0) {
			const user = response.data[0]

			// Zapisanie logu systemowego po pomyślnym logowaniu
			await axios.post(`${API_URL}/logs`, {
				date: new Date().toISOString(),
				userId: user.id,
				action: 'Logowanie',
				details: `Użytkownik ${user.email} zalogował się.`,
			})

			return user
		}
		throw new Error('Invalid credentials')
	} catch (error) {
		console.error('Błąd podczas logowania:', error)
		throw new Error('Nie udało się zalogować.')
	}
}

export const logAction = async (log: Omit<Log, 'id'>) => {
	await axios.post(`${API_URL}/logs`, log)
}

export const checkIfUserExists = async (email: string) => {
	try {
		const response = await axios.get(`${API_URL}/users?email=${email}`)
		return response.data.length > 0 // Zwraca true, jeśli użytkownik istnieje
	} catch (error) {
		console.error('Błąd podczas sprawdzania istnienia użytkownika:', error)
		throw new Error('Nie udało się sprawdzić, czy użytkownik istnieje.')
	}
}
