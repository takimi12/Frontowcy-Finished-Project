import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Login from './Login'
import { useAuth } from '../context/AuthContext'
import { act } from 'react-dom/test-utils'

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
	useAuth: vi.fn(),
}))

describe('Login Component', () => {
	// Reset mocks before each test
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(window, 'alert').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	const mockAuthContext = {
		user: null,
		login: vi.fn(),
		logout: vi.fn(),
	}

	it('should render login form with cardId and password fields', () => {
		vi.mocked(useAuth).mockReturnValue(mockAuthContext)

		render(<Login />)

		expect(screen.getByLabelText(/Numer karty/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/Hasło/i)).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Zaloguj/i })).toBeInTheDocument()
	})

	it('should validate form inputs before submission', async () => {
		vi.mocked(useAuth).mockReturnValue(mockAuthContext)

		render(<Login />)

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: /Zaloguj/i }))
		})

		expect(screen.getByText(/Numer karty jest wymagany/i)).toBeInTheDocument()
		expect(screen.getByText(/Hasło jest wymagane/i)).toBeInTheDocument()
	})

	it('should validate card ID format', async () => {
		vi.mocked(useAuth).mockReturnValue(mockAuthContext)

		render(<Login />)

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/Numer karty/i), {
				target: { value: '123' },
			})
			fireEvent.change(screen.getByLabelText(/Hasło/i), {
				target: { value: 'validpassword' },
			})
			fireEvent.click(screen.getByRole('button', { name: /Zaloguj/i }))
		})

		expect(
			screen.getByText(
				/Numer karty musi zawierać od 9 do 10 znaków alfanumerycznych/i,
			),
		).toBeInTheDocument()
	})

	it('should call login function when form is submitted with correct data', async () => {
		const loginMock = vi.fn().mockResolvedValueOnce(undefined)
		vi.mocked(useAuth).mockReturnValue({
			...mockAuthContext,
			login: loginMock,
		})

		render(<Login />)

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/Numer karty/i), {
				target: { value: '123456789' },
			})
			fireEvent.change(screen.getByLabelText(/Hasło/i), {
				target: { value: 'password123' },
			})

			fireEvent.click(screen.getByRole('button', { name: /Zaloguj/i }))
		})

		await waitFor(() => {
			expect(loginMock).toHaveBeenCalledWith('123456789', 'password123')
		})
	})

	it('should show success message when login is successful', async () => {
		const loginMock = vi.fn().mockResolvedValueOnce(undefined)
		vi.mocked(useAuth).mockReturnValue({
			...mockAuthContext,
			login: loginMock,
		})

		render(<Login />)

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/Numer karty/i), {
				target: { value: '123456789' },
			})
			fireEvent.change(screen.getByLabelText(/Hasło/i), {
				target: { value: 'password123' },
			})

			fireEvent.click(screen.getByRole('button', { name: /Zaloguj/i }))
		})

		await waitFor(() => {
			expect(window.alert).toHaveBeenCalledWith('Zalogowano pomyślnie!')
		})
	})

	it('should show error message when login fails', async () => {
		const loginError = new Error('Błąd logowania')
		const loginMock = vi.fn().mockRejectedValueOnce(loginError)
		vi.mocked(useAuth).mockReturnValue({
			...mockAuthContext,
			login: loginMock,
		})

		render(<Login />)

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/Numer karty/i), {
				target: { value: '123456789' },
			})
			fireEvent.change(screen.getByLabelText(/Hasło/i), {
				target: { value: 'password123' },
			})

			fireEvent.click(screen.getByRole('button', { name: /Zaloguj/i }))
		})

		await waitFor(() => {
			expect(window.alert).toHaveBeenCalledWith(`Błąd logowania ${loginError}`)
		})
	})
})
