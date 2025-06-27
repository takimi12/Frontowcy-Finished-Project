import { MongoClient, Db, Collection, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import { NextApiRequest, NextApiResponse } from 'next'

dotenv.config()

interface Book {
	_id?: ObjectId
	id?: string
	title?: string
	author?: string
	[key: string]: any
}

interface ConvertedBook {
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
		return { id: _id!.toString(), ...rest }
	})
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ConvertedBook[] | ApiResponse>
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

			default: {
				res.setHeader('Allow', ['GET', 'POST'])
				return res.status(405).end(`Method ${req.method} Not Allowed`)
			}
		}
	} catch (error) {
		console.error('❌ Błąd w handlerze /api/books:', error)
		return res.status(500).json({ error: 'Wystąpił wewnętrzny błąd serwera.' })
	}
}