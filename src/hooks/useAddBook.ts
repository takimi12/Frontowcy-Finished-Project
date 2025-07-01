import { NewBook, Book } from '@/types/types'
import { useMutation } from '@tanstack/react-query'

export const useAddBook = () => {
	
	return useMutation<Book, Error, NewBook>({
		mutationFn: async (newBook: NewBook) => {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/books`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newBook),
			})
			if (!res.ok) throw new Error('Nie udało się dodać książki')
			return res.json()
		},
	})
}
