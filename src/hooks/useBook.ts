import { useQuery } from '@tanstack/react-query'
import { Book } from '@/types/types'



export const useBook = (id: string) => {
    console.log('VITE_BASE_URL:', import.meta.env.VITE_BASE_URL);

    return useQuery<Book>({
        queryKey: ['book', id],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/books/${id}`)
            if (!res.ok) throw new Error('Błąd pobierania szczegółów książki')
            return res.json()
        },
        enabled: !!id,
    })
}