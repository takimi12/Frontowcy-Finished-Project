import React, { useState } from 'react'
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
	Box,
} from '@mui/material'
import { useCheckActiveLoans } from '../../hooks/useCheckActiveLoans'
import { useDeleteAccount } from '../../hooks/useDeleteAccount'

const AccountDeletion: React.FC = () => {
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

	const {
		data: hasActiveLoans,
		isLoading: checkingLoans,
		error: loansError,
	} = useCheckActiveLoans()


	const { mutate: deleteAccount, isPending: deletingAccount } =
		useDeleteAccount()

	const handleResignationConfirmation = () => {
		setIsConfirmModalOpen(false)

		if (checkingLoans || deletingAccount) {
			return
		}

		if (loansError) {
			window.alert(loansError.message)
			return
		}

		if (hasActiveLoans) {
			window.alert(
				'Nie możesz zrezygnować z członkostwa, ponieważ masz aktywne wypożyczenia.',
			)
			return
		}

		deleteAccount()
	}

	const showLoadingModal = checkingLoans || deletingAccount

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
					disabled={checkingLoans || deletingAccount}
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
							onClick={handleResignationConfirmation}
							color="error"
							variant="contained"
							disabled={checkingLoans || deletingAccount}
						>
							Potwierdzam rezygnację
						</Button>
					</DialogActions>
				</Dialog>

				<Dialog open={showLoadingModal} maxWidth="sm" fullWidth>
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
			</Container>
		</Paper>
	)
}

export default AccountDeletion
