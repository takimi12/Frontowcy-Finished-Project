import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
	List,
	ListItem,
	ListItemText,
} from '@mui/material'

interface Book {
	id: string
	title: string
	author: string
	description: string
	year: number
	copies: number
	borrowedBy: string[]
}

interface User {
	id: string
	name: string
	surname: string
	email: string
	password: string
	cardId: string
	role: string
	borrowedBooks: string[] // Przechowuje tytuły wypożyczonych książek
}

interface Borrowing {
	id: string
	userId: string
	bookId: string
	borrowDate: string
	expectedreturnDate: string
	returnDate: string
}

export const BooksList: React.FC = () => {
	const { user } = useAuth()
	const [books, setBooks] = useState<Book[]>([])
	const [users, setUsers] = useState<User[]>([])
	const [borrowings, setBorrowings] = useState<Borrowing[]>([])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalMessage, setModalMessage] = useState('')

	useEffect(() => {
		// Fetch books
		fetch('http://localhost:3001/books')
			.then((response) => response.json())
			.then((data) => setBooks(data))
			.catch((error) =>
				console.error('Błąd podczas pobierania książek:', error),
			)

		// Fetch users
		fetch('http://localhost:3001/users')
			.then((response) => response.json())
			.then((data) => setUsers(data))
			.catch((error) =>
				console.error('Błąd podczas pobierania użytkowników:', error),
			)

		// Fetch borrowings
		fetch('http://localhost:3001/borrowings')
			.then((response) => response.json())
			.then((data) => setBorrowings(data))
			.catch((error) =>
				console.error('Błąd podczas pobierania wypożyczeń:', error),
			)
	}, [])

	const isBookBorrowedByUser = (bookId: string): boolean => {
		if (!user) return false
		return borrowings.some(
			(borrowing) =>
				borrowing.bookId === bookId &&
				borrowing.userId === user.id &&
				!borrowing.returnDate,
		)
	}

	const getBookReturnDates = (bookId: string): string[] => {
		if (!user) return []
		return borrowings
			.filter(
				(b) => b.bookId === bookId && b.userId === user.id && !b.returnDate, // Wypożyczenia bez zwrotu
			)
			.map((b) => b.expectedreturnDate)
	}

	const borrowBook = async (bookId: string) => {
		if (!user) {
			setModalMessage('Zaloguj się, aby wypożyczyć książkę.')
			setIsModalOpen(true)
			return
		}

		const book = books.find((b) => b.id === bookId)
		if (!book) return

		if (book.copies <= book.borrowedBy.length) {
			setModalMessage('Brak dostępnych egzemplarzy.')
			setIsModalOpen(true)
			return
		}

		const currentUser = users.find((u) => u.id === user.id)
		if (!currentUser) return

		const updatedUser = {
			...currentUser,
			borrowedBooks: [...currentUser.borrowedBooks, book.title],
		}

		try {
			await fetch(`http://localhost:3001/users/${user.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedUser),
			})

			const updatedBook = {
				...book,
				borrowedBy: [...book.borrowedBy, user.cardId],
			}

			await fetch(`http://localhost:3001/books/${bookId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedBook),
			})

			const borrowDate = new Date()
			const returnDate = new Date()
			returnDate.setDate(returnDate.getDate() + 14)

			const newBorrowing = {
				userId: user.id,
				bookId: book.id,
				borrowDate: borrowDate.toISOString(),
				expectedreturnDate: returnDate.toISOString(),
				returnDate: '',
			}

			const borrowingResponse = await fetch(
				'http://localhost:3001/borrowings',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(newBorrowing),
				},
			)

			const savedBorrowing = await borrowingResponse.json()
			setBorrowings((prev) => [...prev, savedBorrowing])

			setBooks((prevBooks) =>
				prevBooks.map((b) => (b.id === bookId ? updatedBook : b)),
			)

			setUsers((prevUsers) =>
				prevUsers.map((u) => (u.id === user.id ? updatedUser : u)),
			)

			await fetch('http://localhost:3001/logs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					date: new Date().toISOString(),
					userId: user.id,
					action: 'Wypożyczenie książki',
					details: `Użytkownik ${user.email} wypożyczył książkę: ${book.title}`,
				}),
			})

			setModalMessage('Książka została wypożyczona pomyślnie!')
			setIsModalOpen(true)
		} catch (error) {
			setModalMessage(`Wystąpił błąd podczas wypożyczania książki. ${error}`)
			setIsModalOpen(true)
		}
	}

	const getRemainingDays = (returnDate: string): number => {
		const today = new Date()
		const return_date = new Date(returnDate)
		const diffTime = return_date.getTime() - today.getTime()
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
	}

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" component="h1" gutterBottom>
				Lista książek
			</Typography>

			<Box
				display="flex"
				flexWrap="wrap"
				justifyContent="space-between"
				gap={3}
			>
				{books.map((book) => {
					const returnDates = getBookReturnDates(book.id)

					return (
						<Box
							key={book.id}
							flexBasis={{
								xs: '100%',
								sm: 'calc(50% - 16px)',
								md: 'calc(33.333% - 16px)',
							}}
						>
							<Card
								elevation={3}
								sx={{
									minHeight: '200px',
									bgcolor: isBookBorrowedByUser(book.id)
										? 'action.selected'
										: 'background.paper',
								}}
							>
								<CardContent>
									<Typography variant="h6" gutterBottom>
										{book.title}
									</Typography>
									<Typography variant="body1" color="text.secondary">
										Autor: {book.author}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Dostępne egzemplarze:
										{book.copies <= book.borrowedBy.length
											? 'Brak dostępnych egzemplarzy'
											: book.copies - book.borrowedBy.length}
									</Typography>

									{returnDates.length > 0 && (
										<Box mt={2}>
											<Typography variant="body2" color="text.primary">
												Twoje terminy zwrotu:
											</Typography>
											<List>
												{returnDates.map((date, index) => {
													const remainingDays = getRemainingDays(date)
													return (
														<ListItem key={index} disablePadding>
															<ListItemText
																primary={`Termin zwrotu: ${new Date(
																	date,
																).toLocaleDateString()} (${remainingDays} dni)`}
																primaryTypographyProps={{
																	color:
																		remainingDays < 3
																			? 'error'
																			: remainingDays < 7
																				? 'warning'
																				: 'text.primary',
																}}
															/>
														</ListItem>
													)
												})}
											</List>
										</Box>
									)}
								</CardContent>
								<CardActions>
									<Button
										size="small"
										variant="contained"
										onClick={() => borrowBook(book.id)}
										disabled={book.copies <= book.borrowedBy.length}
									>
										Wypożycz
									</Button>
									<Button
										size="small"
										component={Link}
										to={`/books/${book.id}`}
										color="primary"
									>
										Szczegóły
									</Button>
								</CardActions>
							</Card>
						</Box>
					)
				})}
			</Box>

			<Dialog
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				aria-labelledby="alert-dialog-title"
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
