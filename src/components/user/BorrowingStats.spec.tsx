import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import BorrowingStats from './BorrowingStats'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
	useAuth: vi.fn(),
}))

const mockAxios = new MockAdapter(axios)

describe('BorrowingStats', () => {
	const mockUser = { id: '1', name: 'John Doe' }

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

		expect(
			await screen.findByText(
				'Ilość książek wypożyczonych w danym miesiącu: 3',
			),
		).toBeInTheDocument()
		expect(
			await screen.findByText('Ilość książek oddanych w terminie: 1'),
		).toBeInTheDocument()
		expect(
			await screen.findByText('Ilość książek oddanych po terminie: 1'),
		).toBeInTheDocument()
		expect(
			await screen.findByText('Ilość książek aktualnie wypożyczonych: 1'),
		).toBeInTheDocument()
	})

	it('should handle missing user', async () => {
		vi.mocked(useAuth).mockReturnValue({
			user: null,
			login: vi.fn(),
			logout: vi.fn(),
		})

		render(<BorrowingStats selectedMonth={4} />)

		expect(
			await screen.findByText(
				'Ilość książek wypożyczonych w danym miesiącu: 0',
			),
		).toBeInTheDocument()
		expect(
			await screen.findByText('Ilość książek oddanych w terminie: 0'),
		).toBeInTheDocument()
		expect(
			await screen.findByText('Ilość książek oddanych po terminie: 0'),
		).toBeInTheDocument()
		expect(
			await screen.findByText('Ilość książek aktualnie wypożyczonych: 0'),
		).toBeInTheDocument()
	})

	it('should handle incorrect server response', async () => {
		mockAxios.onGet('http://localhost:3001/borrowings').networkError()

		render(<BorrowingStats selectedMonth={4} />)

		expect(
			await screen.findByText(
				'Ilość książek wypożyczonych w danym miesiącu: 0',
			),
		).toBeInTheDocument()
		expect(
			await screen.findByText('Ilość książek oddanych w terminie: 0'),
		).toBeInTheDocument()
		expect(
			await screen.findByText('Ilość książek oddanych po terminie: 0'),
		).toBeInTheDocument()
		expect(
			await screen.findByText('Ilość książek aktualnie wypożyczonych: 0'),
		).toBeInTheDocument()
	})
})
