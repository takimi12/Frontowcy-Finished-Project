import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AccountDeletion from './AccountDeletion'
import { useAuth } from '../../context/AuthContext'

vi.mock('@mui/material', async () => {
	const actual = await vi.importActual('@mui/material')
	return {
		...actual,
		Dialog: ({
			children,
			open,
		}: {
			children: React.ReactNode
			open: boolean
		}) => (open ? <div data-testid="dialog">{children}</div> : null),
		DialogContent: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="dialog-content">{children}</div>
		),
		DialogContentText: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="dialog-content-text">{children}</div>
		),
		DialogActions: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="dialog-actions">{children}</div>
		),
		DialogTitle: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="dialog-title">{children}</div>
		),
	}
})

vi.mock('../../context/AuthContext', () => ({
	useAuth: vi.fn(),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('AccountDeletion', () => {
	const mockUser = {
		id: '123',
		email: 'test@example.com',
	}

	const mockLogout = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
		;(useAuth as any).mockReturnValue({
			user: mockUser,
			logout: mockLogout,
		})
	})

	it('renders the resignation button', () => {
		render(<AccountDeletion />)
		expect(screen.getByText('Zrezygnuj z członkostwa')).toBeInTheDocument()
	})

	it('opens confirmation modal when resignation button is clicked', async () => {
		render(<AccountDeletion />)

		const resignButton = screen.getByText('Zrezygnuj z członkostwa')
		fireEvent.click(resignButton)

		const dialog = screen.getByTestId('dialog')
		expect(dialog).toBeInTheDocument()

		expect(screen.getByTestId('dialog-title')).toHaveTextContent(
			'Potwierdzenie rezygnacji',
		)
		expect(screen.getByTestId('dialog-content-text')).toHaveTextContent(
			'Czy na pewno chcesz zrezygnować z członkostwa w bibliotece?',
		)
	})

	it('closes confirmation modal when cancel button is clicked', () => {
		render(<AccountDeletion />)

		fireEvent.click(screen.getByText('Zrezygnuj z członkostwa'))
		expect(screen.getByTestId('dialog')).toBeInTheDocument()

		fireEvent.click(screen.getByText('Anuluj'))
		expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
	})

	it('shows error when user has active loans', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => [
				{
					id: '1',
					userId: '123',
					bookId: '456',
					borrowDate: '2024-01-01',
					expectedReturnDate: '2024-02-01',
					returnDate: null,
				},
			],
		})

		render(<AccountDeletion />)

		fireEvent.click(screen.getByText('Zrezygnuj z członkostwa'))
		fireEvent.click(screen.getByText('Potwierdzam rezygnację'))

		await waitFor(() => {
			expect(screen.getByText('Wystąpił błąd')).toBeInTheDocument()
			expect(
				screen.getByText(
					'Nie możesz zrezygnować z członkostwa, ponieważ masz aktywne wypożyczenia.',
				),
			).toBeInTheDocument()
		})
	})

	it('successfully deletes account when user has no active loans', async () => {
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			})
			.mockResolvedValueOnce({
				ok: true,
			})
			.mockResolvedValueOnce({
				ok: true,
			})

		const mockLocation = { href: '' }
		Object.defineProperty(window, 'location', {
			value: mockLocation,
			writable: true,
		})

		render(<AccountDeletion />)

		fireEvent.click(screen.getByText('Zrezygnuj z członkostwa'))
		fireEvent.click(screen.getByText('Potwierdzam rezygnację'))

		await waitFor(() => {
			expect(screen.getByText('Rezygnacja udana')).toBeInTheDocument()
		})

		await waitFor(
			() => {
				expect(mockLogout).toHaveBeenCalled()
				expect(mockLocation.href).toBe('/')
			},
			{ timeout: 3500 },
		)
	})

	it('shows error when account deletion fails', async () => {
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			})
			.mockResolvedValueOnce({
				ok: false,
				statusText: 'Server Error',
			})

		render(<AccountDeletion />)

		fireEvent.click(screen.getByText('Zrezygnuj z członkostwa'))
		fireEvent.click(screen.getByText('Potwierdzam rezygnację'))

		await waitFor(() => {
			expect(screen.getByText('Wystąpił błąd')).toBeInTheDocument()
			expect(
				screen.getByText(/Wystąpił błąd podczas usuwania konta/),
			).toBeInTheDocument()
		})
	})

	it('shows error when checking active loans fails', async () => {
		const networkError = new Error('Network error')
		mockFetch.mockRejectedValueOnce(networkError)

		render(<AccountDeletion />)

		fireEvent.click(screen.getByText('Zrezygnuj z członkostwa'))
		fireEvent.click(screen.getByText('Potwierdzam rezygnację'))

		await waitFor(() => {
			expect(screen.getByText('Wystąpił błąd')).toBeInTheDocument()
			expect(
				screen.getByText(
					/Wystąpił błąd podczas sprawdzania wypożyczeń: Network error/,
				),
			).toBeInTheDocument()
		})
	})

	it('handles case when user is not logged in', () => {
		;(useAuth as any).mockReturnValue({
			user: null,
			logout: mockLogout,
		})

		render(<AccountDeletion />)

		fireEvent.click(screen.getByText('Zrezygnuj z członkostwa'))
		fireEvent.click(screen.getByText('Potwierdzam rezygnację'))

		expect(mockFetch).not.toHaveBeenCalled()
	})

	it('shows processing modal during account deletion', async () => {
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			})
			.mockResolvedValueOnce({
				ok: true,
			})
			.mockResolvedValueOnce({
				ok: true,
			})

		render(<AccountDeletion />)

		fireEvent.click(screen.getByText('Zrezygnuj z członkostwa'))
		fireEvent.click(screen.getByText('Potwierdzam rezygnację'))

		expect(
			screen.getByText(
				'Trwa sprawdzanie możliwości rezygnacji i usuwanie konta...',
			),
		).toBeInTheDocument()
	})

	it('handles failed API response for active loans check', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			statusText: 'Server Error',
		})

		render(<AccountDeletion />)

		fireEvent.click(screen.getByText('Zrezygnuj z członkostwa'))
		fireEvent.click(screen.getByText('Potwierdzam rezygnację'))

		await waitFor(() => {
			expect(screen.getByText('Wystąpił błąd')).toBeInTheDocument()
			expect(
				screen.getByText(/Wystąpił błąd podczas sprawdzania wypożyczeń/),
			).toBeInTheDocument()
		})
	})
})
