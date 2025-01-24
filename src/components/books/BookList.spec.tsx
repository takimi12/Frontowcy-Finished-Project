import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BooksList } from './BooksList'
import { AuthContext } from '../../context/AuthContext'

interface AuthUser {
	id: string
	name: string
	surname: string
	email: string
	password: string
	cardId: string
	role: string
	borrowedBooks: string[]
}

global.fetch = vi.fn()

const mockBooks = [
	{
		id: '1',
		title: 'Władca Pierścieni',
		author: 'J.R.R. Tolkien',
		description: 'Epicka powieść fantasy',
		year: 1954,
		copies: 4,
		borrowedBy: ['card123'],
	},
	{
		id: '2',
		title: 'Hobbit',
		author: 'J.R.R. Tolkiens',
		description: 'Powieść fantasy',
		year: 1937,
		copies: 3,
		borrowedBy: [],
	},
]

const mockUsers: AuthUser[] = [
	{
		id: '1',
		name: 'Jan',
		surname: 'Kowalski',
		email: 'jan@example.com',
		password: 'haslo123',
		cardId: 'card123',
		role: 'user',
		borrowedBooks: ['Władca Pierścieni'],
	},
]

const currentDate = new Date()
const futureDate = new Date()
futureDate.setDate(currentDate.getDate() + 7)

const mockBorrowings = [
	{
		id: '1',
		userId: '1',
		bookId: '1',
		borrowDate: currentDate.toISOString(),
		expectedreturnDate: futureDate.toISOString(),
		returnDate: '',
	},
]

const setupMockFetch = () => {
	vi.mocked(fetch).mockImplementation((url) => {
		if (url === 'http://localhost:3001/books') {
			return Promise.resolve({
				json: () => Promise.resolve(mockBooks),
			} as Response)
		}
		if (url === 'http://localhost:3001/users') {
			return Promise.resolve({
				json: () => Promise.resolve(mockUsers),
			} as Response)
		}
		if (url === 'http://localhost:3001/borrowings') {
			return Promise.resolve({
				json: () => Promise.resolve(mockBorrowings),
			} as Response)
		}

		return Promise.resolve({
			json: () => Promise.resolve({}),
		} as Response)
	})
}

const renderBooksList = (user: AuthUser | null = null) => {
	return render(
		<AuthContext.Provider value={{ user, login: vi.fn(), logout: vi.fn() }}>
			<MemoryRouter>
				<BooksList />
			</MemoryRouter>
		</AuthContext.Provider>,
	)
}

