import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'

interface Loan {
	id: string
	userId: string | null
	bookId: string
	borrowDate: string
	expectedReturnDate: string
	returnDate: string | null
}

const fetchActiveLoans = async (
	userId: string | undefined,
): Promise<boolean> => {
	if (!userId) {
		return false
	}
	const response = await fetch(
		`https://frontowcy-finished-project.vercel.app/api/borrowings?userId=${userId}&returnDate=null`,
	)
	if (!response.ok) {
		throw new Error('Błąd podczas pobierania danych o wypożyczeniach')
	}

	const allLoansForUser: Loan[] = await response.json()

	const activeLoans = allLoansForUser.filter(
		(loan) =>
			loan.userId === userId &&
			(loan.returnDate === null || loan.returnDate === ''),
	)

	return activeLoans.length > 0
}

export const useCheckActiveLoans = () => {
	const { user } = useAuth()
	const userId = user?.id

	return useQuery<boolean, Error>({
		queryKey: ['activeLoans', userId],
		queryFn: () => fetchActiveLoans(userId),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000,
	})
}
