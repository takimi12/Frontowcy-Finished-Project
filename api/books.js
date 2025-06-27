import { MongoClient} from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI
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

function convertMongoDocs(docs) {
	if (!docs) {
		return []
	}
	return docs.map((doc) => {
		const { _id, ...rest } = doc
		return { id: _id.toString(), ...rest }
	})
}

export default async function handler(req, res) {
	try {
		const db = await connectToDatabase()
		const booksCollection = db.collection('books') 

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
