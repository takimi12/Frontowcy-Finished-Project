import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
	Container,
	Typography,
	Card,
	CardContent,
	CardActions,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Box,
	Chip,
} from '@mui/material'

interface Book {
	id: string
	title: string
	author: string
	copies: number
	borrowedBy: string[]
}

interface Borrowing {
	id: string
	userId: string
	bookId: string
	borrowDate: string
	expectedreturnDate: string
	returnDate: string
}

interface User {
	id: string
	cardId: string
	borrowedBooks: string[]
}

const ReturnBooks: React.FC = () => {
	const { user } = useAuth()
	const [books, setBooks] = useState<Book[]>([])
	const [borrowings, setBorrowings] = useState<Borrowing[]>([])
	const [users, setUsers] = useState<User[]>([])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalMessage, setModalMessage] = useState('')

	console.log(books)
	console.log(users)

	useEffect(() => {
		Promise.all([
			fetch('http://localhost:3001/books').then((res) => res.json()),
			fetch('http://localhost:3001/borrowings').then((res) => res.json()),
			fetch('http://localhost:3001/users').then((res) => res.json()),
		])
			.then(([booksData, borrowingsData, usersData]) => {
				setBooks(booksData)
				setBorrowings(borrowingsData)
				setUsers(usersData)
			})
			.catch((error) => {
				console.error('Błąd podczas pobierania danych:', error)
				setModalMessage('Wystąpił błąd podczas ładowania danych.')
				setIsModalOpen(true)
			})
	}, [])

	const getUserBorrowedBooks = () => {
		if (!user) return []

		return borrowings
			.filter(
				(borrowing) =>
					borrowing.userId === user.id && borrowing.returnDate === '',
			)
			.map((borrowing) => {
				const book = books.find((b) => b.id === borrowing.bookId)
				return {
					...borrowing,
					bookTitle: book?.title,
					bookAuthor: book?.author,
				}
			})
	}

	const calculateDaysOverdue = (expectedReturnDate: string): number => {
		const today = new Date()
		const returnDate = new Date(expectedReturnDate)
		const diffTime = today.getTime() - returnDate.getTime()
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
		return diffDays > 0 ? diffDays : 0
	}

	const handleReturn = async (borrowingId: string, bookId: string) => {
		try {
			// Znajdź wypożyczenie
			const borrowing = borrowings.find((b) => b.id === borrowingId)
			if (!borrowing) return

			// Znajdź książkę
			const book = books.find((b) => b.id === bookId)
			if (!book) return

			// Znajdź użytkownika
			const currentUser = users.find((u) => u.id === user?.id)
			if (!currentUser) return

			// 1. Zaktualizuj wypożyczenie (ustaw datę zwrotu)
			const updatedBorrowing = {
				...borrowing,
				returnDate: new Date().toISOString(),
			}

			await fetch(`http://localhost:3001/borrowings/${borrowingId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedBorrowing),
			})

			// 2. Zaktualizuj książkę (usuń cardId użytkownika z borrowedBy)
			const updatedBook = {
				...book,
				borrowedBy: book.borrowedBy.filter((id) => id !== user?.cardId),
			}

			await fetch(`http://localhost:3001/books/${bookId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedBook),
			})

			// 3. Zaktualizuj użytkownika (usuń tylko jedno wystąpienie tytułu książki z borrowedBooks)
			const updatedUser = { ...currentUser }
			const titleIndex = updatedUser.borrowedBooks.indexOf(book.title) // Znajdź indeks tytułu
			if (titleIndex !== -1) {
				updatedUser.borrowedBooks.splice(titleIndex, 1) // Usuń tylko jedno wystąpienie
			}

			await fetch(`http://localhost:3001/users/${user?.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedUser),
			})

			// 4. Zaloguj zwrot książki
			await fetch('http://localhost:3001/logs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					date: new Date().toISOString(),
					userId: user?.id,
					action: 'Zwrot książki',
					details: `Użytkownik ${user?.email} zwrócił książkę: ${book.title}`,
				}),
			})

			// Odśwież stan komponentu
			setBorrowings((prev) =>
				prev.map((b) => (b.id === borrowingId ? updatedBorrowing : b)),
			)
			setBooks((prev) => prev.map((b) => (b.id === bookId ? updatedBook : b)))
			setUsers((prev) => prev.map((u) => (u.id === user?.id ? updatedUser : u)))

			setModalMessage('Książka została zwrócona pomyślnie!')
			setIsModalOpen(true)
		} catch (error) {
			console.error('Błąd podczas zwrotu książki:', error)
			setModalMessage('Wystąpił błąd podczas zwrotu książki.')
			setIsModalOpen(true)
		}
	}

	const borrowedBooks = getUserBorrowedBooks()

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" component="h1" gutterBottom>
				Twoje wypożyczone książki
			</Typography>

			{borrowedBooks.length === 0 ? (
				<Typography variant="body1">
					Nie masz obecnie wypożyczonych książek.
				</Typography>
			) : (
				<Box display="flex" flexWrap="wrap" gap={3}>
					{borrowedBooks.map((borrowing) => {
						const daysOverdue = calculateDaysOverdue(
							borrowing.expectedreturnDate,
						)

						return (
							<Card
								key={borrowing.id}
								sx={{
									width: '100%',
									maxWidth: 345,
									bgcolor: daysOverdue > 0 ? 'error.light' : 'background.paper',
								}}
							>
								<CardContent>
									<Typography variant="h6" gutterBottom>
										{borrowing.bookTitle}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Autor: {borrowing.bookAuthor}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Data wypożyczenia:{' '}
										{new Date(borrowing.borrowDate).toLocaleDateString()}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Termin zwrotu:{' '}
										{new Date(
											borrowing.expectedreturnDate,
										).toLocaleDateString()}
									</Typography>
									{daysOverdue > 0 && (
										<Chip
											label={`Przeterminowane o ${daysOverdue} dni`}
											color="error"
											sx={{ mt: 1 }}
										/>
									)}
								</CardContent>
								<CardActions>
									<Button
										size="small"
										variant="contained"
										onClick={() => handleReturn(borrowing.id, borrowing.bookId)}
										color="primary"
									>
										Zwróć książkę
									</Button>
								</CardActions>
							</Card>
						)
					})}
				</Box>
			)}
			<Dialog
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				aria-labelledby="alert-dialog-title"
				data-testid="return-book-dialog"
			>
				<DialogTitle id="alert-dialog-title">Informacja</DialogTitle>
				<DialogContent>
					<Typography>{modalMessage}</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsModalOpen(false)} autoFocus>
						Zamknij
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	)
}

export default ReturnBooks
