import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Counter } from './Counter'

const fireEvent = userEvent.setup()

describe('Counter', () => {
	it('initial value should be rendered', () => {
		render(<Counter />)
		const counterElement = screen.getByTestId('counter-value')

		expect(counterElement).toHaveTextContent(/^0$/)
	})

	it('custom initial value should be rendered', () => {
		render(<Counter initialValue={100} />)

		const counterElement = screen.getByTestId('counter-value')

		expect(counterElement).toHaveTextContent(/^100$/)
	})

	it('should increment counter value after clicking the button', async () => {
		render(<Counter />)

		const counterElement = screen.getByTestId('counter-value')
		const buttonElement = screen.getByTestId('counter-button')

		await fireEvent.click(buttonElement)

		expect(counterElement).toHaveTextContent(/^0$/)
	})
})
