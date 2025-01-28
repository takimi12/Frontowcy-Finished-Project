import React from 'react'
import { Card, CardContent } from '@mui/material'
import { Book, Borrowing, User } from '../../../types/types'
import { BookDetails } from './BookDetails'
import { BookEditForm } from './EditBookForm'

interface BookCardProps {
	book: Book
	editingBook: Book | null
	onEditStart: () => void
	onEditCancel: () => void
	onEditSubmit: (e: React.FormEvent) => Promise<void>
	onEditChange: (book: Book) => void
	onDeleteStart: () => void
	borrowings: Borrowing[]
	users: User[]
	onForceReturn: (borrowingId: string) => void
}

export const BookCard: React.FC<BookCardProps> = ({
	book,
	editingBook,
	onEditStart,
	onEditCancel,
	onEditSubmit,
	onEditChange,
	onDeleteStart,
	borrowings,
	users,
	onForceReturn,
}) => {
	return (
		<Card
			data-testid="book-card" // Add this line
			data-book-id={book.id} // Optional: can be helpful for specific book targeting
		>
			<CardContent>
				{editingBook?.id === book.id ? (
					<BookEditForm
						book={editingBook}
						onBookChange={onEditChange}
						onSubmit={onEditSubmit}
						onCancel={onEditCancel}
					/>
				) : (
					<BookDetails
						book={book}
						onEdit={onEditStart}
						onDelete={onDeleteStart}
						borrowings={borrowings}
						users={users}
						onForceReturn={onForceReturn}
					/>
				)}
			</CardContent>
		</Card>
	)
}
