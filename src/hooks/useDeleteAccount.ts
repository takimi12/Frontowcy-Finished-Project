import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'

interface DeleteAccountData {
	userId: string
	userEmail: string
}

const deleteUserAccount = async ({ userId, userEmail }: DeleteAccountData) => {
	const userResponse = await fetch(`https://frontowcy-finished-project-op3s.vercel.app/users/${userId}`, {
		method: 'DELETE',
	})

	if (!userResponse.ok) {
		throw new Error('Błąd podczas usuwania konta użytkownika')
	}

	const logResponse = await fetch('https://frontowcy-finished-project-op3s.vercel.app/logs', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			date: new Date().toISOString(),
			userId: userId,
			action: 'Usunięcie konta',
			details: `Użytkownik ${userEmail} usunął swoje konto.`,
		}),
	})

	if (!logResponse.ok) {
		console.error('Nie udało się zapisać logu usunięcia konta.')
	}
}

export const useDeleteAccount = () => {
	const queryClient = useQueryClient()
	const { logout, user } = useAuth()

	return useMutation<void, Error, void>({
		mutationFn: async () => {
			if (!user) {
				throw new Error('Użytkownik nie jest zalogowany.')
			}
			await deleteUserAccount({
				userId: user.id,
				userEmail: user.email || 'nieznany',
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries()
			logout()
			window.alert(
				'Twoje konto zostało pomyślnie usunięte. Zostaniesz przekierowany na stronę główną.',
			)
			window.location.href = '/'
		},
		onError: (error) => {
			console.error('Błąd podczas usuwania konta:', error.message)
			window.alert(
				error.message || 'Wystąpił nieoczekiwany błąd podczas usuwania konta.',
			)
		},
	})
}
