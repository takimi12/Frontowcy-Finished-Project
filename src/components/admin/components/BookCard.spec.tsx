import { render, screen, fireEvent } from '@testing-library/react'
import { BookCard } from './BookCard'
import { vi } from 'vitest'
import { Book } from '../../../types/types'

const book: Book = {
	id: '1',
	title: 'Test Book',
	author: 'Author Name',
	description: 'Test Description',
	year: 2021,
	copies: 2,
	borrowedBy: [],
}

describe('BookCard', () => {
	it('renders book details', () => {
		render(
			<BookCard
				book={book}
				editingBook={null}
				onEditStart={vi.fn()}
				onEditCancel={vi.fn()}
				onEditSubmit={vi.fn()}
				onEditChange={vi.fn()}
				onDeleteStart={vi.fn()}
				borrowings={[]}
				users={[]}
				onForceReturn={vi.fn()}
			/>,
		)

		expect(screen.getByText('Test Book')).toBeInTheDocument()
		expect(screen.getByText('Autor: Author Name')).toBeInTheDocument()
		expect(screen.getByText('Kopie: 2')).toBeInTheDocument()
	})

	it('calls onEditStart when edit button is clicked', () => {
		const onEditStartMock = vi.fn()
		render(
			<BookCard
				book={book}
				editingBook={null}
				onEditStart={onEditStartMock}
				onEditCancel={vi.fn()}
				onEditSubmit={vi.fn()}
				onEditChange={vi.fn()}
				onDeleteStart={vi.fn()}
				borrowings={[]}
				users={[]}
				onForceReturn={vi.fn()}
			/>,
		)

		fireEvent.click(screen.getByText('Edytuj'))
		expect(onEditStartMock).toHaveBeenCalled()
	})

	it('calls onDeleteStart when delete button is clicked', () => {
		const onDeleteStartMock = vi.fn()
		render(
			<BookCard
				book={book}
				editingBook={null}
				onEditStart={vi.fn()}
				onEditCancel={vi.fn()}
				onEditSubmit={vi.fn()}
				onEditChange={vi.fn()}
				onDeleteStart={onDeleteStartMock}
				borrowings={[]}
				users={[]}
				onForceReturn={vi.fn()}
			/>,
		)

		fireEvent.click(screen.getByText('Usuń'))
		expect(onDeleteStartMock).toHaveBeenCalled()
	})
})
