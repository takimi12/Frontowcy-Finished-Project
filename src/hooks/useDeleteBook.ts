import { useMutation } from '@tanstack/react-query'

export const useDeleteBook = () => {
	return useMutation({
		mutationFn: async (bookId: string) => {
			const res = await fetch(
				`${import.meta.env.VITE_BASE_URL}api/books/${bookId}`,
				{
					method: 'DELETE',
				},
			)
			if (!res.ok) throw new Error('Nie udało się usunąć książki')
		},
	})
}
