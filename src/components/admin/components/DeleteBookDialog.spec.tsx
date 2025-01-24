import { render, screen, fireEvent } from '@testing-library/react'
import { DeleteBookDialog } from './DeleteBookDialog'
import { vi } from 'vitest'
import { Book } from '../../../types/types'

describe('DeleteBookDialog', () => {
	const mockOnClose = vi.fn()
	const mockOnConfirm = vi.fn()

	const defaultBook: Book = {
		id: '1',
		title: 'Book Title',
		borrowedBy: [],
		author: 'Author Name',
		description: 'Book description here.',
		year: 2023,
		copies: 5,
	}

	const borrowedBook: Book = {
		id: '2',
		title: 'Borrowed Book Title',
		borrowedBy: ['User1'],
		author: 'Author Name',
		description: 'Book description here.',
		year: 2022,
		copies: 3,
	}

	it('should render the dialog with the correct title and message when book can be deleted', () => {
		render(
			<DeleteBookDialog
				book={defaultBook}
				open={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
			/>,
		)

		expect(screen.getByText('Usuwanie książki')).toBeInTheDocument()
		expect(
			screen.getByText('Czy na pewno chcesz usunąć tę książkę?'),
		).toBeInTheDocument()
	})

	it('should render the dialog with a message indicating the book is borrowed and cannot be deleted', () => {
		render(
			<DeleteBookDialog
				book={borrowedBook}
				open={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
			/>,
		)

		expect(screen.getByText('Usuwanie książki')).toBeInTheDocument()
		expect(
			screen.getByText(
				'Nie można usunąć książki, która jest aktualnie wypożyczona.',
			),
		).toBeInTheDocument()
		expect(
			screen.queryByText('Czy na pewno chcesz usunąć tę książkę?'),
		).not.toBeInTheDocument()
		expect(
			screen.queryByRole('button', { name: /Usuń/i }),
		).not.toBeInTheDocument()
	})

	it('should call onClose when the "Anuluj" button is clicked', () => {
		render(
			<DeleteBookDialog
				book={defaultBook}
				open={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
			/>,
		)

		fireEvent.click(screen.getByRole('button', { name: /Anuluj/i }))
		expect(mockOnClose).toHaveBeenCalled()
	})

	it('should call onConfirm when the "Usuń" button is clicked', () => {
		render(
			<DeleteBookDialog
				book={defaultBook}
				open={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
			/>,
		)

		fireEvent.click(screen.getByRole('button', { name: /Usuń/i }))
		expect(mockOnConfirm).toHaveBeenCalledWith(defaultBook)
	})

	it('should not display the "Usuń" button if the book cannot be deleted', () => {
		render(
			<DeleteBookDialog
				book={borrowedBook}
				open={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
			/>,
		)

		expect(
			screen.queryByRole('button', { name: /Usuń/i }),
		).not.toBeInTheDocument()
	})
})
