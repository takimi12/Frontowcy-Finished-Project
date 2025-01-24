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
			isOverdue: isOverdueBorrowing && !borrowing.returnDate, // Upewnij się, że isOverdue jest false, jeśli returnDate jest ustawiony
		}
	})

	return (
		<>
			<Typography variant="h6">{book.title}</Typography>
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
						{borrowedByUsers.map((borrowing, index) => (
							<ListItem
								key={index}
								sx={{
									backgroundColor: borrowing.isOverdue ? '#ffebee' : 'inherit',
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
									>
										Wymuś zwrot
									</Button>
								)}
							</ListItem>
						))}
					</List>
				</Box>
			)}

			<Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
				<Button variant="contained" onClick={onEdit}>
					Edytuj
				</Button>
				<Button variant="contained" color="error" onClick={onDelete}>
					Usuń
				</Button>
			</Box>
		</>
	)
}
