import React from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
} from '@mui/material'
import { Book } from '../../../types/types'

interface DeleteBookDialogProps {
	book: Book | null
	open: boolean
	onClose: () => void
	onConfirm: (book: Book) => Promise<void>
}

export const DeleteBookDialog: React.FC<DeleteBookDialogProps> = ({
	book,
	open,
	onClose,
	onConfirm,
}) => {
	const canDelete = book?.borrowedBy && book.borrowedBy.length === 0

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Usuwanie książki</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{!canDelete
						? 'Nie można usunąć książki, która jest aktualnie wypożyczona.'
						: 'Czy na pewno chcesz usunąć tę książkę?'}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Anuluj</Button>
				{canDelete && book && (
					<Button onClick={() => onConfirm(book)} color="error" autoFocus>
						Usuń
					</Button>
				)}
			</DialogActions>
		</Dialog>
	)
}
