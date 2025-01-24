import React from 'react'
import { TextField, Button, Paper, Typography, Box } from '@mui/material'
import { NewBook } from '../../../types/types'

interface AddBookFormProps {
	newBook: NewBook
	onNewBookChange: (book: NewBook) => void
	onSubmit: (e: React.FormEvent) => Promise<void>
}

export const AddBookForm: React.FC<AddBookFormProps> = ({
	newBook,
	onNewBookChange,
	onSubmit,
}) => {
	return (
		<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
			<Typography variant="h5" gutterBottom>
				Dodaj nową książkę
			</Typography>
			<form onSubmit={onSubmit} role="form">
				<Box sx={{ display: 'grid', gap: 2 }}>
					<TextField
						label="Tytuł"
						value={newBook.title}
						onChange={(e) =>
							onNewBookChange({ ...newBook, title: e.target.value })
						}
						required
						fullWidth
					/>
					<TextField
						label="Autor"
						value={newBook.author}
						onChange={(e) =>
							onNewBookChange({ ...newBook, author: e.target.value })
						}
						required
						fullWidth
					/>
					<TextField
						label="Opis"
						value={newBook.description}
						onChange={(e) =>
							onNewBookChange({ ...newBook, description: e.target.value })
						}
						required
						fullWidth
						multiline
						rows={3}
					/>
					<TextField
						label="Rok wydania"
						type="number"
						value={newBook.year}
						onChange={(e) =>
							onNewBookChange({ ...newBook, year: e.target.value })
						}
						required
						fullWidth
					/>
					<TextField
						label="Liczba kopii"
						type="number"
						value={newBook.copies}
						onChange={(e) =>
							onNewBookChange({ ...newBook, copies: e.target.value })
						}
						required
						fullWidth
					/>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						role="button"
					>
						Dodaj książkę
					</Button>
				</Box>
			</form>
		</Paper>
	)
}
