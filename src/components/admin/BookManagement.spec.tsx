import { render, screen, act } from '@testing-library/react'
import { vi } from 'vitest'
import { BookManagement } from './BookManagement'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
	useAuth: vi.fn(),
}))

vi.mock('./components/AddBookForm', () => ({
	AddBookForm: vi.fn(() => <div data-testid="add-book-form">AddBookForm</div>),
}))

vi.mock('./components/BookCard', () => ({
	BookCard: vi.fn(({ onForceReturn }) => (
		<div data-testid="book-card">
			BookCard
			<button data-testid="force-return-button" onClick={onForceReturn}>
				Force Return
			</button>
		</div>
	)),
}))

vi.mock('./components/DeleteBookDialog', () => ({
	DeleteBookDialog: vi.fn(() => (
		<div data-testid="delete-book-dialog">DeleteBookDialog</div>
	)),
}))

describe('BookManagement', () => {
	beforeEach(() => {
		// @ts-expect-error Ignoring vi.Mock
		;(useAuth as vi.Mock).mockReturnValue({ user: { role: 'Admin' } })
		global.fetch = vi.fn(() =>
			Promise.resolve({
				json: () => Promise.resolve([]),
			}),
		) as unknown as typeof fetch
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('renders without crashing', async () => {
		await act(async () => {
			render(<BookManagement />)
		})
		expect(screen.getByText('Zarządzanie książkami')).toBeInTheDocument()
		expect(screen.getByTestId('add-book-form')).toBeInTheDocument()
	})

	it('fetches books, users, and borrowings on mount', async () => {
		await act(async () => {
			render(<BookManagement />)
		})
		expect(global.fetch).toHaveBeenCalledTimes(3)
		expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/books')
		expect(global.fetch).toHaveBeenCalledWith(
			'http://localhost:3001/borrowings',
		)
		expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/users')
	})

	it('displays access denied message for non-admin users', async () => {
		// @ts-expect-error Ignoring vi.Mock
		;(useAuth as vi.Mock).mockReturnValue({ user: { role: 'User' } })
		await act(async () => {
			render(<BookManagement />)
		})
		expect(
			screen.getByText('Brak dostępu do panelu administratora'),
		).toBeInTheDocument()
	})
})
