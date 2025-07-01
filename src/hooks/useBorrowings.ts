import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Borrowing, NewBorrowing } from '@/types/types'

export const useBorrowings = () =>
	useQuery<Borrowing[]>({
		queryKey: ['borrowings'],
		queryFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/borrowings`)
			if (!res.ok) throw new Error('Błąd pobierania wypożyczeń')
			return res.json()
		},
	})

export const useCreateBorrowing = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (newBorrowing: NewBorrowing) => {
			const res = await fetch(
				`${import.meta.env.VITE_BASE_URL}api/borrowings`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newBorrowing),
				},
			)
			if (!res.ok) throw new Error('Nie udało się zapisać wypożyczenia')
			return res.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['borrowings'] })
			queryClient.invalidateQueries({ queryKey: ['users'] })
			queryClient.invalidateQueries({ queryKey: ['books'] })
		},
	})
}
