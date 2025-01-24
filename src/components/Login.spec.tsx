import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Login from './Login'
import { useAuth } from '../context/AuthContext'

vi.mock('../context/AuthContext', () => ({
	useAuth: vi.fn(() => ({
		login: vi.fn(), // Mock the login function
	})),
}))

describe('Login Component', () => {
	it('should render login form with cardId and password fields', () => {
		render(<Login />)

		expect(screen.getByLabelText(/Numer karty/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/Hasło/i)).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Zaloguj/i })).toBeInTheDocument()
	})

	it('should call login function when form is submitted with correct data', async () => {
		const loginMock = vi.fn().mockResolvedValueOnce(undefined)
		;(useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ login: loginMock })

		const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

		render(<Login />)

		fireEvent.change(screen.getByLabelText(/Numer karty/i), {
			target: { value: '12345' },
		})
		fireEvent.change(screen.getByLabelText(/Hasło/i), {
			target: { value: 'password' },
		})

		fireEvent.click(screen.getByRole('button', { name: /Zaloguj/i }))

		await waitFor(() =>
			expect(loginMock).toHaveBeenCalledWith('12345', 'password'),
		)

		alertMock.mockRestore()
	})

	it('should show success message when login is successful', async () => {
		const loginMock = vi.fn().mockResolvedValueOnce(undefined)
		;(useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ login: loginMock })

		const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

		render(<Login />)

		fireEvent.change(screen.getByLabelText(/Numer karty/i), {
			target: { value: '12345' },
		})
		fireEvent.change(screen.getByLabelText(/Hasło/i), {
			target: { value: 'password' },
		})

		fireEvent.click(screen.getByRole('button', { name: /Zaloguj/i }))

		await waitFor(() =>
			expect(alertMock).toHaveBeenCalledWith('Zalogowano pomyślnie!'),
		)

		alertMock.mockRestore()
	})

	it('should show error message when login fails', async () => {
		const loginMock = vi.fn().mockRejectedValueOnce(new Error('Błąd logowania'))
		;(useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ login: loginMock })

		const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

		render(<Login />)

		fireEvent.change(screen.getByLabelText(/Numer karty/i), {
			target: { value: '12345' },
		})
		fireEvent.change(screen.getByLabelText(/Hasło/i), {
			target: { value: 'password' },
		})

		fireEvent.click(screen.getByRole('button', { name: /Zaloguj/i }))

		await waitFor(() =>
			expect(alertMock).toHaveBeenCalledWith('Błąd logowania'),
		)

		alertMock.mockRestore()
	})
})
