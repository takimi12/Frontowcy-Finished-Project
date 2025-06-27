import { NewBook, Book } from '@/types/types'
import { useMutation } from '@tanstack/react-query'

export const useAddBook = () => {
	return useMutation<Book, Error, NewBook>({
		mutationFn: async (newBook: NewBook) => {
			const res = await fetch('https://frontowcy-finished-project-op3s.vercel.app/books', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newBook),
			})
			if (!res.ok) throw new Error('Nie udało się dodać książki')
			return res.json()
		},
	})
}
