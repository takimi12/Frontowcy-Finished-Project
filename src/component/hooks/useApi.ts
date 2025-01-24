export const useApi = () => {
	const get = async <R>(url: string) => {
		const response = await fetch(`http://localhost:3001/${url}`)
		const data: R = await response.json()

		return data
	}

	return {
		get,
	}
}
