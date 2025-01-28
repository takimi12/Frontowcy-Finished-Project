import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import UserPanel from './UserPanel'
import * as AuthContext from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
	...vi.importActual('../../context/AuthContext'),
	useAuth: vi.fn(),
}))

vi.mock('./BorrowingStats', () => ({
	__esModule: true,
	default: vi.fn(() => <div>BorrowingStats Component</div>),
}))

vi.mock('./BorrowingHistory', () => ({
	__esModule: true,
	default: vi.fn(() => <div>BorrowingHistory Component</div>),
}))

vi.mock('./AccountDeletion', () => ({
	__esModule: true,
	default: vi.fn(() => <div>ResignMembership Component</div>),
}))

describe('UserPanel', () => {
	it('should render user data when user is logged in', () => {
		// @ts-expect-error Ignoring vi.Mock
		;(AuthContext.useAuth as vi.Mock).mockReturnValue({
			user: {
				name: 'John',
				surname: 'Doe',
				email: 'john.doe@example.com',
				cardId: '12345',
			},
			login: vi.fn(),
			logout: vi.fn(),
		})

		render(<UserPanel />)

		expect(screen.getByText('Imię: John')).toBeInTheDocument()
		expect(screen.getByText('Nazwisko: Doe')).toBeInTheDocument()
		expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument()
		expect(
			screen.getByText('Numer karty bibliotecznej: 12345'),
		).toBeInTheDocument()
	})

	it('should show "Nie jesteś zalogowany" when user is not logged in', () => {
		// @ts-expect-error Ignoring vi.Mock
		;(AuthContext.useAuth as vi.Mock).mockReturnValue({
			user: null,
			login: vi.fn(),
			logout: vi.fn(),
		})

		render(<UserPanel />)

		expect(screen.getByText('Nie jesteś zalogowany.')).toBeInTheDocument()
	})

	it('should update selected month on input change', () => {
		// @ts-expect-error Ignoring vi.Mock
		;(AuthContext.useAuth as vi.Mock).mockReturnValue({
			user: {
				name: 'John',
				surname: 'Doe',
				email: 'john.doe@example.com',
				cardId: '12345',
			},
			login: vi.fn(),
			logout: vi.fn(),
		})

		render(<UserPanel />)

		// Poprawiona etykieta - usunięto dwukropek
		const monthInput = screen.getByLabelText('Wybierz miesiąc')
		fireEvent.change(monthInput, { target: { value: '2025-05' } })

		expect(monthInput).toHaveValue('2025-05')
	})
	it('should render BorrowingStats, BorrowingHistory, and ResignMembership components', () => {
		// @ts-expect-error Ignoring vi.Mock
		;(AuthContext.useAuth as vi.Mock).mockReturnValue({
			user: {
				name: 'John',
				surname: 'Doe',
				email: 'john.doe@example.com',
				cardId: '12345',
			},
			login: vi.fn(),
			logout: vi.fn(),
		})

		render(<UserPanel />)

		expect(screen.getByText('BorrowingStats Component')).toBeInTheDocument()
		expect(screen.getByText('BorrowingHistory Component')).toBeInTheDocument()
		expect(screen.getByText('ResignMembership Component')).toBeInTheDocument()
	})
})
