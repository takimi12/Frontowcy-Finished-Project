import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { Admin } from './Admin'
import { useAuth } from '../../context/AuthContext'
import type { Mock } from 'vitest'

// Mock all required Material-UI components
vi.mock('@mui/material', () => ({
	Typography: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	Pagination: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	TextField: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	Button: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	Dialog: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogTitle: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogActions: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	CardContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	CardActions: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	IconButton: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}))

// Mock auth context
vi.mock('../../context/AuthContext', () => ({
	useAuth: vi.fn(),
}))

// Mock child components
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

vi.mock('./components/EventLog', () => ({
	EventLog: vi.fn(() => <div data-testid="event-log">EventLog</div>),
}))

describe('Admin', () => {
	const mockFetchResponse = Promise.resolve({
		ok: true,
		json: () => Promise.resolve([]),
	})

	beforeEach(() => {
		;(useAuth as Mock).mockReturnValue({ user: { role: 'Admin' } })

		// Setup fetch mock with consistent response
		global.fetch = vi
			.fn()
			.mockImplementation(() => mockFetchResponse) as unknown as typeof fetch
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('renders without crashing', async () => {
		render(<Admin />)

		// Wait for components to render after data fetching
		await waitFor(
			() => {
				expect(screen.getByTestId('add-book-form')).toBeInTheDocument()
			},
			{ timeout: 1000 },
		)

		expect(screen.getByText('Zarządzanie książkami')).toBeInTheDocument()
		expect(screen.getByText('Dostępne książki')).toBeInTheDocument()
	})

	it('fetches books, users, borrowings, and logs on mount', async () => {
		render(<Admin />)

		await waitFor(
			() => {
				expect(global.fetch).toHaveBeenCalledTimes(4)
			},
			{ timeout: 1000 },
		)

		// Verify each endpoint was called
		const calls = (global.fetch as Mock).mock.calls.map(
			(call: any[]) => call[0],
		)
		expect(calls).toContain('http://localhost:3001/books')
		expect(calls).toContain('http://localhost:3001/users')
		expect(calls).toContain('http://localhost:3001/borrowings')
		expect(calls).toContain('http://localhost:3001/logs')
	})

	it('displays access denied message for non-admin users', () => {
		;(useAuth as Mock).mockReturnValue({ user: { role: 'User' } })
		render(<Admin />)
		expect(
			screen.getByText('Brak dostępu do panelu administratora'),
		).toBeInTheDocument()
	})
})
