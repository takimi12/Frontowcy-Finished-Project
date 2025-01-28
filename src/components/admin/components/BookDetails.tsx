import React from 'react'
import {
	Typography,
	Button,
	Box,
	List,
	ListItem,
	ListItemText,
} from '@mui/material'
import { Book, Borrowing, User } from '../../../types/types'

interface BookDetailsProps {
	book: Book
	onEdit: () => void
	onDelete: () => void
	borrowings: Borrowing[]
	users: User[]
	onForceReturn: (borrowingId: string) => void
}

export const BookDetails: React.FC<BookDetailsProps> = ({
	book,
	onEdit,
	onDelete,
	borrowings,
	users,
	onForceReturn,
}) => {
	const [currentPage, setCurrentPage] = React.useState<number>(1)
	const itemsPerPage = 5

	const bookBorrowings = borrowings.filter(
		(borrowing) => borrowing.bookId === book.id,
	)

	const isOverdue = (borrowDate: string) => {
		const borrowDateObj = new Date(borrowDate)
		const currentDate = new Date()
		const daysDifference =
			(currentDate.getTime() - borrowDateObj.getTime()) / (1000 * 3600 * 24)
		return daysDifference > 14
	}

	const borrowedByUsers = bookBorrowings.map((borrowing) => {
		const user = users.find((user) => user.id === borrowing.userId)
		const isOverdueBorrowing = isOverdue(borrowing.borrowDate)
		return {
			...borrowing,
			user: user
				? `${user.name} ${user.surname} (${user.cardId})`
				: 'Nieznany użytkownik',
			status: borrowing.returnDate
				? 'Zwrócone'
				: isOverdueBorrowing
					? 'Przekroczony termin'
					: 'Wypożyczone',
			isOverdue: isOverdueBorrowing && !borrowing.returnDate,
		}
	})

	const totalPages = Math.ceil(borrowedByUsers.length / itemsPerPage)

	const startIndex = (currentPage - 1) * itemsPerPage
	const currentBorrowings = borrowedByUsers.slice(
		startIndex,
		startIndex + itemsPerPage,
	)

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1))
	}

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages))
	}

	return (
		<>
			<Typography variant="h6" sx={{ fontWeight: 'bold' }}>
				{book.title}
			</Typography>
			<Typography color="textSecondary">Autor: {book.author}</Typography>
			<Typography color="textSecondary">Rok: {book.year}</Typography>
			<Typography color="textSecondary">Kopie: {book.copies}</Typography>
			<Typography color="textSecondary">
				Wypożyczone: {book.borrowedBy?.length || 0}
			</Typography>
			<Typography sx={{ mt: 1 }}>{book.description}</Typography>

			{borrowedByUsers.length > 0 && (
				<Box sx={{ mt: 2 }}>
					<Typography variant="h6">Wypożyczenia:</Typography>
					<List>
						{currentBorrowings.map((borrowing, index) => (
							<ListItem
								key={index}
								data-testid="borrowing-list-item"
								sx={{
									backgroundColor: borrowing.isOverdue ? '#ffebee' : 'inherit',
									padding: '10px',
									borderRadius: '5px',
									marginBottom: '8px',
								}}
							>
								<ListItemText
									primary={`Wypożyczone przez: ${borrowing.user}`}
									secondary={
										<>
											<Typography component="span" display="block">
												Data wypożyczenia:{' '}
												{new Date(borrowing.borrowDate).toLocaleDateString()}
											</Typography>
											<Typography component="span" display="block">
												Status: {borrowing.status}
											</Typography>
											{borrowing.returnDate && (
												<Typography component="span" display="block">
													Data zwrotu:{' '}
													{new Date(borrowing.returnDate).toLocaleDateString()}
												</Typography>
											)}
										</>
									}
								/>
								{!borrowing.returnDate && (
									<Button
										variant="contained"
										color="secondary"
										data-testid="force-return-button"
										onClick={() => {
											if (
												window.confirm(
													'Czy na pewno chcesz wymusić zwrot tej książki?',
												)
											) {
												onForceReturn(borrowing.id)
											}
										}}
										sx={{
											backgroundColor: '#4caf50',
											'&:hover': {
												backgroundColor: '#388e3c',
											},
											fontWeight: 'bold',
											borderRadius: '5px',
											padding: '6px 16px',
										}}
									>
										Wymuś zwrot
									</Button>
								)}
							</ListItem>
						))}
					</List>

					<Box display="flex" justifyContent="space-between" mt={3}>
						<Button
							disabled={currentPage === 1}
							variant="outlined"
							onClick={handlePreviousPage}
							sx={{
								borderRadius: '5px',
								padding: '6px 16px',
								borderColor: '#3f51b5',
								color: '#3f51b5',
								'&:hover': {
									borderColor: '#303f9f',
									backgroundColor: '#e8eaf6',
								},
							}}
						>
							Poprzednia strona
						</Button>
						<Typography>
							Strona {currentPage} z {totalPages}
						</Typography>
						<Button
							disabled={currentPage === totalPages}
							variant="outlined"
							onClick={handleNextPage}
							sx={{
								borderRadius: '5px',
								padding: '6px 16px',
								borderColor: '#3f51b5',
								color: '#3f51b5',
								'&:hover': {
									borderColor: '#303f9f',
									backgroundColor: '#e8eaf6',
								},
							}}
						>
							Następna strona
						</Button>
					</Box>
				</Box>
			)}

			<Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
				<Button
					variant="contained"
					onClick={onEdit}
					sx={{
						backgroundColor: '#4caf50',
						'&:hover': {
							backgroundColor: '#388e3c',
						},
						fontWeight: 'bold',
						borderRadius: '5px',
						padding: '6px 16px',
					}}
				>
					Edytuj
				</Button>
				<Button
					variant="contained"
					color="error"
					onClick={onDelete}
					sx={{
						backgroundColor: '#f44336',
						'&:hover': {
							backgroundColor: '#d32f2f',
						},
						fontWeight: 'bold',
						borderRadius: '5px',
						padding: '6px 16px',
					}}
				>
					Usuń
				</Button>
			</Box>
		</>
	)
}
