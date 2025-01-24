import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogContentText,
	CircularProgress,
	Alert,
	Box,
	Typography,
	Paper,
} from '@mui/material'
import {
	ErrorOutline as ErrorIcon,
	CheckCircleOutline as SuccessIcon,
} from '@mui/icons-material'

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
				`http://localhost:3001/borrowings?userId=${user.id}&returnDate=`,
			)
			const activeLoans = await response.json()

			if (activeLoans.length > 0) {
				setError(
					'Nie możesz zrezygnować z członkostwa, ponieważ masz aktywne wypożyczenia.',
				)
				return false
			}
			return true
		} catch (err) {
			setError('Wystąpił błąd podczas sprawdzania wypożyczeń.')
			return false
		}
	}

	const handleResignation = async () => {
		if (!user) return

		setIsConfirmModalOpen(false)
		setIsProcessingModalOpen(true)

		const canResign = await checkActiveLoans()
		if (!canResign) {
			setIsProcessingModalOpen(false)
			setIsSuccess(false)
			setIsResultModalOpen(true)
			return
		}

		try {
			const response = await fetch(`http://localhost:3001/users/${user.id}`, {
				method: 'DELETE',
			})

			setIsProcessingModalOpen(false)

			if (response.ok) {
				setIsSuccess(true)
				setError('')
			} else {
				setIsSuccess(false)
				setError('Wystąpił błąd podczas usuwania konta.')
			}

			setIsResultModalOpen(true)

			if (response.ok) {
				setTimeout(() => {
					logout()
					window.location.href = '/'
				}, 3000)
			}
		} catch (err) {
			setIsProcessingModalOpen(false)
			setIsSuccess(false)
			setError('Wystąpił błąd podczas usuwania konta.')
			setIsResultModalOpen(true)
		}
	}

	return (
		<>
			<Paper elevation={2} sx={{ p: 3, mt: 3 }}>
				<Typography variant="h5" gutterBottom>
					Rezygnacja z członkostwa
				</Typography>
				<Button
					variant="contained"
					color="error"
					onClick={() => setIsConfirmModalOpen(true)}
				>
					Zrezygnuj z członkostwa
				</Button>
			</Paper>

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
					<Button onClick={() => setIsConfirmModalOpen(false)} color="inherit">
						Anuluj
					</Button>
					<Button onClick={handleResignation} color="error" variant="contained">
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
		</>
	)
}

export default AccountDeletion
