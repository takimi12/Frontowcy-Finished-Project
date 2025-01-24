import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Register from './Register'
import { registerUser, checkIfUserExists } from '../api/api'

vi.mock('../api/api', () => ({
	registerUser: vi.fn(),
	checkIfUserExists: vi.fn(),
}))

describe('Register Component', () => {
	it('should render the registration form with all fields', () => {
		render(<Register />)

		expect(screen.getByLabelText(/Imię/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/Nazwisko/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/Hasło/i)).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /Zarejestruj się/i }),
		).toBeInTheDocument()
	})

	it('should call registerUser function with correct data when the form is submitted', async () => {
		const registerMock = vi.fn().mockResolvedValueOnce({ cardId: '12345' })
		const checkIfUserExistsMock = vi.fn().mockResolvedValueOnce(false)

		;(registerUser as ReturnType<typeof vi.fn>).mockImplementation(registerMock)
		;(checkIfUserExists as ReturnType<typeof vi.fn>).mockImplementation(
			checkIfUserExistsMock,
		)

		render(<Register />)

		fireEvent.change(screen.getByLabelText(/Imię/i), {
			target: { value: 'Jan' },
		})
		fireEvent.change(screen.getByLabelText(/Nazwisko/i), {
			target: { value: 'Kowalski' },
		})
		fireEvent.change(screen.getByLabelText(/Email/i), {
			target: { value: 'jan.kowalski@example.com' },
		})
		fireEvent.change(screen.getByLabelText(/Hasło/i), {
			target: { value: 'password123' },
		})

		fireEvent.click(screen.getByRole('button', { name: /Zarejestruj się/i }))

		await waitFor(() =>
			expect(registerMock).toHaveBeenCalledWith({
				name: 'Jan',
				surname: 'Kowalski',
				email: 'jan.kowalski@example.com',
				password: 'password123',
				borrowedBooks: [],
			}),
		)
	})

	it('should show success message when registration is successful', async () => {
		const registerMock = vi.fn().mockResolvedValueOnce({ cardId: '12345' })
		const checkIfUserExistsMock = vi.fn().mockResolvedValueOnce(false)

		;(registerUser as ReturnType<typeof vi.fn>).mockImplementation(registerMock)
		;(checkIfUserExists as ReturnType<typeof vi.fn>).mockImplementation(
			checkIfUserExistsMock,
		)

		const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

		render(<Register />)

		fireEvent.change(screen.getByLabelText(/Imię/i), {
			target: { value: 'Jan' },
		})
		fireEvent.change(screen.getByLabelText(/Nazwisko/i), {
			target: { value: 'Kowalski' },
		})
		fireEvent.change(screen.getByLabelText(/Email/i), {
			target: { value: 'jan.kowalski@example.com' },
		})
		fireEvent.change(screen.getByLabelText(/Hasło/i), {
			target: { value: 'password123' },
		})

		fireEvent.click(screen.getByRole('button', { name: /Zarejestruj się/i }))

		await waitFor(() =>
			expect(alertMock).toHaveBeenCalledWith(
				'Zarejestrowano użytkownika z kartą biblioteczną: 12345',
			),
		)

		alertMock.mockRestore()
	})

	it('should show error message when registration fails', async () => {
		const registerMock = vi
			.fn()
			.mockRejectedValueOnce(new Error('Błąd podczas rejestracji'))
		const checkIfUserExistsMock = vi.fn().mockResolvedValueOnce(false)

		;(registerUser as ReturnType<typeof vi.fn>).mockImplementation(registerMock)
		;(checkIfUserExists as ReturnType<typeof vi.fn>).mockImplementation(
			checkIfUserExistsMock,
		)

		const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

		render(<Register />)

		fireEvent.change(screen.getByLabelText(/Imię/i), {
			target: { value: 'Jan' },
		})
		fireEvent.change(screen.getByLabelText(/Nazwisko/i), {
			target: { value: 'Kowalski' },
		})
		fireEvent.change(screen.getByLabelText(/Email/i), {
			target: { value: 'jan.kowalski@example.com' },
		})
		fireEvent.change(screen.getByLabelText(/Hasło/i), {
			target: { value: 'password123' },
		})

		fireEvent.click(screen.getByRole('button', { name: /Zarejestruj się/i }))

		await waitFor(() =>
			expect(alertMock).toHaveBeenCalledWith('Błąd podczas rejestracji'),
		)

		alertMock.mockRestore()
	})
})
