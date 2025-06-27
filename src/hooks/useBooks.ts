import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Book } from '@/types/types'

export const useBooks = () => {
	return useQuery<Book[]>({
		queryKey: ['books'],
		queryFn: async () => {
			const res = await fetch('https://frontowcy-finished-project-op3s.vercel.app/Books')
			if (!res.ok) throw new Error('Błąd pobierania książek')
			return res.json()
		},
	})
}

export const useUpdateBook = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (book: Book) => {
			const res = await fetch(`https://frontowcy-finished-project-op3s.vercel.app/${book.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(book),
			})
			if (!res.ok) throw new Error('Błąd aktualizacji książki')
			return res.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['books'] })
		},
	})
}
