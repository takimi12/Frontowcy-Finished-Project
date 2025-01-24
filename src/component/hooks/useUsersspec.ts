import { renderHook } from '@testing-library/react'
import { useUsers } from './useUsers'
import { SingleUser } from '../types'
import * as apiHook from './useApi'
import { act } from 'react'

describe('useUsers', () => {
	it('Verify that initial users nad adults are empty', () => {
		const { result } = renderHook(() => useUsers())

		expect(result.current.adults).toHaveLength(0)
		expect(result.current.users).toHaveLength(0)
	})

	it('should get users from the API', async () => {
		const reuturnedUsers: SingleUser[] = [
			{ id: '1', name: 'AAA', age: 10 },
			{ id: '2', name: 'BBB', age: 11 },
			{ id: '3', name: 'CCC', age: 12 },
			{ id: '3', name: 'DDD', age: 13 },
		]

		vi.spyOn(apiHook, 'useApi').mockReturnValueOnce({
			get: async <R>() =>
				new Promise<R>((resolve) => resolve(reuturnedUsers as R)),
		})

		const { result } = renderHook(() => useUsers())

		act(async () => {
			await result.current.getUsers()
		})

		expect(result.current.adults).toHaveLength(0)
		expect(result.current.users).toHaveLength(0)
	})
})
