import { useMutation } from '@tanstack/react-query'


export const useDeleteBook = () => {
	return useMutation({
		mutationFn: async (bookId: string) => {
			const res = await fetch(`${process.env.BASE_URL}/books/${bookId}`, {
				method: 'DELETE',
			})
			if (!res.ok) throw new Error('Nie udało się usunąć książki')
		},
	})
}
