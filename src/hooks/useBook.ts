import { useQuery } from '@tanstack/react-query'
import { Book } from '@/types/types'

export const useBook = (id: string) =>
	useQuery<Book>({
		queryKey: ['book', id],
		queryFn: async () => {
			const res = await fetch(`http://localhost:3002/books/${id}`)
			if (!res.ok) throw new Error('Błąd pobierania szczegółów książki')
			return res.json()
		},
		enabled: !!id,
	})
