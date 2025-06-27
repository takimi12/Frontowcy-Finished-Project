import axios from 'axios'

const API_URL = 'http://localhost:3002'

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
		const cardId = Math.random().toString(36).substr(2, 9)

		const userToRegister = {
			...user,
			cardId,
			role: 'Klient',
			borrowedBooks: [],
		}

		const response = await axios.post(`${API_URL}/users`, userToRegister)

		const newUser = { ...response.data, cardId }

		await axios.post(`${API_URL}/logs`, {
			date: new Date().toISOString(),
			userId: newUser.id,
			action: 'Rejestracja',
			details: `Zarejestrowano użytkownika ${newUser.email}`,
		})

		return newUser
	} catch (error) {
		console.error('Błąd podczas rejestracji użytkownika:', error)
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || 'Nie udało się zarejestrować użytkownika.',
			)
		}
		throw new Error('Nie udało się zarejestrować użytkownika.')
	}
}

export const loginUser = async (cardId: string, password: string) => {
	try {
		const response = await axios.get(`${API_URL}/users`, {
			params: {
				cardId,
				password,
			},
		})

		const user = response.data

		await axios.post(`${API_URL}/logs`, {
			date: new Date().toISOString(),
			userId: user.id,
			action: 'Logowanie',
			details: `Użytkownik ${user.email} zalogował się.`,
		})

		return user
	} catch (error) {
		console.error('Błąd podczas logowania:', error)
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error || 'Nie udało się zalogować.')
		}
		throw new Error('Nie udało się zalogować.')
	}
}

export const logAction = async (log: Omit<Log, 'id'>) => {
	try {
		await axios.post(`${API_URL}/logs`, log)
	} catch (error) {
		console.error('Błąd podczas logowania akcji:', error)
	}
}

export const checkIfUserExists = async (email: string) => {
	try {
		const response = await axios.get(`${API_URL}/users?email=${email}`)
		return response.data.length > 0
	} catch (error) {
		console.error('Błąd podczas sprawdzania istnienia użytkownika:', error)
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error ||
					'Nie udało się sprawdzić, czy użytkownik istnieje.',
			)
		}
		throw new Error('Nie udało się sprawdzić, czy użytkownik istnieje.')
	}
}
