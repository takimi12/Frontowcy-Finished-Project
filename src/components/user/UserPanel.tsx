import React from 'react'
import BorrowingStats from './BorrowingStats'
import BorrowingHistory from './BorrowingHistory'
import { useAuth } from '../../context/AuthContext'
import ResignMembership from './AccountDeletion'

const UserPanel: React.FC = () => {
	const { user } = useAuth()
	const [selectedMonth, setSelectedMonth] = React.useState<number>(
		new Date().getMonth() + 1,
	)

	if (!user) {
		return <div>Nie jesteś zalogowany.</div>
	}

	return (
		<div>
			<h1>Panel użytkownika</h1>
			<div>
				<h2>Dane użytkownika</h2>
				<p>Imię: {user.name}</p>
				<p>Nazwisko: {user.surname}</p>
				<p>Email: {user.email}</p>
				<p>Numer karty bibliotecznej: {user.cardId}</p>
			</div>
			<div>
				<h2>Statystyki wypożyczeń</h2>
				<label>
					Wybierz miesiąc:
					<input
						type="month"
						value={`2025-${selectedMonth.toString().padStart(2, '0')}`}
						onChange={(e) =>
							setSelectedMonth(parseInt(e.target.value.split('-')[1]))
						}
					/>
				</label>
				<BorrowingStats selectedMonth={selectedMonth} />
			</div>
			<div>
				<BorrowingHistory />
			</div>
			<div>
				<ResignMembership />
			</div>
		</div>
	)
}

export default UserPanel
