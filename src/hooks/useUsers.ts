import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User } from '@/types/types'

export const useUsers = () =>
	useQuery<User[]>({
		queryKey: ['users'],
		queryFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/users`)
			if (!res.ok) throw new Error('Błąd pobierania użytkowników')
			return res.json()
		},
	})

export const useUpdateUser = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (user: User) => {
			const res = await fetch(
				`${import.meta.env.VITE_BASE_URL}api/users/${user.id}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(user),
				},
			)
			if (!res.ok) throw new Error('Błąd aktualizacji użytkownika')
			return res.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] })
		},
	})
}
