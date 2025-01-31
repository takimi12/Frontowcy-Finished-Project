import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Register from './Register'
import * as api from '../api/api'

// Mock the API functions
vi.mock('../api/api', () => ({
	checkIfUserExists: vi.fn(),
	registerUser: vi.fn(),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return {
		...actual,
		useNavigate: () => mockNavigate,
	}
})

const renderRegisterComponent = () => {
	return render(
		<BrowserRouter>
			<Register />
		</BrowserRouter>,
	)
}

describe('Register Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders registration form with all required fields', () => {
		renderRegisterComponent()

		expect(screen.getByLabelText(/imię/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/nazwisko/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /zarejestruj się/i }),
		).toBeInTheDocument()
	})

	it('displays error for short password', async () => {
		renderRegisterComponent()

		const passwordInput = screen.getByLabelText(/hasło/i)
		await userEvent.type(passwordInput, '12345')

		const form = screen.getByRole('form')
		await fireEvent.submit(form)

		await waitFor(() => {
			expect(
				screen.getByText(/hasło musi mieć co najmniej 6 znaków/i),
			).toBeInTheDocument()
		})
	})

	it('handles successful registration', async () => {
		const mockUser = { cardId: '123ABC' } // przykładowy alfanumeryczny ID
		vi.mocked(api.checkIfUserExists).mockResolvedValue(false)
		vi.mocked(api.registerUser).mockResolvedValue(mockUser)

		renderRegisterComponent()

		await userEvent.type(screen.getByLabelText(/imię/i), 'Jan')
		await userEvent.type(screen.getByLabelText(/nazwisko/i), 'Kowalski')
		await userEvent.type(screen.getByLabelText(/email/i), 'jan@example.com')
		await userEvent.type(screen.getByLabelText(/hasło/i), 'password123')

		const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

		const form = screen.getByRole('form')
		await fireEvent.submit(form)

		await waitFor(() => {
			expect(api.checkIfUserExists).toHaveBeenCalledWith('jan@example.com')
			expect(api.registerUser).toHaveBeenCalledWith({
				name: 'Jan',
				surname: 'Kowalski',
				email: 'jan@example.com',
				password: 'password123',
				borrowedBooks: [],
			})
			expect(alertMock).toHaveBeenCalledWith(
				`Zarejestrowano użytkownika z kartą biblioteczną: ${mockUser.cardId}`,
			)
			expect(mockNavigate).toHaveBeenCalledWith('/login')
		})
	})
	it('handles existing user error', async () => {
		vi.mocked(api.checkIfUserExists).mockResolvedValue(true)

		renderRegisterComponent()

		await userEvent.type(screen.getByLabelText(/imię/i), 'Jan')
		await userEvent.type(screen.getByLabelText(/nazwisko/i), 'Kowalski')
		await userEvent.type(screen.getByLabelText(/email/i), 'jan@example.com')
		await userEvent.type(screen.getByLabelText(/hasło/i), 'password123')

		const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

		const form = screen.getByRole('form')
		await fireEvent.submit(form)

		await waitFor(() => {
			expect(alertMock).toHaveBeenCalledWith(
				'Użytkownik o podanym adresie email już istnieje',
			)
			expect(api.registerUser).not.toHaveBeenCalled()
		})
	})

	it('handles API error during registration', async () => {
		vi.mocked(api.checkIfUserExists).mockResolvedValue(false)
		vi.mocked(api.registerUser).mockRejectedValue(
			new Error('Błąd podczas rejestracji'),
		)

		renderRegisterComponent()

		await userEvent.type(screen.getByLabelText(/imię/i), 'Jan')
		await userEvent.type(screen.getByLabelText(/nazwisko/i), 'Kowalski')
		await userEvent.type(screen.getByLabelText(/email/i), 'jan@example.com')
		await userEvent.type(screen.getByLabelText(/hasło/i), 'password123')

		const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

		const form = screen.getByRole('form')
		await fireEvent.submit(form)

		await waitFor(() => {
			expect(alertMock).toHaveBeenCalledWith('Błąd podczas rejestracji')
		})
	})
})
