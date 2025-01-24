export interface Book {
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
	year: string
	copies: string
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
	id: string
	name: string
	surname: string
	email: string
	password: string
	cardId: string
	role: 'Admin' | 'Klient'
	borrowedBooks: string[]
}

//   // types/types.ts
// export interface Book {
//   id: number;
//   title: string;
//   author: string;
//   description: string;
//   year: number;
//   copies: number;
//   borrowedBy?: User[];
// }

// export interface NewBook {
//   title: string;
//   author: string;
//   description: string;
//   year: string;
//   copies: string;
// }

// export interface User {
//   id: number;
//   name: string;
//   // Add other user properties as needed
// }

// export interface Borrowing {
//   id: number;
//   userId: number;
//   bookId: number;
// }
