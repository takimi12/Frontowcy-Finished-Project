import { render, screen, fireEvent } from '@testing-library/react'
import { BookDetails } from './BookDetails'
import { vi } from 'vitest'
import { User } from '@/types/types'

const book = {
	id: '1',
	title: 'Test Book',
	author: 'Author Name',
	description: 'Test Description',
	year: 2021,
	copies: 2,
	borrowedBy: [],
}

const borrowings = [
	{
		id: '1',
		bookId: '1',
		userId: '1',
		borrowDate: new Date().toISOString(),
		returnDate: '',
		expectedreturnDate: new Date(
			new Date().getTime() + 14 * 24 * 60 * 60 * 1000,
		).toISOString(),
	},
]

const users: User[] = [
	{
		id: '1',
		name: 'John',
		surname: 'Doe',
		cardId: '123',
		email: 'john.doe@example.com',
		password: 'password123',
		role: 'Klient',
		borrowedBooks: [],
	},
]

describe('BookDetails', () => {
	it('renders book details correctly', () => {
		render(
			<BookDetails
				book={book}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
				borrowings={[]}
				users={[]}
				onForceReturn={vi.fn()}
			/>,
		)

		expect(screen.getByText('Test Book')).toBeInTheDocument()
		expect(screen.getByText('Autor: Author Name')).toBeInTheDocument()
	})

	it('displays borrowings list correctly', () => {
		render(
			<BookDetails
				book={book}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
				borrowings={borrowings}
				users={users}
				onForceReturn={vi.fn()}
			/>,
		)

		expect(
			screen.getByText('Wypożyczone przez: John Doe (123)'),
		).toBeInTheDocument()
	})

	it('calls onForceReturn when force return button is clicked', () => {
		const onForceReturnMock = vi.fn()

		const borrowingsWithNoReturnDate = [
			{
				id: '1',
				bookId: '1',
				userId: '1',
				borrowDate: new Date().toISOString(),
				returnDate: '',
				expectedreturnDate: new Date(
					new Date().getTime() + 14 * 24 * 60 * 60 * 1000,
				).toISOString(),
			},
		]

		window.confirm = vi.fn().mockReturnValue(true)

		render(
			<BookDetails
				book={book}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
				borrowings={borrowingsWithNoReturnDate}
				users={users}
				onForceReturn={onForceReturnMock}
			/>,
		)

		const forceReturnButton = screen.getByTestId('force-return-button')
		expect(forceReturnButton).toBeInTheDocument()

		fireEvent.click(forceReturnButton)

		expect(window.confirm).toHaveBeenCalledWith(
			'Czy na pewno chcesz wymusić zwrot tej książki?',
		)
		expect(onForceReturnMock).toHaveBeenCalledWith('1')
	})
})
