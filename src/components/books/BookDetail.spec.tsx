import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import BookDetail from './BookDetail'
import axios from 'axios'
import { vi } from 'vitest'

vi.mock('axios')
// @ts-ignore
const mockedAxios = axios as vi.Mocked<typeof axios>

const mockBook = {
	id: '1',
	title: 'Test Book',
	author: 'John Doe',
	description: 'This is a test book description.',
	year: 2022,
	copies: 3,
}

describe('BookDetail', () => {
	it('should render loading spinner when data is being fetched', () => {
		mockedAxios.get.mockResolvedValueOnce({ data: mockBook })
		render(
			<Router>
				<BookDetail />
			</Router>,
		)

		expect(screen.getByRole('progressbar')).toBeInTheDocument()
	})

	it('should render book details after fetching data', async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: mockBook })
		render(
			<Router>
				<BookDetail />
			</Router>,
		)

		await waitFor(() =>
			expect(screen.getByText(mockBook.title)).toBeInTheDocument(),
		)

		expect(screen.getByText(mockBook.title)).toBeInTheDocument()
		expect(screen.getByText(`Autor: ${mockBook.author}`)).toBeInTheDocument()
		expect(screen.getByText(mockBook.description)).toBeInTheDocument()
		expect(
			screen.getByText(`Rok wydania: ${mockBook.year}`),
		).toBeInTheDocument()
		expect(
			screen.getByText(`Dostępne egzemplarze: ${mockBook.copies}`),
		).toBeInTheDocument()
	})

	it('should handle error when fetching book details', async () => {
		mockedAxios.get.mockRejectedValueOnce(
			new Error('Error fetching book details'),
		)

		render(
			<Router>
				<BookDetail />
			</Router>,
		)

		await waitFor(() =>
			expect(screen.getByRole('progressbar')).toBeInTheDocument(),
		)
	})

	it('should navigate back to the book list when "Wróć do listy" button is clicked', async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: mockBook })
		render(
			<Router>
				<BookDetail />
			</Router>,
		)

		await waitFor(() =>
			expect(screen.getByText(mockBook.title)).toBeInTheDocument(),
		)

		const backButton = screen.getByText(/Wróć do listy/i)

		expect(backButton).toBeInTheDocument()

		backButton.click()
	})
})
