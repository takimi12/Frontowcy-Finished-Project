import React, { useState } from 'react'
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
import { useBooks, useUpdateBook } from '../../hooks/useBooks'
import { useUsers, useUpdateUser } from '../../hooks/useUsers'
import { useBorrowings, useCreateBorrowing } from '../../hooks/useBorrowings'
import { Book, NewBorrowing, User } from '@/types/types'
import { useLogger } from '../../hooks/useLogger'

export const BooksList: React.FC = () => {
	const { user } = useAuth()

	const { data: books = [] } = useBooks()
	const { data: users = [] } = useUsers()
	const { data: borrowings = [] } = useBorrowings()
	const { logAction } = useLogger()


	console.log(books, 'added console logs')

	const updateBook = useUpdateBook()
	const updateUser = useUpdateUser()
	const createBorrowing = useCreateBorrowing()

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalMessage, setModalMessage] = useState('')

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
				(b) => b.bookId === bookId && b.userId === user.id && !b.returnDate,
			)
			.map((b) => b.expectedreturnDate)
	}

	const getRemainingDays = (returnDate: string): number => {
		const today = new Date()
		const return_date = new Date(returnDate)
		const diffTime = return_date.getTime() - today.getTime()
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
	}

	const borrowBook = async (bookId: string) => {
		if (!user) {
			setModalMessage('Zaloguj się, aby wypożyczyć książkę.')
			setIsModalOpen(true)
			return
		}

		const book = books.find((b) => b.id === bookId)
		if (!book) {
			setModalMessage('Książka nie została znaleziona.')
			setIsModalOpen(true)
			return
		}

		if (book.copies <= book.borrowedBy.length) {
			setModalMessage('Brak dostępnych egzemplarzy.')
			setIsModalOpen(true)
			return
		}

		const currentUser = users.find((u) => u.id === user.id)
		if (!currentUser) {
			setModalMessage('Nie znaleziono danych użytkownika.')
			setIsModalOpen(true)
			return
		}

		try {
			const currentBorrowedBooks = Array.isArray(currentUser.borrowedBooks)
				? currentUser.borrowedBooks
				: []

			const currentBorrowedBy = Array.isArray(book.borrowedBy)
				? book.borrowedBy
				: []

			const updatedUser: User = {
				...currentUser,
				borrowedBooks: [...currentBorrowedBooks, book.title],
			}

			const updatedBook: Book = {
				...book,
				borrowedBy: [...currentBorrowedBy, user.cardId],
			}

			const borrowDate = new Date()
			const returnDate = new Date()
			returnDate.setDate(borrowDate.getDate() + 14)

			const newBorrowing: NewBorrowing = {
				userId: user.id,
				bookId: book.id,
				borrowDate: borrowDate.toISOString(),
				expectedreturnDate: returnDate.toISOString(),
				returnDate: '',
			}

			console.log('Attempting to update user:', updatedUser)
			console.log('Attempting to update book:', updatedBook)
			console.log('Attempting to create borrowing:', newBorrowing)

			await Promise.all([
				updateUser.mutateAsync(updatedUser),
				updateBook.mutateAsync(updatedBook),
				createBorrowing.mutateAsync(newBorrowing),
			])

			try {
				await logAction({
					userId: user.id,
					userEmail: user.email,
					action: 'Wypożyczenie książki',
					details: `wypożyczył książkę: ${book.title}`,
				})
			} catch (logError) {
				console.warn('Błąd podczas logowania akcji:', logError)
			}

			setModalMessage('Książka została wypożyczona pomyślnie!')
			setIsModalOpen(true)
		} catch (error: any) {
			console.error('Błąd podczas wypożyczania książki:', error)
			console.error('Error details:', error.message)
			setModalMessage(`Wystąpił błąd: ${error.message}`)
			setIsModalOpen(true)
		}
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
					const availableCopies =
						book.copies -
						(Array.isArray(book.borrowedBy) ? book.borrowedBy.length : 0)

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
										Dostępne egzemplarze:{' '}
										{availableCopies <= 0
											? 'Brak dostępnych egzemplarzy'
											: availableCopies}
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
																				? 'warning.main'
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
										disabled={availableCopies <= 0}
									>
										Wypożycz
									</Button>
									<Button
										size="small"
										component={Link}
										to={`/books/${book._id}`}
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
