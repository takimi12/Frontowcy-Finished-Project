import { render, screen, fireEvent } from '@testing-library/react'
import { BookEditForm } from './EditBookForm'
import { describe, it, expect, vi } from 'vitest'
import { Book } from '../../../types/types'

describe('BookEditForm', () => {
	const mockBook: Book = {
		id: '1',
		title: 'Sample Title',
		author: 'Sample Author',
		description: 'Sample Description',
		year: 2021,
		copies: 5,
		borrowedBy: ['user1', 'user2'],
	}

	const onBookChangeMock = vi.fn()
	const onSubmitMock = vi.fn().mockResolvedValue(undefined)
	const onCancelMock = vi.fn()

	it('renders the form fields correctly', () => {
		render(
			<BookEditForm
				book={mockBook}
				onBookChange={onBookChangeMock}
				onSubmit={onSubmitMock}
				onCancel={onCancelMock}
			/>,
		)

		expect(screen.getByRole('textbox', { name: /Tytuł/i })).toBeInTheDocument()
		expect(screen.getByRole('textbox', { name: /Autor/i })).toBeInTheDocument()
		expect(screen.getByRole('textbox', { name: /Opis/i })).toBeInTheDocument()
		expect(
			screen.getByRole('spinbutton', { name: /Rok wydania/i }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('spinbutton', { name: /Liczba kopii/i }),
		).toBeInTheDocument()
	})

	it('displays validation error when copies are less than borrowedBy length', () => {
		render(
			<BookEditForm
				book={{ ...mockBook, copies: 1 }}
				onBookChange={onBookChangeMock}
				onSubmit={onSubmitMock}
				onCancel={onCancelMock}
			/>,
		)

		fireEvent.change(
			screen.getByRole('spinbutton', { name: /Liczba kopii/i }),
			{ target: { value: '1' } },
		)
		expect(
			screen.getByText(
				'Liczba kopii nie może być mniejsza niż liczba wypożyczonych książek',
			),
		).toBeInTheDocument()
	})

	it('calls onSubmit when form is submitted and validation passes', async () => {
		render(
			<BookEditForm
				book={mockBook}
				onBookChange={onBookChangeMock}
				onSubmit={onSubmitMock}
				onCancel={onCancelMock}
			/>,
		)

		fireEvent.change(
			screen.getByRole('spinbutton', { name: /Liczba kopii/i }),
			{ target: { value: '5' } },
		)
		fireEvent.submit(screen.getByRole('button', { name: /Zapisz/i }))

		expect(onSubmitMock).toHaveBeenCalledTimes(1)
	})

	it('calls onCancel when cancel button is clicked', () => {
		render(
			<BookEditForm
				book={mockBook}
				onBookChange={onBookChangeMock}
				onSubmit={onSubmitMock}
				onCancel={onCancelMock}
			/>,
		)

		fireEvent.click(screen.getByRole('button', { name: /Anuluj/i }))
		expect(onCancelMock).toHaveBeenCalledTimes(1)
	})

	it('disables submit button if validation error exists', () => {
		render(
			<BookEditForm
				book={{ ...mockBook, copies: 1 }}
				onBookChange={onBookChangeMock}
				onSubmit={onSubmitMock}
				onCancel={onCancelMock}
			/>,
		)

		const submitButton = screen.getByRole('button', { name: /Zapisz/i })
		expect(submitButton).toBeDisabled()
	})

	it('calls onBookChange when form fields are changed', () => {
		render(
			<BookEditForm
				book={mockBook}
				onBookChange={onBookChangeMock}
				onSubmit={onSubmitMock}
				onCancel={onCancelMock}
			/>,
		)

		fireEvent.change(screen.getByRole('textbox', { name: /Tytuł/i }), {
			target: { value: 'New Title' },
		})
		expect(onBookChangeMock).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'New Title' }),
		)
	})
})
