import { MongoClient, Db, Collection, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import { NextApiRequest, NextApiResponse } from 'next'

dotenv.config()

interface Book {
	_id?: ObjectId | string
	id?: string
	title?: string
	author?: string
	description?: string
	year?: number
	copies?: number
	borrowedBy?: any[]
	[key: string]: any
}

interface ConvertedBook {
	id: string
	[key: string]: any
}

interface ApiResponse {
	message?: string
	insertedId?: ObjectId | string
	id?: string
	error?: string
}

const uri: string | undefined = process.env.MONGODB_URI
const dbName: string = 'Books'

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

function convertMongoDocs(docs: Book[] | null): ConvertedBook[] {
	if (!docs) {
		return []
	}
	return docs.map((doc) => {
		const { _id, ...rest } = doc
		return { 
			id: _id ? (_id instanceof ObjectId ? _id.toString() : _id.toString()) : '',
			...rest 
		}
	})
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ConvertedBook[] | ApiResponse>,
): Promise<void> {
	try {
		const db = await connectToDatabase()
		const booksCollection: Collection<Book> = db.collection('books')

		switch (req.method) {
			case 'GET': {
				const allBooks: Book[] = await booksCollection.find({}).toArray()
				console.log('📚 Pobrano książki:', allBooks.length)
				const convertedBooks = convertMongoDocs(allBooks)
				return res.status(200).json(convertedBooks)
			}

			case 'POST': {
				const newBook: Book = req.body
				// Usuń id i _id z body żeby MongoDB mogło wygenerować własne _id
				delete newBook.id
				delete newBook._id

				console.log('📚 Dodawanie nowej książki:', newBook)
				const result = await booksCollection.insertOne(newBook)
				console.log('✅ Książka dodana z ID:', result.insertedId)

				return res.status(201).json({
					message: 'Książka dodana',
					insertedId: result.insertedId,
					id: result.insertedId.toString(),
				})
			}

			case 'PUT': {
				const { id, ...updateData } = req.body
				
				if (!id) {
					return res.status(400).json({ error: 'ID książki jest wymagane.' })
				}

				// Usuń _id z danych do aktualizacji
				delete updateData._id

				console.log('📚 Aktualizacja książki o ID:', id)
				
				// Sprawdź czy id to ObjectId czy string
				let query: any
				if (ObjectId.isValid(id) && id.length === 24) {
					query = { _id: new ObjectId(id) }
				} else {
					query = { _id: id }
				}

				const result = await booksCollection.updateOne(
					query,
					{ $set: updateData }
				)

				if (result.matchedCount === 0) {
					return res.status(404).json({ error: 'Książka nie została znaleziona.' })
				}

				console.log('✅ Książka zaktualizowana')
				return res.status(200).json({
					message: 'Książka zaktualizowana',
					id: id
				})
			}

			case 'DELETE': {
				const { id } = req.query

				if (!id || typeof id !== 'string') {
					return res.status(400).json({ error: 'ID książki jest wymagane.' })
				}

				console.log('📚 Usuwanie książki o ID:', id)

				// Sprawdź czy id to ObjectId czy string
				let query: any
				if (ObjectId.isValid(id) && id.length === 24) {
					query = { _id: new ObjectId(id) }
				} else {
					query = { _id: id }
				}

				const result = await booksCollection.deleteOne(query)

				if (result.deletedCount === 0) {
					return res.status(404).json({ error: 'Książka nie została znaleziona.' })
				}

				console.log('✅ Książka usunięta')
				return res.status(200).json({
					message: 'Książka usunięta',
					id: id
				})
			}

			default: {
				res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
				return res.status(405).end(`Method ${req.method} Not Allowed`)
			}
		}
	} catch (error) {
		console.error('❌ Błąd w handlerze /api/books:', error)
		return res.status(500).json({ error: 'Wystąpił wewnętrzny błąd serwera.' })
	}
}