import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter as Router } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from './Header'

vi.mock('../context/AuthContext', () => ({
	useAuth: vi.fn(),
}))

describe('Header', () => {
	it('should render login button when user is not logged in', () => {
		;(useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
			user: null,
			logout: vi.fn(),
		})

		render(
			<Router>
				<Header />
			</Router>,
		)

		const loginButton = screen.getByRole('link', { name: /Zaloguj się/i })
		expect(loginButton).toBeInTheDocument()
	})

	it('should render user info and logout button when user is logged in', () => {
		;(useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
			user: { name: 'Jan', surname: 'Kowalski', role: 'Administrator' },
			logout: vi.fn(),
		})

		render(
			<Router>
				<Header />
			</Router>,
		)

		const welcomeText = screen.getByText(
			/Witaj, Jan Kowalski \(Administrator\)/i,
		)
		expect(welcomeText).toBeInTheDocument()

		const logoutButton = screen.getByRole('button', { name: /Wyloguj/i })
		expect(logoutButton).toBeInTheDocument()
	})

	it('should call logout function when logout button is clicked', () => {
		const logoutMock = vi.fn()
		;(useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
			user: { name: 'Jan', surname: 'Kowalski', role: 'Administrator' },
			logout: logoutMock,
		})

		render(
			<Router>
				<Header />
			</Router>,
		)

		const logoutButton = screen.getByRole('button', { name: /Wyloguj/i })
		fireEvent.click(logoutButton)

		expect(logoutMock).toHaveBeenCalledTimes(1)
	})

	it('should contain a link to the home page', () => {
		render(
			<Router>
				<Header />
			</Router>,
		)

		const libraryLink = screen.getByRole('link', { name: /Biblioteka/i })
		expect(libraryLink).toHaveAttribute('href', '/')
	})
})
