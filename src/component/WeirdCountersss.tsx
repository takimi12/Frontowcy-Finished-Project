import { render, screen } from '@testing-library/react'
import { WeirdCounter } from './WeirdCounter'
import userEvent from '@testing-library/user-event'
import { useRandomValue } from './hooks/useRandomValue'
import * as randomHook from './hooks/useRandomValue'

const fireEvent = userEvent.setup()

// vi.mock("./hooks/useRandomValue", async (importOriginal) => ({

// ...await importOriginal(),
//     useRandomValue: () => {
//         return () => 999
//     }
// }))

describe('WeirdCounter', () => {
	it('initial value should be rendered', () => {
		render(<WeirdCounter />)
		const counterElement = screen.getByTestId('counter-value')

		expect(counterElement).toHaveTextContent(/^0$/)
	})

	it('should set random counter value after clicking the button', async () => {
		vi.spyOn(randomHook, 'useRandomValue').mockReturnValueOnce(() => 9929)

		render(<WeirdCounter />)

		const counterElement = screen.getByTestId('counter-value')
		const buttonElement = screen.getByTestId('counter-button')

		await fireEvent.click(buttonElement)

		expect(counterElement).toHaveTextContent(/^999$/)
	})
})
