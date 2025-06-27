import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from '../utils/db'
import { convertMongoDocs } from '../utils/mongoConverters'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const db = await connectToDatabase()
	const booksCollection = db.collection('books')

	try {
		switch (req.method) {
			case 'GET': {
				const allBooks = await booksCollection.find({}).toArray()
				console.log('📚 Pobrano książki:', allBooks.length)
				const convertedBooks = convertMongoDocs(allBooks)
				return res.status(200).json(convertedBooks)
			}

			case 'POST': {
				const newBook = req.body
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

			default:
				res.setHeader('Allow', ['GET', 'POST'])
				return res.status(405).end(`Method ${req.method} Not Allowed`)
		}
	} catch (error) {
		console.error('❌ Błąd w handlerze /api/books:', error)
		return res.status(500).json({ error: 'Internal Server Error' })
	}
}
