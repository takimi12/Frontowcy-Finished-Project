import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddBookForm } from './AddBookForm'
import { NewBook } from '../../../types/types'

describe('AddBookForm', () => {
	const mockNewBook: NewBook = {
		title: '',
		author: '',
		description: '',
		year: '',
		copies: '',
	}

	const mockOnNewBookChange = vi.fn()
	const mockOnSubmit = vi.fn((e) => {
		e.preventDefault()
		return Promise.resolve()
	})

	const setup = () => {
		return render(
			<AddBookForm
				newBook={mockNewBook}
				onNewBookChange={mockOnNewBookChange}
				onSubmit={mockOnSubmit}
			/>,
		)
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders all form fields correctly', () => {
		setup()

		expect(screen.getByLabelText(/tytuł/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/autor/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/opis/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/rok wydania/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/liczba kopii/i)).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /dodaj książkę/i }),
		).toBeInTheDocument()
	})

	it('calls onNewBookChange when input values change', () => {
		setup()
		const titleInput = screen.getByLabelText(/tytuł/i)

		fireEvent.change(titleInput, { target: { value: 'Nowa książka' } })

		expect(mockOnNewBookChange).toHaveBeenCalledWith({
			...mockNewBook,
			title: 'Nowa książka',
		})
	})

	it('calls onSubmit when form is submitted', async () => {
		setup()

		const titleInput = screen.getByLabelText(/tytuł/i)
		const authorInput = screen.getByLabelText(/autor/i)
		const descriptionInput = screen.getByLabelText(/opis/i)
		const yearInput = screen.getByLabelText(/rok wydania/i)
		const copiesInput = screen.getByLabelText(/liczba kopii/i)

		fireEvent.change(titleInput, { target: { value: 'Tytuł książki' } })
		fireEvent.change(authorInput, { target: { value: 'Jan Kowalski' } })
		fireEvent.change(descriptionInput, { target: { value: 'Opis książki' } })
		fireEvent.change(yearInput, { target: { value: '2024' } })
		fireEvent.change(copiesInput, { target: { value: '5' } })

		const form = screen.getByRole('form')
		fireEvent.submit(form)

		expect(mockOnSubmit).toHaveBeenCalled()
	})

	it('requires all fields to be filled before submission', async () => {
		setup()
		const submitButton = screen.getByRole('button', { name: /dodaj książkę/i })
		fireEvent.click(submitButton)

		expect(mockOnSubmit).not.toHaveBeenCalled()
	})

	it('handles number inputs correctly', () => {
		setup()

		const yearInput = screen.getByLabelText(/rok wydania/i)
		fireEvent.change(yearInput, { target: { value: '2024' } })

		expect(mockOnNewBookChange).toHaveBeenLastCalledWith(
			expect.objectContaining({
				year: '2024',
			}),
		)

		const copiesInput = screen.getByLabelText(/liczba kopii/i)
		fireEvent.change(copiesInput, { target: { value: '5' } })

		expect(mockOnNewBookChange).toHaveBeenLastCalledWith(
			expect.objectContaining({
				copies: '5',
			}),
		)
	})

	it('validates numeric fields accept only numbers', async () => {
		setup()
		const yearInput = screen.getByLabelText(/rok wydania/i) as HTMLInputElement
		const copiesInput = screen.getByLabelText(
			/liczba kopii/i,
		) as HTMLInputElement

		fireEvent.change(yearInput, { target: { value: 'abc' } })
		fireEvent.change(copiesInput, { target: { value: 'abc' } })

		expect(yearInput.value).toBe('')
		expect(copiesInput.value).toBe('')
	})
})
