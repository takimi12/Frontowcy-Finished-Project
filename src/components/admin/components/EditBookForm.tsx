import React, { useState, useEffect } from 'react'
import { TextField, Button, Box, FormHelperText } from '@mui/material'
import { Book } from '../../../types/types'

interface BookEditFormProps {
	book: Book
	onBookChange: (book: Book) => void
	onSubmit: (e: React.FormEvent) => Promise<void>
	onCancel: () => void
}

export const BookEditForm: React.FC<BookEditFormProps> = ({
	book,
	onBookChange,
	onSubmit,
	onCancel,
}) => {
	const [validationError, setValidationError] = useState<string>('')

	useEffect(() => {
		validateCopies(book.copies)
	}, [book.copies, book.borrowedBy])

	const validateCopies = (copies: number) => {
		if (copies < (book.borrowedBy?.length || 0)) {
			setValidationError(
				'Liczba kopii nie może być mniejsza niż liczba wypożyczonych książek',
			)
		} else {
			setValidationError('')
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!validationError) {
			onSubmit(e)
		}
	}

	const handleCopiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newCopies = parseInt(e.target.value)
		onBookChange({ ...book, copies: newCopies })
		validateCopies(newCopies)
	}

	return (
		<form onSubmit={handleSubmit}>
			<Box sx={{ display: 'grid', gap: 2 }}>
				<TextField
					label="Tytuł"
					value={book.title}
					onChange={(e) => onBookChange({ ...book, title: e.target.value })}
					required
					fullWidth
				/>
				<TextField
					label="Autor"
					value={book.author}
					onChange={(e) => onBookChange({ ...book, author: e.target.value })}
					required
					fullWidth
				/>
				<TextField
					label="Opis"
					value={book.description}
					onChange={(e) =>
						onBookChange({ ...book, description: e.target.value })
					}
					required
					fullWidth
					multiline
					rows={3}
				/>
				<TextField
					label="Rok wydania"
					type="number"
					value={book.year}
					onChange={(e) =>
						onBookChange({ ...book, year: parseInt(e.target.value) })
					}
					required
					fullWidth
				/>
				<Box>
					<TextField
						label="Liczba kopii"
						type="number"
						value={book.copies}
						onChange={handleCopiesChange}
						required
						fullWidth
						error={!!validationError}
					/>
					{validationError && (
						<FormHelperText error sx={{ ml: 1 }}>
							{validationError}
						</FormHelperText>
					)}
				</Box>
				<Box sx={{ display: 'flex', gap: 1 }}>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={!!validationError}
					>
						Zapisz
					</Button>
					<Button variant="outlined" onClick={onCancel}>
						Anuluj
					</Button>
				</Box>
			</Box>
		</form>
	)
}
