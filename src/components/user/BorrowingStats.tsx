import React from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { Typography, Box, Paper, Button } from '@mui/material'

interface Borrowing {
	id: string
	userId: string
	bookId: string
	borrowDate: string
	expectedreturnDate: string
	returnDate: string
}

interface BorrowingStatsProps {
	selectedMonth: number
}

const BorrowingStats: React.FC<BorrowingStatsProps> = ({ selectedMonth }) => {
	const { user } = useAuth()
	const [borrowings, setBorrowings] = React.useState<Borrowing[]>([])
	const [currentPage, setCurrentPage] = React.useState<number>(1)
	const itemsPerPage = 5

	React.useEffect(() => {
		if (user) {
			axios
				.get<Borrowing[]>('http://localhost:3001/borrowings')
				.then((response) => {
					setBorrowings(
						response.data.filter((borrowing) => borrowing.userId === user.id),
					)
				})
				.catch((error) => {
					console.error('Błąd podczas pobierania wypożyczeń:', error)
				})
		}
	}, [user])

	const currentYear = 2025

	// Tablica z nazwami miesięcy
	const monthNames = [
		'Styczeń',
		'Luty',
		'Marzec',
		'Kwiecień',
		'Maj',
		'Czerwiec',
		'Lipiec',
		'Sierpień',
		'Wrzesień',
		'Październik',
		'Listopad',
		'Grudzień',
	]

	// Statystyki ogólne
	const totalBorrowed = borrowings.length
	const returnedOnTime = borrowings.filter((borrowing) => {
		if (!borrowing.returnDate) return false
		const returnDate = new Date(borrowing.returnDate)
		const expectedReturnDate = new Date(borrowing.expectedreturnDate)
		return returnDate <= expectedReturnDate
	}).length

	const returnedLate = borrowings.filter((borrowing) => {
		if (!borrowing.returnDate) return false
		const returnDate = new Date(borrowing.returnDate)
		const expectedReturnDate = new Date(borrowing.expectedreturnDate)
		return returnDate > expectedReturnDate
	}).length

	const currentlyBorrowed = borrowings.filter(
		(borrowing) => !borrowing.returnDate,
	).length

	// Statystyki dla wybranego miesiąca
	const borrowedThisMonth = borrowings.filter((borrowing) => {
		const borrowDate = new Date(borrowing.borrowDate)
		return (
			borrowDate.getMonth() + 1 === selectedMonth &&
			borrowDate.getFullYear() === currentYear
		)
	}).length

	const totalPages = Math.ceil(borrowings.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const paginatedBorrowings = borrowings.slice(
		startIndex,
		startIndex + itemsPerPage,
	)

	return (
		<Paper
			elevation={3}
			sx={{
				p: 4,
				margin: '40px',
			}}
		>
			<Typography variant="h6" gutterBottom>
				Statystyki ogólne
			</Typography>
			<Typography>
				Ilość książek wypożyczonych ogólnie: {totalBorrowed}
			</Typography>
			<Typography>
				Ilość książek oddanych w terminie ogólnie: {returnedOnTime}
			</Typography>
			<Typography>
				Ilość książek oddanych po terminie ogólnie: {returnedLate}
			</Typography>
			<Typography>
				Ilość książek aktualnie wypożyczonych ogólnie: {currentlyBorrowed}
			</Typography>

			<Typography variant="h6" gutterBottom mt={3}>
				Statystyki za {monthNames[selectedMonth - 1]}
			</Typography>
			<Typography>
				Ilość książek wypożyczonych w {monthNames[selectedMonth - 1]}:{' '}
				{borrowedThisMonth}
			</Typography>
			<Typography>
				Ilość książek oddanych w terminie w {monthNames[selectedMonth - 1]}:{' '}
				{returnedOnTime}
			</Typography>
			<Typography>
				Ilość książek oddanych po terminie w {monthNames[selectedMonth - 1]}:{' '}
				{returnedLate}
			</Typography>
			<Typography>
				Ilość książek aktualnie wypożyczonych: {currentlyBorrowed}
			</Typography>

			<Box mt={2}>
				<Typography variant="h6">Wypożyczenia:</Typography>
				<ul>
					{paginatedBorrowings.map((borrowing) => (
						<li key={borrowing.id}>
							<Typography>
								<strong>ID Książki:</strong> {borrowing.bookId} |{' '}
								<strong>Data wypożyczenia:</strong>{' '}
								{new Date(borrowing.borrowDate).toLocaleDateString()} |{' '}
								<strong>Termin zwrotu:</strong>{' '}
								{new Date(borrowing.expectedreturnDate).toLocaleDateString()} |{' '}
								<strong>Data zwrotu:</strong>{' '}
								{borrowing.returnDate
									? new Date(borrowing.returnDate).toLocaleDateString()
									: 'Nie zwrócono'}
							</Typography>
						</li>
					))}
				</ul>
			</Box>

			<Box display="flex" justifyContent="space-between" mt={3}>
				<Button
					disabled={currentPage === 1}
					variant="outlined"
					onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
				>
					Poprzednia strona
				</Button>
				<Typography>
					Strona {currentPage} z {totalPages}
				</Typography>
				<Button
					disabled={currentPage === totalPages}
					variant="outlined"
					onClick={() =>
						setCurrentPage((prev) => Math.min(prev + 1, totalPages))
					}
				>
					Następna strona
				</Button>
			</Box>
		</Paper>
	)
}

export default BorrowingStats
