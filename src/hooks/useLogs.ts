import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useLogs = () => {
	return useQuery({
		queryKey: ['logs'],
		queryFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/logs`)
			if (!res.ok) throw new Error('Błąd pobierania logów')
			return res.json()
		},
	})
}

export const useCreateLog = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (logData: {
			date: string
			userId: string
			action: string
			details: string
		}) => {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/logs`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(logData),
			})
			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.message || 'Błąd dodawania logu')
			}
			return res.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['logs'] })
		},
	})
}
