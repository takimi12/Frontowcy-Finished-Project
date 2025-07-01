import { Borrowing } from '@/types/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useUpdateBorrowing = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (updatedBorrowing: Borrowing) => {
			console.log(
				'Sending update for borrowing:',
				updatedBorrowing.id,
				updatedBorrowing,
			)
			const res = await fetch(
				`${process.env.BASE_URL}api/borrowings/${updatedBorrowing.id}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(updatedBorrowing),
				},
			)
			if (!res.ok) {
				const errorText = await res.text()
				throw new Error(
					`Nie udało się zaktualizować wypożyczenia: ${errorText}`,
				)
			}
			return res.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['books'] })
			queryClient.invalidateQueries({ queryKey: ['borrowings'] })
			queryClient.invalidateQueries({ queryKey: ['users'] })
			queryClient.invalidateQueries({ queryKey: ['logs'] })
		},
	})
}
