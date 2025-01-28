import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import BorrowingStats from './BorrowingStats'
import { useAuth } from '../../context/AuthContext'
import { User } from '../../api/api'

vi.mock('../../context/AuthContext', () => ({
	useAuth: vi.fn(),
}))

const mockAxios = new MockAdapter(axios)

describe('BorrowingStats', () => {
	const mockUser: User = {
		id: '1',
		name: 'John',
		surname: 'Doe',
		email: 'john.doe@example.com',
		cardId: '123456',
		password: 'securepassword',
		role: 'user',
		borrowedBooks: [],
	}

	const monthNames = [
		'Styczeń',
		'Luty',
		'Marzec',
		'Kwiecień',
		'Maj',
		'Czerwiec',
		'Lipiec',
		'Sierpień',
		'Wrzesień',
		'Październik',
		'Listopad',
		'Grudzień',
	]

	beforeEach(() => {
		vi.mocked(useAuth).mockReturnValue({
			user: mockUser,
			login: vi.fn(),
			logout: vi.fn(),
		})
	})

	afterEach(() => {
		mockAxios.reset()
	})

	it('should display correct stats for the given month', async () => {
		const borrowings = [
			{
				id: '1',
				userId: '1',
				bookId: '101',
				borrowDate: '2025-04-15',
				expectedreturnDate: '2025-05-01',
				returnDate: '2025-04-20',
			},
			{
				id: '2',
				userId: '1',
				bookId: '102',
				borrowDate: '2025-04-10',
				expectedreturnDate: '2025-04-25',
				returnDate: '2025-04-30',
			},
			{
				id: '3',
				userId: '1',
				bookId: '103',
				borrowDate: '2025-04-01',
				expectedreturnDate: '2025-04-15',
				returnDate: null,
			},
			{
				id: '4',
				userId: '2',
				bookId: '104',
				borrowDate: '2025-04-05',
				expectedreturnDate: '2025-04-20',
				returnDate: '2025-04-18',
			},
		]

		mockAxios.onGet('http://localhost:3001/borrowings').reply(200, borrowings)

		render(<BorrowingStats selectedMonth={4} />)

		await waitFor(() => {
			// Statystyki ogólne
			expect(
				screen.getByText('Ilość książek wypożyczonych ogólnie: 3'),
			).toBeInTheDocument()
			expect(
				screen.getByText('Ilość książek oddanych w terminie ogólnie: 1'),
			).toBeInTheDocument()
			expect(
				screen.getByText('Ilość książek oddanych po terminie ogólnie: 1'),
			).toBeInTheDocument()
			expect(
				screen.getByText('Ilość książek aktualnie wypożyczonych ogólnie: 1'),
			).toBeInTheDocument()

			// Statystyki miesięczne
			const monthName = monthNames[3]
			expect(screen.getByText(`Statystyki za ${monthName}`)).toBeInTheDocument()
			expect(
				screen.getByText(`Ilość książek wypożyczonych w ${monthName}: 3`),
			).toBeInTheDocument()
			expect(
				screen.getByText(`Ilość książek oddanych w terminie w ${monthName}: 1`),
			).toBeInTheDocument()
			expect(
				screen.getByText(
					`Ilość książek oddanych po terminie w ${monthName}: 1`,
				),
			).toBeInTheDocument()
			expect(
				screen.getByText('Ilość książek aktualnie wypożyczonych: 1'),
			).toBeInTheDocument()
		})
	})

	it('should handle missing user', async () => {
		vi.mocked(useAuth).mockReturnValue({
			user: null,
			login: vi.fn(),
			logout: vi.fn(),
		})

		render(<BorrowingStats selectedMonth={4} />)

		await waitFor(() => {
			const monthName = monthNames[3]
			expect(
				screen.getByText(`Ilość książek wypożyczonych w ${monthName}: 0`),
			).toBeInTheDocument()
			expect(
				screen.queryByText('Ilość książek wypożyczonych ogólnie:'),
			).toBeNull()
		})
	})

	it('should handle server errors gracefully', async () => {
		mockAxios.onGet('http://localhost:3001/borrowings').networkError()

		render(<BorrowingStats selectedMonth={4} />)

		await waitFor(() => {
			const monthName = monthNames[3]
			expect(
				screen.getByText(`Ilość książek wypożyczonych w ${monthName}: 0`),
			).toBeInTheDocument()
		})
	})

	it('should display pagination correctly', async () => {
		const borrowings = Array.from({ length: 8 }, (_, i) => ({
			id: String(i),
			userId: '1',
			bookId: String(100 + i),
			borrowDate: '2025-04-01',
			expectedreturnDate: '2025-04-15',
			returnDate: null,
		}))

		mockAxios.onGet('http://localhost:3001/borrowings').reply(200, borrowings)

		render(<BorrowingStats selectedMonth={4} />)

		await waitFor(() => {
			expect(screen.getByText('Strona 1 z 2')).toBeInTheDocument()
			expect(screen.getByText('Poprzednia strona')).toBeDisabled()
			expect(screen.getByText('Następna strona')).toBeEnabled()
		})
	})
})
