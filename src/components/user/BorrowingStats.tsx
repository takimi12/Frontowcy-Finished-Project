import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Typography, Box, Paper, Button } from '@mui/material'
import { useBorrowings } from '../../hooks/useBorrowings'

interface BorrowingStatsProps {
	selectedMonth: number
}

const BorrowingStats: React.FC<BorrowingStatsProps> = ({ selectedMonth }) => {
	const { user } = useAuth()
	const { data: allBorrowings, isLoading, isError, error } = useBorrowings()
	const [currentPage, setCurrentPage] = React.useState<number>(1)
	const itemsPerPage = 5

	const userBorrowings = React.useMemo(() => {
		return (
			allBorrowings?.filter((borrowing) => borrowing.userId === user?.id) || []
		)
	}, [allBorrowings, user])

	const currentYear = 2025

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

	if (isLoading) {
		return <Typography>Ładowanie statystyk...</Typography>
	}

	if (isError) {
		return (
			<Typography color="error">
				Błąd podczas ładowania statystyk: {error?.message}
			</Typography>
		)
	}

	const totalBorrowed = userBorrowings.length
	const returnedOnTime = userBorrowings.filter((borrowing) => {
		if (!borrowing.returnDate) return false
		const returnDate = new Date(borrowing.returnDate)
		const expectedReturnDate = new Date(borrowing.expectedreturnDate)
		return returnDate <= expectedReturnDate
	}).length

	const returnedLate = userBorrowings.filter((borrowing) => {
		if (!borrowing.returnDate) return false
		const returnDate = new Date(borrowing.returnDate)
		const expectedReturnDate = new Date(borrowing.expectedreturnDate)
		return returnDate > expectedReturnDate
	}).length

	const currentlyBorrowed = userBorrowings.filter(
		(borrowing) => !borrowing.returnDate,
	).length

	const borrowedThisMonth = userBorrowings.filter((borrowing) => {
		const borrowDate = new Date(borrowing.borrowDate)
		return (
			borrowDate.getMonth() + 1 === selectedMonth &&
			borrowDate.getFullYear() === currentYear
		)
	}).length

	const returnedOnTimeThisMonth = userBorrowings.filter((borrowing) => {
		const borrowDate = new Date(borrowing.borrowDate)
		if (!borrowing.returnDate) return false
		const returnDate = new Date(borrowing.returnDate)
		const expectedReturnDate = new Date(borrowing.expectedreturnDate)
		return (
			borrowDate.getMonth() + 1 === selectedMonth &&
			borrowDate.getFullYear() === currentYear &&
			returnDate <= expectedReturnDate
		)
	}).length

	const returnedLateThisMonth = userBorrowings.filter((borrowing) => {
		const borrowDate = new Date(borrowing.borrowDate)
		if (!borrowing.returnDate) return false
		const returnDate = new Date(borrowing.returnDate)
		const expectedReturnDate = new Date(borrowing.expectedreturnDate)
		return (
			borrowDate.getMonth() + 1 === selectedMonth &&
			borrowDate.getFullYear() === currentYear &&
			returnDate > expectedReturnDate
		)
	}).length

	const currentlyBorrowedThisMonth = userBorrowings.filter((borrowing) => {
		const borrowDate = new Date(borrowing.borrowDate)
		return (
			borrowDate.getMonth() + 1 === selectedMonth &&
			borrowDate.getFullYear() === currentYear &&
			!borrowing.returnDate
		)
	}).length

	const totalPages = Math.ceil(userBorrowings.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const paginatedBorrowings = userBorrowings.slice(
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
				Ilość książek wypożyczonych ogólnie: **{totalBorrowed}**
			</Typography>
			<Typography>
				Ilość książek oddanych w terminie ogólnie: **{returnedOnTime}**
			</Typography>
			<Typography>
				Ilość książek oddanych po terminie ogólnie: **{returnedLate}**
			</Typography>
			<Typography>
				Ilość książek aktualnie wypożyczonych ogólnie: **{currentlyBorrowed}**
			</Typography>

			<Typography variant="h6" gutterBottom mt={3}>
				Statystyki za {monthNames[selectedMonth - 1]} {currentYear}
			</Typography>
			<Typography>
				Ilość książek wypożyczonych w {monthNames[selectedMonth - 1]}: **
				{borrowedThisMonth}**
			</Typography>
			<Typography>
				Ilość książek oddanych w terminie w {monthNames[selectedMonth - 1]}: **
				{returnedOnTimeThisMonth}**
			</Typography>
			<Typography>
				Ilość książek oddanych po terminie w {monthNames[selectedMonth - 1]}: **
				{returnedLateThisMonth}**
			</Typography>
			<Typography>
				Ilość książek aktualnie wypożyczonych w {monthNames[selectedMonth - 1]}:{' '}
				**{currentlyBorrowedThisMonth}**
			</Typography>

			<Box mt={2}>
				<Typography variant="h6">Twoje wypożyczenia:</Typography>
				{paginatedBorrowings.length > 0 ? (
					<ul>
						{paginatedBorrowings.map((borrowing) => (
							<li key={borrowing.id}>
								<Typography>
									**ID Książki:** {borrowing.bookId} | **Data wypożyczenia:**{' '}
									{new Date(borrowing.borrowDate).toLocaleDateString()} |{' '}
									**Termin zwrotu:**{' '}
									{new Date(borrowing.expectedreturnDate).toLocaleDateString()}{' '}
									| **Data zwrotu:**{' '}
									{borrowing.returnDate
										? new Date(borrowing.returnDate).toLocaleDateString()
										: 'Nie zwrócono'}
								</Typography>
							</li>
						))}
					</ul>
				) : (
					<Typography>Brak wypożyczeń w tym okresie.</Typography>
				)}
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
					disabled={currentPage === totalPages || totalPages === 0}
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