describe('BooksList', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		setupMockFetch()
	})

	it('wyświetla listę książek', async () => {
		renderBooksList()

		await waitFor(() => {
			expect(screen.getByText('Władca Pierścieni')).toBeInTheDocument()
			expect(screen.getByText('Hobbit')).toBeInTheDocument()
		})
	})

	it('wyświetla informacje o autorze i dostępnych egzemplarzach', async () => {
		renderBooksList()

		await waitFor(() => {
			expect(
				screen.getByText(`Autor: ${mockBooks[0].author}`),
			).toBeInTheDocument()

			const availableCopiesElements = screen.getAllByText(
				/Dostępne egzemplarze:/,
			)

			expect(availableCopiesElements[0]).toHaveTextContent(
				`Dostępne egzemplarze:3`,
			)
			expect(availableCopiesElements[1]).toHaveTextContent(
				`Dostępne egzemplarze:3`,
			)
		})
	})

	it('wyświetla przyciski "Wypożycz" i "Szczegóły" dla każdej książki', async () => {
		renderBooksList()

		await waitFor(() => {
			const borrowButtons = screen.getAllByText('Wypożycz')
			const detailsButtons = screen.getAllByText('Szczegóły')

			expect(borrowButtons).toHaveLength(2)
			expect(detailsButtons).toHaveLength(2)
		})
	})

	it('pokazuje modal z informacją gdy niezalogowany użytkownik próbuje wypożyczyć książkę', async () => {
		renderBooksList(null)

		await waitFor(() => {
			const borrowButtons = screen.getAllByText('Wypożycz')
			fireEvent.click(borrowButtons[0])
		})

		expect(
			await screen.findByText('Zaloguj się, aby wypożyczyć książkę.'),
		).toBeInTheDocument()
	})

	it('wyświetla chip z datą zwrotu dla wypożyczonych książek', async () => {
		const mockUser = mockUsers[0]
		renderBooksList(mockUser)

		await waitFor(() => {
			const daysElement = screen.getByText(/Do zwrotu za \d+ dni/)
			expect(daysElement).toBeInTheDocument()

			const days = parseInt(daysElement.textContent!.match(/\d+/)![0])
			expect(days).toBeGreaterThanOrEqual(6)
			expect(days).toBeLessThanOrEqual(7)
		})
	})

	it('dezaktywuje przycisk "Wypożycz" gdy nie ma dostępnych egzemplarzy', async () => {
		const booksWithNoCopies = [
			{
				...mockBooks[0],
				copies: 1,
				borrowedBy: ['card123'],
			},
		]

		vi.mocked(fetch).mockImplementationOnce(() =>
			Promise.resolve({
				json: () => Promise.resolve(booksWithNoCopies),
			} as Response),
		)

		renderBooksList()

		await waitFor(() => {
			const borrowButton = screen.getByText('Wypożycz')
			expect(borrowButton).toBeDisabled()
		})
	})

	it('obsługuje błąd podczas ładowania danych', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

		renderBooksList()

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalled()
		})

		consoleSpy.mockRestore()
	})

	it('wywołuje odpowiednie endpointy API podczas wypożyczania książki', async () => {
		vi.mocked(fetch).mockClear()

		vi.mocked(fetch).mockImplementation((url, options) => {
			if (url === 'http://localhost:3001/books') {
				return Promise.resolve({
					json: () => Promise.resolve(mockBooks),
				} as Response)
			}
			if (url === 'http://localhost:3001/users') {
				return Promise.resolve({
					json: () => Promise.resolve(mockUsers),
				} as Response)
			}
			if (url === 'http://localhost:3001/borrowings') {
				if (options?.method === 'POST') {
					return Promise.resolve({
						json: () =>
							Promise.resolve({
								id: 'new-borrowing-id',
								userId: mockBorrowings[0].userId,
								bookId: mockBorrowings[0].bookId,
								borrowDate: mockBorrowings[0].borrowDate,
								expectedreturnDate: mockBorrowings[0].expectedreturnDate,
								returnDate: mockBorrowings[0].returnDate,
							}),
					} as Response)
				}
				return Promise.resolve({
					json: () => Promise.resolve(mockBorrowings),
				} as Response)
			}

			return Promise.resolve({
				json: () => Promise.resolve({}),
			} as Response)
		})

		const mockUser = mockUsers[0]
		renderBooksList(mockUser)

		await waitFor(() => {
			expect(screen.getAllByText('Wypożycz')).toHaveLength(2)
		})

		const borrowButtons = screen.getAllByText('Wypożycz')
		fireEvent.click(borrowButtons[1])

		await waitFor(() => {
			expect(fetch).toHaveBeenCalledWith(
				`http://localhost:3001/users/${mockUser.id}`,
				expect.objectContaining({
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
				}),
			)

			expect(fetch).toHaveBeenCalledWith(
				'http://localhost:3001/books/2',
				expect.objectContaining({
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
				}),
			)

			expect(fetch).toHaveBeenCalledWith(
				'http://localhost:3001/borrowings',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
				}),
			)

			expect(fetch).toHaveBeenCalledWith(
				'http://localhost:3001/logs',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
				}),
			)
		})

		expect(
			await screen.findByText('Książka została wypożyczona pomyślnie!'),
		).toBeInTheDocument()
	})
})
