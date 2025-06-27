import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
	Container,
	Typography,
	Card,
	CardContent,
	CardActions,
	Button,
	CircularProgress,
} from '@mui/material'
import { useBook } from '../../hooks/useBook'

const BookDetail: React.FC = () => {
	const { id } = useParams()

	const { data: book, isLoading, isError } = useBook(id!)

	if (isLoading) {
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

	if (isError || !book) {
		return (
			<Container sx={{ py: 4 }}>
				<Typography variant="h6" color="error">
					Błąd podczas ładowania szczegółów książki.
				</Typography>
				<Button
					size="small"
					component={Link}
					to="/"
					variant="contained"
					color="primary"
					sx={{ mt: 2 }}
				>
					Wróć do listy
				</Button>
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
