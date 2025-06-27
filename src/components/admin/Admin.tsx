import React, { useState } from 'react'
import { Typography, Box } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { Book, NewBook, User } from '../../types/types'

import { AddBookForm } from './components/AddBookForm'
import { BookCard } from './components/BookCard'
import { DeleteBookDialog } from './components/DeleteBookDialog'
import { EventLog } from './components/EventLogs'

import { useAddBook } from '../../hooks/useAddBook'
import { useBooks, useUpdateBook } from '../../hooks/useBooks'
import { useDeleteBook } from '../../hooks/useDeleteBook'
import { useUsers, useUpdateUser } from '../../hooks/useUsers'
import { useBorrowings } from '../../hooks/useBorrowings'
import { useLogs } from '../../hooks/useLogs'
import { useLogger } from '../../hooks/useLogger'
import { useUpdateBorrowing } from '../../hooks/useUpdateBorrowings'

export const Admin: React.FC = () => {
	const { user } = useAuth()

	const { data: books = [], refetch: refetchBooks } = useBooks()
	const { data: users = [], refetch: refetchUsers } = useUsers()
	const { data: borrowings = [], refetch: refetchBorrowings } = useBorrowings()
	const { data: logs = [] } = useLogs()
	const { logAction } = useLogger()

	const addBookMutation = useAddBook()
	const updateBookMutation = useUpdateBook()
	const deleteBookMutation = useDeleteBook()
	const updateUserMutation = useUpdateUser()
	const updateBorrowingMutation = useUpdateBorrowing()

	const [editingBook, setEditingBook] = useState<Book | null>(null)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
	const [newBook, setNewBook] = useState<NewBook>({
		title: '',
		author: '',
		description: '',
		year: 0,
		copies: 0,
		borrowedBy: [],
	})

	const handleAddBook = async (e: React.FormEvent) => {
		e.preventDefault()

		addBookMutation.mutate(newBook, {
			onSuccess: () => {
				setNewBook({
					title: '',
					author: '',
					description: '',
					year: 0,
					copies: 0,
					borrowedBy: [],
				})
				refetchBooks()
			},
			onError: (error) => {
				console.error('Error adding book:', error)
			},
		})
	}

	const handleUpdateBook = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editingBook) return

		updateBookMutation.mutate(editingBook, {
			onSuccess: () => {
				setEditingBook(null)
				refetchBooks()
			},
			onError: (error) => {
				console.error('Error updating book:', error)
			},
		})
	}

	const handleDeleteBook = async (book: Book) => {
		if (book.borrowedBy && book.borrowedBy.length > 0) {
			alert('Nie można usunąć książki, która jest aktualnie wypożyczona.')
			return
		}

		deleteBookMutation.mutate(book.id, {
			onSuccess: () => {
				setDeleteDialogOpen(false)
				setBookToDelete(null)
				refetchBooks()
			},
			onError: (error) => {
				console.error('Error deleting book:', error)
			},
		})
	}

	const handleForceReturn = async (borrowingId: string) => {
		try {
			const borrowing = borrowings.find((b) => b.id === borrowingId)
			if (!borrowing) throw new Error('Wypożyczenie nie znalezione')

			await new Promise<void>((resolve, reject) => {
				updateBorrowingMutation.mutate(
					{ ...borrowing, returnDate: new Date().toISOString() },
					{
						onSuccess: () => resolve(),
						onError: (e) => reject(e),
					},
				)
			})

			const userToUpdate = users.find((u) => u.id === borrowing.userId)
			const bookToUpdate = books.find((b) => b.id === borrowing.bookId)

			if (!userToUpdate || !bookToUpdate)
				throw new Error('Nie znaleziono użytkownika lub książki')

			const updatedUser: User = {
				...userToUpdate,
				borrowedBooks: userToUpdate.borrowedBooks.filter(
					(title) => title !== bookToUpdate.title,
				),
			}

			const updatedBook: Book = {
				...bookToUpdate,
				borrowedBy: bookToUpdate.borrowedBy.filter(
					(cardId) => cardId !== userToUpdate.cardId,
				),
			}

			await new Promise<void>((resolve, reject) => {
				updateUserMutation.mutate(updatedUser, {
					onSuccess: () => resolve(),
					onError: (e) => reject(e),
				})
			})

			await new Promise<void>((resolve, reject) => {
				updateBookMutation.mutate(updatedBook, {
					onSuccess: () => resolve(),
					onError: (e) => reject(e),
				})
			})

			await logAction({
				userId: userToUpdate.id,
				userEmail: userToUpdate.email,
				action: 'Wymuszony zwrot książki',
				details: `Administrator wymusił zwrot książki: ${bookToUpdate.title} od użytkownika ${userToUpdate.email}`,
			})

			refetchBorrowings()
			refetchUsers()
			refetchBooks()
		} catch (error) {
			console.error('Error forcing return:', error)
		}
	}

	if (user?.role !== 'Admin') {
		return (
			<Typography variant="h6" align="center" sx={{ p: 4 }}>
				Brak dostępu do panelu administratora
			</Typography>
		)
	}

	return (
		<Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
			<Typography variant="h4" gutterBottom>
				Zarządzanie książkami
			</Typography>

			<AddBookForm
				newBook={newBook}
				onNewBookChange={setNewBook}
				onSubmit={handleAddBook}
			/>

			<Box sx={{ display: 'grid', gap: 2 }}>
				<Typography variant="h4" gutterBottom>
					Dostępne książki
				</Typography>

				{books.map((book) => (
					<BookCard
						key={book.id}
						book={book}
						editingBook={editingBook}
						onEditStart={() => setEditingBook(book)}
						onEditCancel={() => setEditingBook(null)}
						onEditSubmit={handleUpdateBook}
						onEditChange={setEditingBook}
						onDeleteStart={() => {
							setBookToDelete(book)
							setDeleteDialogOpen(true)
						}}
						borrowings={borrowings}
						users={users}
						onForceReturn={handleForceReturn}
					/>
				))}
			</Box>

			<DeleteBookDialog
				book={bookToDelete}
				open={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false)
					setBookToDelete(null)
				}}
				onConfirm={handleDeleteBook}
			/>

			<EventLog logs={logs} />
		</Box>
	)
}
