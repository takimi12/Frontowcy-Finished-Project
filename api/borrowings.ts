import { MongoClient, Db, Collection, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import { NextApiRequest, NextApiResponse } from 'next'

dotenv.config()

interface Borrowing {
	_id?: ObjectId
	id?: string
	userId: ObjectId | string // Id użytkownika, który wypożycza
	bookId: ObjectId | string // Id książki, która jest wypożyczana
	borrowDate: Date // Data wypożyczenia
	returnDate?: Date | null // Data zwrotu (opcjonalna)
	[key: string]: any
}

interface ConvertedBorrowing {
	id: string
	[key: string]: any
}

interface ApiResponse {
	message?: string
	insertedId?: ObjectId
	id?: string
	error?: string
}

const uri: string | undefined = process.env.MONGODB_URI
const dbName: string = 'Books' // Nazwa Twojej bazy danych

let cachedClient: MongoClient | null = null

async function connectToDatabase(): Promise<Db> {
	if (!cachedClient) {
		if (!uri) {
			throw new Error('MONGODB_URI is not defined in environment variables.')
		}
		const client = new MongoClient(uri)
		await client.connect()
		cachedClient = client
		console.log('✅ Połączono z bazą danych MongoDB.')
	}
	return cachedClient.db(dbName)
}

function convertMongoDocs(docs: Borrowing[] | null): ConvertedBorrowing[] {
	if (!docs) {
		return []
	}
	return docs.map((doc) => {
		const { _id, ...rest } = doc
		return { id: _id!.toString(), ...rest }
	})
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ConvertedBorrowing[] | ApiResponse>,
): Promise<void> {
	try {
		const db = await connectToDatabase()
		const borrowingsCollection: Collection<Borrowing> =
			db.collection('borrowings')

		switch (req.method) {
			case 'GET': {
				const allBorrowings: Borrowing[] = await borrowingsCollection
					.find({})
					.toArray()
				console.log('📋 Pobrano wypożyczenia:', allBorrowings.length)
				const convertedBorrowings = convertMongoDocs(allBorrowings)
				return res.status(200).json(convertedBorrowings)
			}

			case 'POST': {
				const newBorrowing: Borrowing = req.body

				// Usuń pola '_id' i 'id' jeśli istnieją w body (są generowane automatycznie)
				delete newBorrowing.id
				delete newBorrowing._id

				// Sprawdź, czy wymagane pola istnieją
				if (
					!newBorrowing.userId ||
					!newBorrowing.bookId ||
					!newBorrowing.borrowDate
				) {
					console.log('❌ Brak wymaganych pól dla nowego wypożyczenia.')
					return res.status(400).json({
						error: 'Brak wymaganych pól: userId, bookId i borrowDate.',
					})
				}

				// Konwersja userId i bookId na ObjectId, jeśli przychodzą jako stringi
				if (
					typeof newBorrowing.userId === 'string' &&
					ObjectId.isValid(newBorrowing.userId)
				) {
					newBorrowing.userId = new ObjectId(newBorrowing.userId)
				}
				if (
					typeof newBorrowing.bookId === 'string' &&
					ObjectId.isValid(newBorrowing.bookId)
				) {
					newBorrowing.bookId = new ObjectId(newBorrowing.bookId)
				}

				// Upewnij się, że borrowDate jest obiektem Date
				if (typeof newBorrowing.borrowDate === 'string') {
					newBorrowing.borrowDate = new Date(newBorrowing.borrowDate)
				}
				if (
					newBorrowing.returnDate &&
					typeof newBorrowing.returnDate === 'string'
				) {
					newBorrowing.returnDate = new Date(newBorrowing.returnDate)
				}

				console.log('📚 Dodawanie nowego wypożyczenia:', newBorrowing)
				const result = await borrowingsCollection.insertOne(newBorrowing)
				console.log('✅ Wypożyczenie dodane z ID:', result.insertedId)

				return res.status(201).json({
					message: 'Wypożyczenie dodane',
					insertedId: result.insertedId,
					id: result.insertedId.toString(),
				})
			}

			default: {
				res.setHeader('Allow', ['GET', 'POST'])
				return res.status(405).end(`Method ${req.method} Not Allowed`)
			}
		}
	} catch (error) {
		console.error('❌ Błąd w handlerze /api/borrowings:', error)
		// W zależności od typu błędu, możesz zwrócić bardziej szczegółowe komunikaty
		return res.status(500).json({ error: 'Wystąpił wewnętrzny błąd serwera.' })
	}
}
