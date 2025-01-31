import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
	Container,
	Paper,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogContentText,
	CircularProgress,
	Alert,
	Box,
} from '@mui/material'
import {
	ErrorOutline as ErrorIcon,
	CheckCircleOutline as SuccessIcon,
} from '@mui/icons-material'

interface Loan {
	id: string
	userId: string | null
	bookId: string
	borrowDate: string
	expectedReturnDate: string
	returnDate: string | null
}

const AccountDeletion: React.FC = () => {
	const { user, logout } = useAuth()
	const [error, setError] = useState<string>('')
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false)
	const [isResultModalOpen, setIsResultModalOpen] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)

	const checkActiveLoans = async () => {
		if (!user) return false

		try {
			const response = await fetch(
				`http://localhost:3001/borrowings?userId=${user.id}&returnDate=null`,
			)

			if (!response.ok) {
				throw new Error('Błąd podczas pobierania danych o wypożyczeniach')
			}

			const activeLoans: Loan[] = await response.json()
			const hasActiveLoans = activeLoans.length > 0

			if (hasActiveLoans) {
				setError(
					'Nie możesz zrezygnować z członkostwa, ponieważ masz aktywne wypożyczenia.',
				)
				return false
			}

			return true
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err)
			setError(`Wystąpił błąd podczas sprawdzania wypożyczeń: ${errorMessage}`)
			return false
		}
	}

	const handleResignation = async () => {
		if (!user) return

		setIsConfirmModalOpen(false)
		setIsProcessingModalOpen(true)

		try {
			const canResign = await checkActiveLoans()
			if (!canResign) {
				setIsProcessingModalOpen(false)
				setIsResultModalOpen(true)
				return
			}

			const response = await fetch(`http://localhost:3001/users/${user.id}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Błąd podczas usuwania konta')
			}

			await fetch('http://localhost:3001/logs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					date: new Date().toISOString(),
					userId: user.id,
					action: 'Usunięcie konta',
					details: `Użytkownik ${user.email} usunął swoje konto.`,
				}),
			})

			setIsProcessingModalOpen(false)
			setIsSuccess(true)
			setError('')
			setIsResultModalOpen(true)

			setTimeout(() => {
				logout()
				window.location.href = '/'
			}, 3000)
		} catch (err) {
			setIsProcessingModalOpen(false)
			setIsSuccess(false)
			const errorMessage = err instanceof Error ? err.message : String(err)
			setError(`Wystąpił błąd podczas usuwania konta. ${errorMessage}`)
			setIsResultModalOpen(true)
		}
	}

	return (
		<Paper elevation={3} sx={{ p: 4, margin: '40px' }}>
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Rezygnacja z członkostwa
				</Typography>

				<Button
					variant="contained"
					color="error"
					onClick={() => setIsConfirmModalOpen(true)}
					sx={{ mb: 3 }}
				>
					Zrezygnuj z członkostwa
				</Button>

				<Dialog
					open={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle>Potwierdzenie rezygnacji</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Czy na pewno chcesz zrezygnować z członkostwa w bibliotece? Ta
							operacja jest nieodwracalna.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={() => setIsConfirmModalOpen(false)}
							color="inherit"
						>
							Anuluj
						</Button>
						<Button
							onClick={handleResignation}
							color="error"
							variant="contained"
						>
							Potwierdzam rezygnację
						</Button>
					</DialogActions>
				</Dialog>

				<Dialog open={isProcessingModalOpen} maxWidth="sm" fullWidth>
					<DialogContent>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								py: 2,
							}}
						>
							<CircularProgress sx={{ mb: 2 }} />
							<DialogContentText>
								Trwa sprawdzanie możliwości rezygnacji i usuwanie konta...
							</DialogContentText>
						</Box>
					</DialogContent>
				</Dialog>

				<Dialog
					open={isResultModalOpen}
					onClose={() => !isSuccess && setIsResultModalOpen(false)}
					maxWidth="sm"
					fullWidth
				>
					<DialogContent>
						<Box sx={{ textAlign: 'center', py: 2 }}>
							{isSuccess ? (
								<SuccessIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
							) : (
								<ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
							)}
							<Typography variant="h6" gutterBottom>
								{isSuccess ? 'Rezygnacja udana' : 'Wystąpił błąd'}
							</Typography>
							<Alert severity={isSuccess ? 'success' : 'error'} sx={{ mt: 2 }}>
								{isSuccess
									? 'Twoje konto zostało pomyślnie usunięte. Za chwilę nastąpi przekierowanie na stronę główną.'
									: error ||
										'Wystąpił nieoczekiwany błąd podczas przetwarzania rezygnacji.'}
							</Alert>
						</Box>
					</DialogContent>
					{!isSuccess && (
						<DialogActions>
							<Button
								onClick={() => setIsResultModalOpen(false)}
								color="primary"
								variant="contained"
							>
								Rozumiem
							</Button>
						</DialogActions>
					)}
				</Dialog>
			</Container>
		</Paper>
	)
}

export default AccountDeletion
