import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ReturnBooks from './BorrowingHistory'
import { useAuth } from '../../context/AuthContext'

import {
	DialogProps,
	DialogContentProps,
	DialogTitleProps,
	CardProps,
} from '@mui/material'

vi.mock('@mui/material', async () => {
	const actual =
		await vi.importActual<typeof import('@mui/material')>('@mui/material')
	return {
		...actual,
		Dialog: ({ children, open }: DialogProps) =>
			open ? <div data-testid="dialog">{children}</div> : null,
		DialogContent: ({ children }: DialogContentProps) => (
			<div data-testid="dialog-content">{children}</div>
		),
		DialogTitle: ({ children }: DialogTitleProps) => (
			<div data-testid="dialog-title">{children}</div>
		),
		Card: ({ children, sx }: CardProps) => (
			<div data-testid="book-card">{children}</div>
		),
	}
})

vi.mock('../../context/AuthContext', () => ({
	useAuth: vi.fn(),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ReturnBooks', () => {
	const mockUser = {
		id: '123',
		email: 'test@example.com',
		cardId: 'CARD123',
	}

	const mockBooks = [
		{
			id: 'book1',
			title: 'Test Book 1',
			author: 'Author 1',
			copies: 1,
			borrowedBy: ['CARD123'],
		},
	]

	const mockBorrowings = [
		{
			id: 'borrowing1',
			userId: '123',
			bookId: 'book1',
			borrowDate: '2024-01-01',
			expectedreturnDate: '2024-02-01',
			returnDate: '',
		},
	]

	const mockUsers = [
		{
			id: '123',
			cardId: 'CARD123',
			borrowedBooks: ['Test Book 1'],
		},
	]

	beforeEach(() => {
		vi.clearAllMocks()
		;(useAuth as any).mockReturnValue({ user: mockUser })

		mockFetch.mockImplementation((url) => {
			if (url.includes('/books')) {
				return Promise.resolve({ json: () => Promise.resolve(mockBooks) })
			}
			if (url.includes('/borrowings')) {
				return Promise.resolve({ json: () => Promise.resolve(mockBorrowings) })
			}
			if (url.includes('/users')) {
				return Promise.resolve({ json: () => Promise.resolve(mockUsers) })
			}
			if (url.includes('/logs')) {
				return Promise.resolve({ ok: true })
			}
			return Promise.resolve({ ok: true })
		})
	})

	it('renders the component title', async () => {
		await act(async () => {
			render(<ReturnBooks />)
		})
		expect(screen.getByText('Twoje wypożyczone książki')).toBeInTheDocument()
	})

	it('displays borrowed books when user has books', async () => {
		await act(async () => {
			render(<ReturnBooks />)
		})

		await waitFor(() => {
			expect(screen.getByText('Test Book 1')).toBeInTheDocument()
			expect(screen.getByText('Autor: Author 1')).toBeInTheDocument()
		})
	})

	it('displays "no books" message when user has no borrowed books', async () => {
		mockFetch.mockImplementation((url) => {
			if (url.includes('/borrowings')) {
				return Promise.resolve({ json: () => Promise.resolve([]) })
			}
			if (url.includes('/books')) {
				return Promise.resolve({ json: () => Promise.resolve([]) })
			}
			if (url.includes('/users')) {
				return Promise.resolve({ json: () => Promise.resolve([]) })
			}
			return Promise.resolve({ ok: true })
		})

		await act(async () => {
			render(<ReturnBooks />)
		})

		await waitFor(() => {
			expect(
				screen.getByText('Nie masz obecnie wypożyczonych książek.'),
			).toBeInTheDocument()
		})
	})

	it('shows overdue status for late books', async () => {
		const overdueBorrowing = {
			...mockBorrowings[0],
			expectedreturnDate: '2024-01-01',
		}

		mockFetch.mockImplementation((url) => {
			if (url.includes('/borrowings')) {
				return Promise.resolve({
					json: () => Promise.resolve([overdueBorrowing]),
				})
			}
			return Promise.resolve({ json: () => Promise.resolve([]) })
		})

		await act(async () => {
			render(<ReturnBooks />)
		})

		await waitFor(() => {
			expect(screen.getByText(/Przeterminowane o \d+ dni/)).toBeInTheDocument()
		})
	})

	it('handles successful book return', async () => {
		await act(async () => {
			render(<ReturnBooks />)
		})

		await waitFor(() => {
			expect(screen.getByText('Test Book 1')).toBeInTheDocument()
		})

		await act(async () => {
			fireEvent.click(screen.getByText('Zwróć książkę'))
		})

		await waitFor(() => {
			expect(
				screen.getByText('Książka została zwrócona pomyślnie!'),
			).toBeInTheDocument()
		})
	})

	it('handles error during book return', async () => {
		mockFetch.mockImplementation((url) => {
			if (url.includes('/books')) {
				return Promise.resolve({ json: () => Promise.resolve(mockBooks) })
			}
			if (url.includes('/borrowings')) {
				return Promise.resolve({ json: () => Promise.resolve(mockBorrowings) })
			}
			if (url.includes('/users')) {
				return Promise.resolve({ json: () => Promise.resolve(mockUsers) })
			}
			return Promise.resolve({ ok: true })
		})

		await act(async () => {
			render(<ReturnBooks />)
		})

		await waitFor(() => {
			expect(screen.getByText('Test Book 1')).toBeInTheDocument()
		})

		mockFetch.mockRejectedValueOnce(new Error('Failed to return book'))

		await act(async () => {
			fireEvent.click(screen.getByText('Zwróć książkę'))
		})

		await waitFor(() => {
			expect(
				screen.getByText('Wystąpił błąd podczas zwrotu książki.'),
			).toBeInTheDocument()
		})
	})

	it('handles initial data loading error', async () => {
		mockFetch.mockRejectedValueOnce(new Error('Failed to load data'))

		await act(async () => {
			render(<ReturnBooks />)
		})

		await waitFor(() => {
			expect(
				screen.getByText('Wystąpił błąd podczas ładowania danych.'),
			).toBeInTheDocument()
		})
	})
})
