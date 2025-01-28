import React from 'react'
import BorrowingStats from './BorrowingStats'
import BorrowingHistory from './BorrowingHistory'
import { useAuth } from '../../context/AuthContext'
import ResignMembership from './AccountDeletion'
import { Container, Typography, Paper, Box, TextField } from '@mui/material'

const UserPanel: React.FC = () => {
	const { user } = useAuth()
	const [selectedMonth, setSelectedMonth] = React.useState<number>(
		new Date().getMonth() + 1,
	)

	if (!user) {
		return <div>Nie jesteś zalogowany.</div>
	}

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
					Panel użytkownika
				</Typography>

				{/* User Data Section */}
				<Box mb={3}>
					<Typography variant="h6">Dane użytkownika</Typography>
					<Typography variant="body1">Imię: {user.name}</Typography>
					<Typography variant="body1">Nazwisko: {user.surname}</Typography>
					<Typography variant="body1">Email: {user.email}</Typography>
					<Typography variant="body1">
						Numer karty bibliotecznej: {user.cardId}
					</Typography>
				</Box>

				<Box mb={3}>
					<Typography variant="h6">Statystyki wypożyczeń</Typography>
					<TextField
						type="month"
						value={`2025-${selectedMonth.toString().padStart(2, '0')}`}
						onChange={(e) =>
							setSelectedMonth(parseInt(e.target.value.split('-')[1]))
						}
						label="Wybierz miesiąc"
						fullWidth
					/>
					<BorrowingStats selectedMonth={selectedMonth} />
				</Box>

				<Box mb={3}>
					<BorrowingHistory />
				</Box>

				<Box>
					<ResignMembership />
				</Box>
			</Container>
		</Paper>
	)
}

export default UserPanel
