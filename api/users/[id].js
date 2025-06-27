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

// Funkcja pomocnicza do konwersji dokumentu MongoDB na obiekt z polem 'id'
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
		const usersCollection = db.collection('users')

		const { id } = req.query

		switch (req.method) {
			case 'GET': {
				console.log('🔍 Pobieranie użytkownika o ID:', id)

				let query
				if (ObjectId.isValid(id)) {
					query = { _id: new ObjectId(id) }
				} else {
					query = { id: id }
				}

				const user = await usersCollection.findOne(query)

				if (!user) {
					console.log('❌ Użytkownik nie znaleziony dla ID:', id)
					return res.status(404).json({ error: 'Użytkownik nie znaleziony' })
				}

				console.log(
					'✅ Użytkownik pobrany:',
					user.email || user.cardId || 'bez danych',
				)

				const convertedUser = convertMongoDoc(user)
				return res.status(200).json(convertedUser)
			}

			case 'PUT': {
				const updatedUser = { ...req.body }

				// Usuwamy id i _id
				delete updatedUser.id
				delete updatedUser._id

				console.log('🔍 Aktualizacja użytkownika:', {
					userId: id,
					isValidObjectId: ObjectId.isValid(id),
					updatedData: updatedUser,
				})

				let query
				if (ObjectId.isValid(id)) {
					query = { _id: new ObjectId(id) }
				} else {
					query = { id: id } // Fallback
				}

				const result = await usersCollection.updateOne(query, {
					$set: updatedUser,
				})

				console.log('📊 Wynik aktualizacji użytkownika:', {
					matchedCount: result.matchedCount,
					modifiedCount: result.modifiedCount,
				})

				if (result.matchedCount === 0) {
					console.log('❌ Użytkownik nie znaleziony dla ID:', id)
					return res.status(404).json({ error: 'Użytkownik nie znaleziony' })
				}

				console.log('✅ Użytkownik zaktualizowany pomyślnie')
				return res.status(200).json({ message: 'Użytkownik zaktualizowany' })
			}

			case 'DELETE': {
				console.log('🔍 Usuwanie użytkownika o ID:', id)

				if (!ObjectId.isValid(id)) {
					console.log('❌ Nieprawidłowy ObjectId dla użytkownika:', id)
					return res.status(400).json({ error: 'Nieprawidłowy ID użytkownika' })
				}

				const result = await usersCollection.deleteOne({
					_id: new ObjectId(id),
				})

				console.log('📊 Wynik operacji usunięcia użytkownika:', {
					deletedCount: result.deletedCount,
				})

				if (result.deletedCount === 0) {
					console.log('❌ Użytkownik nie znaleziony dla ID:', id)
					return res.status(404).json({ error: 'Użytkownik nie znaleziony' })
				}

				console.log('✅ Użytkownik usunięty pomyślnie!')
				return res
					.status(200)
					.json({ message: 'Użytkownik usunięty pomyślnie' })
			}

			default: {
				res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
				return res.status(405).end(`Method ${req.method} Not Allowed`)
			}
		}
	} catch (error) {
		console.error('❌ Błąd w handlerze /api/users/[id]:', error)
		console.error('Stack Trace:', error.stack)
		return res.status(500).json({ error: 'Wystąpił wewnętrzny błąd serwera.' })
	}
}
