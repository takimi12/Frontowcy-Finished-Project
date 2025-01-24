import { useState } from 'react'
import { useRandomValue } from './hooks/useRandomValue'

export type WeirdCounterProps = {
	initialValue?: number
}

export const WeirdCounter = ({ initialValue }: WeirdCounterProps) => {
	const randomize = useRandomValue()

	const [counter, setCounter] = useState(initialValue || 0)

	const handleClick = () => {
		setCounter(randomize())
	}

	return (
		<div>
			<h1 data-testid="counter-value">{counter}</h1>
			<button data-testid="counter-button" onClick={handleClick}>
				{' '}
				+1
			</button>
		</div>
	)
}
