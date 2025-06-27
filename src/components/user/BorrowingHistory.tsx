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
	Paper,
	CircularProgress,
} from '@mui/material'

import { useBooks, useUpdateBook } from '../../hooks/useBooks'
import { useBorrowings } from '../../hooks/useBorrowings'
import { useUsers, useUpdateUser } from '../../hooks/useUsers'
import { useUpdateBorrowing } from '../../hooks/useUpdateBorrowings'
import { useCreateLog } from '../../hooks/useLogs'
import { useQueryClient } from '@tanstack/react-query'

const ReturnBooks: React.FC = () => {
	const { user } = useAuth()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalMessage, setModalMessage] = useState('')

	const queryClient = useQueryClient()

	const {
		data: books,
		isLoading: isLoadingBooks,
		error: errorBooks,
	} = useBooks()
	const {
		data: borrowings,
		isLoading: isLoadingBorrowings,
		error: errorBorrowings,
	} = useBorrowings()
	const {
		data: users,
		isLoading: isLoadingUsers,
		error: errorUsers,
	} = useUsers()

	const updateBookMutation = useUpdateBook()
	const updateBorrowingMutation = useUpdateBorrowing()
	const updateUserMutation = useUpdateUser()
	const createLogMutation = useCreateLog()
	const isLoading = isLoadingBooks || isLoadingBorrowings || isLoadingUsers
	const hasError = errorBooks || errorBorrowings || errorUsers

	let errorMessage = ''
	if (errorBooks) {
		errorMessage = errorBooks.message
	} else if (errorBorrowings) {
		errorMessage = errorBorrowings.message
	} else if (errorUsers) {
		errorMessage = errorUsers.message
	}

	useEffect(() => {
		if (hasError && !isModalOpen) {
			setModalMessage(`Wystąpił błąd podczas ładowania danych: ${errorMessage}`)
			setIsModalOpen(true)
		}
	}, [hasError, errorMessage, isModalOpen])

	if (isLoading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="80vh"
			>
				<CircularProgress />
				<Typography variant="h6" sx={{ ml: 2 }}>
					Ładowanie danych...
				</Typography>
			</Box>
		)
	}

	const getUserBorrowedBooks = () => {
		if (!user || !borrowings || !books) {
			return []
		}

		return borrowings
			.filter(
				(borrowing) => borrowing.userId === user.id && !borrowing.returnDate,
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
		if (!books || !borrowings || !users || !user) {
			setModalMessage('Brak danych do wykonania operacji.')
			setIsModalOpen(true)
			return
		}

		try {
			const borrowing = borrowings.find((b) => b.id === borrowingId)
			if (!borrowing) {
				throw new Error('Nie znaleziono wypożyczenia.')
			}

			const book = books.find((b) => b.id === bookId)
			if (!book) {
				throw new Error('Nie znaleziono książki.')
			}

			const currentUser = users.find((u) => u.id === user.id)
			if (!currentUser) {
				throw new Error('Nie znaleziono użytkownika.')
			}

			const updatedBorrowing = {
				...borrowing,
				returnDate: new Date().toISOString(),
			}

			const updatedBook = {
				...book,
				borrowedBy: book.borrowedBy.filter((id) => id !== user.cardId),
			}

			const updatedUser = { ...currentUser }
			const titleIndex = updatedUser.borrowedBooks.indexOf(book.title)
			if (titleIndex !== -1) {
				updatedUser.borrowedBooks.splice(titleIndex, 1)
			}

			await updateBorrowingMutation.mutateAsync(updatedBorrowing)
			await updateBookMutation.mutateAsync(updatedBook)
			await updateUserMutation.mutateAsync(updatedUser)

			await createLogMutation.mutateAsync({
				date: new Date().toISOString(),
				userId: user.id,
				action: 'Zwrot książki',
				details: `Użytkownik ${user.email} zwrócił książkę: ${book.title}`,
			})

			if (user?.id) {
				queryClient.invalidateQueries({ queryKey: ['activeLoans', user.id] })
			}

			setModalMessage('Książka została zwrócona pomyślnie!')
			setIsModalOpen(true)
		} catch (error: any) {
			console.error('Błąd podczas zwrotu książki:', error)
			setModalMessage(
				`Wystąpił błąd podczas zwrotu książki: ${error.message || 'Nieznany błąd.'}`,
			)
			setIsModalOpen(true)
		}
	}

	const borrowedBooks = getUserBorrowedBooks()

	return (
		<Paper
			elevation={3}
			sx={{
				p: 4,
				margin: '40px',
			}}
		>
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Twoje wypożyczone książki
				</Typography>

				{borrowedBooks.length === 0 ? (
					<Typography variant="body1">
						Nie masz obecnie wypożyczonych książek.
					</Typography>
				) : (
					<Box
						display="grid"
						gridTemplateColumns="repeat(auto-fit, minmax(345px, 1fr))"
						gap={3}
					>
						{borrowedBooks.map((borrowing) => {
							const daysOverdue = calculateDaysOverdue(
								borrowing.expectedreturnDate,
							)

							return (
								<Card
									key={borrowing.id}
									sx={{
										bgcolor:
											daysOverdue > 0 ? 'error.light' : 'background.paper',
										maxWidth: '400px',
										width: '100%',
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
											onClick={() =>
												handleReturn(borrowing.id, borrowing.bookId)
											}
											color="primary"
											disabled={
												updateBookMutation.isPending ||
												updateUserMutation.isPending ||
												updateBorrowingMutation.isPending ||
												createLogMutation.isPending
											}
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
		</Paper>
	)
}

export default ReturnBooks
