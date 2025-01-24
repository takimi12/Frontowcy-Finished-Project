import React from 'react'
import { useAuth } from '../../context/AuthContext' // Importujemy kontekst
import axios from 'axios'

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
	const { user } = useAuth() // Pobieramy użytkownika z kontekstu
	const [borrowings, setBorrowings] = React.useState<Borrowing[]>([])

	// Pobierz wypożyczenia użytkownika
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

	const currentYear = 2025 // Zakładamy, że statystyki dotyczą roku 2025

	const borrowedThisMonth = borrowings.filter((borrowing) => {
		const borrowDate = new Date(borrowing.borrowDate)
		return (
			borrowDate.getMonth() + 1 === selectedMonth &&
			borrowDate.getFullYear() === currentYear
		)
	}).length

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

	return (
		<div>
			<p>Ilość książek wypożyczonych w danym miesiącu: {borrowedThisMonth}</p>
			<p>Ilość książek oddanych w terminie: {returnedOnTime}</p>
			<p>Ilość książek oddanych po terminie: {returnedLate}</p>
			<p>Ilość książek aktualnie wypożyczonych: {currentlyBorrowed}</p>
		</div>
	)
}

export default BorrowingStats
