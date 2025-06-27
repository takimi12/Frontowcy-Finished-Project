export interface Book {
	_id: string
	id: string
	title: string
	author: string
	description: string
	year: number
	copies: number
	borrowedBy: string[]
}

export interface NewBook {
	title: string
	author: string
	description: string
	year: number
	copies: number
	borrowedBy: string[]
}

export type Borrowing = {
	id: string
	userId: string
	bookId: string
	borrowDate: string
	expectedreturnDate: string
	returnDate: string
}
export type User = {
	_id: string
	id: string
	name: string
	surname: string
	email: string
	password: string
	cardId: string
	role: 'Admin' | 'Klient'
	borrowedBooks: string[]
}
export interface NewBorrowing {
	userId: string
	bookId: string
	borrowDate: string
	expectedreturnDate: string
	returnDate: string
}
