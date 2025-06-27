import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config()

const uri =
	process.env.MONGODB_URI ||
	'mongodb+srv://tomek12olech:7MytflC2STM5Wroe@cluster.etrcyrp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster'
const dbName = 'Books'

let cachedClient = null

async function connectToDatabase() {
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

export default async function handler(req, res) {
	try {
		const db = await connectToDatabase()
		const booksCollection = db.collection('books')

		switch (req.method) {
			case 'GET': {
				const allBooks = await booksCollection.find({}).toArray()
				console.log('📚 Pobrano książki:', allBooks.length)

				// Konwersja dokumentów MongoDB (dodanie pola 'id')
				const convertedBooks = allBooks.map((book) => ({
					...book,
					id: book._id.toString(),
				}))

				return res.status(200).json(convertedBooks)
			}

			case 'POST': {
				const newBook = req.body

				// Usuwamy id, bo MongoDB automatycznie dodaje _id
				delete newBook.id

				// Dodajemy timestamp
				newBook.createdAt = new Date()

				console.log('📚 Dodawanie nowej książki:', newBook)

				const result = await booksCollection.insertOne(newBook)
				console.log('✅ Książka dodana z ID:', result.insertedId)

				return res.status(201).json({
					insertedId: result.insertedId,
					id: result.insertedId.toString(),
					message: 'Książka dodana pomyślnie.',
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
