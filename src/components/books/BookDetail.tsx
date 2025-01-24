import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import {
	Container,
	Typography,
	Card,
	CardContent,
	CardActions,
	Button,
	Box,
	CircularProgress,
} from '@mui/material'

interface Book {
	id: string
	title: string
	author: string
	description: string
	year: number
	copies: number
}

const BookDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const [book, setBook] = useState<Book | null>(null)

	useEffect(() => {
		axios
			.get<Book>(`http://localhost:3001/books/${id}`)
			.then((response) => setBook(response.data))
			.catch((error) =>
				console.error('Błąd podczas pobierania szczegółów książki:', error),
			)
	}, [id])

	if (!book) {
		return (
			<Container
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '100vh',
				}}
			>
				<CircularProgress />
			</Container>
		)
	}

	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			<Card elevation={3} sx={{ minHeight: '300px', padding: 2 }}>
				<CardContent>
					<Typography variant="h4" component="h2" gutterBottom>
						{book.title}
					</Typography>
					<Typography variant="h6" color="text.secondary" gutterBottom>
						Autor: {book.author}
					</Typography>
					<Typography variant="body1" sx={{ mb: 2 }}>
						{book.description}
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						Rok wydania: {book.year}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Dostępne egzemplarze: {book.copies}
					</Typography>
				</CardContent>
				<CardActions>
					<Button
						size="small"
						component={Link}
						to="/"
						variant="contained"
						color="primary"
					>
						Wróć do listy
					</Button>
				</CardActions>
			</Card>
		</Container>
	)
}

export default BookDetail
