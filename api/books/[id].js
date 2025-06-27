import { MongoClient, ObjectId } from 'mongodb'
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

const convertMongoDoc = (doc) => {
	if (!doc) return null
	return {
		...doc,
		id: doc._id.toString(),
	}
}

export default async function handler(req, res) {
	try {
		const db = await connectToDatabase()
		const booksCollection = db.collection('books')

		const { id } = req.query

		switch (req.method) {
			case 'GET': {
				console.log('🔍 Pobieranie książki o ID:', id)

				let query
				if (ObjectId.isValid(id)) {
					query = { _id: new ObjectId(id) }
				} else {
					query = { id: id }
				}

				const book = await booksCollection.findOne(query)

				if (!book) {
					console.log('❌ Książka nie znaleziona dla ID:', id)
					return res.status(404).json({ error: 'Książka nie znaleziona' })
				}

				console.log('✅ Książka pobrana:', book.title || 'bez tytułu')

				const convertedBook = convertMongoDoc(book)
				return res.status(200).json(convertedBook)
			}

			case 'PUT': {
				const updatedBook = { ...req.body }

				delete updatedBook.id
				delete updatedBook._id

				console.log('🔍 Rozpoczęcie aktualizacji książki:', {
					bookId: id,
					isValidObjectId: ObjectId.isValid(id),
					updatedData: updatedBook,
				})

				let query
				if (ObjectId.isValid(id)) {
					query = { _id: new ObjectId(id) }
				} else {
					query = { id: id }
				}

				const result = await booksCollection.updateOne(query, {
					$set: updatedBook,
				})

				console.log('📊 Wynik operacji aktualizacji książki:', {
					matchedCount: result.matchedCount,
					modifiedCount: result.modifiedCount,
				})

				if (result.matchedCount === 0) {
					console.log(
						'❌ Błąd: Książka o podanym ID nie została znaleziona w bazie:',
						id,
					)
					return res.status(404).json({ error: 'Książka nie znaleziona' })
				}

				console.log('✅ Książka zaktualizowana pomyślnie!')
				return res.status(200).json({ message: 'Książka zaktualizowana' })
			}

			case 'DELETE': {
				console.log('🔍 Usuwanie książki o ID:', id)

				if (!ObjectId.isValid(id)) {
					console.log('❌ Nieprawidłowy ObjectId dla książki:', id)
					return res.status(400).json({ error: 'Nieprawidłowy ID książki' })
				}

				const result = await booksCollection.deleteOne({
					_id: new ObjectId(id),
				})

				console.log('📊 Wynik operacji usunięcia książki:', {
					deletedCount: result.deletedCount,
				})

				if (result.deletedCount === 0) {
					console.log('❌ Książka nie znaleziona dla ID:', id)
					return res.status(404).json({ error: 'Książka nie znaleziona' })
				}

				console.log('✅ Książka usunięta pomyślnie!')
				return res.status(200).json({ message: 'Książka usunięta pomyślnie' })
			}

			default: {
				res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
				return res.status(405).end(`Method ${req.method} Not Allowed`)
			}
		}
	} catch (error) {
		console.error('❌ Błąd w handlerze /api/book/[id]:', error)
		console.error('Stack Trace:', error.stack)
		return res.status(500).json({ error: 'Wystąpił wewnętrzny błąd serwera.' })
	}
}
