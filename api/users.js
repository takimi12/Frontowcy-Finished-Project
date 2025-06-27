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
		const usersCollection = db.collection('users')

		switch (req.method) {
			case 'GET': {
				const { cardId, password, email } = req.query
				let query = {}

				if (cardId && password) {
					// Próba logowania: wyszukaj użytkownika po cardId i password
					query = { cardId: cardId, password: password }
					console.log('🔍 Próba logowania z cardId i hasłem:', {
						cardId,
						password: '***',
					})
				} else if (email) {
					// Sprawdzanie istnienia użytkownika po emailu (dla registerUser check)
					query = { email: email }
					console.log('🔍 Sprawdzanie istnienia użytkownika po emailu:', email)
				} else {
					// Ogólne zapytanie o wszystkich użytkowników (np. dla panelu admina)
					console.log('🔍 Pobieranie wszystkich użytkowników')
				}

				const foundUsers = await usersCollection.find(query).toArray()
				console.log(`👥 Znaleziono użytkowników: ${foundUsers.length}`)

				// Konwertujemy _id na id dla każdego znalezionego dokumentu
				const convertedUsers = foundUsers.map((doc) => ({
					...doc,
					id: doc._id.toString(),
				}))

				// Jeśli to była próba logowania (z cardId i password), zwróć pojedynczego użytkownika
				if (cardId && password) {
					if (convertedUsers.length > 0) {
						// Zwracamy pierwszego znalezionego użytkownika (zakładając unikalność cardId+password)
						return res.status(200).json(convertedUsers[0])
					} else {
						return res
							.status(401)
							.json({ error: 'Nieprawidłowe dane logowania' })
					}
				} else {
					// W przeciwnym razie zwróć całą tablicę użytkowników
					return res.status(200).json(convertedUsers)
				}
			}

			case 'POST': {
				const newUser = { ...req.body }
				delete newUser.id

				// Dodajemy timestamp
				newUser.createdAt = new Date()

				console.log('👤 Dodawanie nowego użytkownika:', newUser)

				const result = await usersCollection.insertOne(newUser)
				console.log('✅ Użytkownik dodany z ID:', result.insertedId)

				return res.status(201).json({
					message: 'Użytkownik dodany',
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
		console.error('❌ Błąd w handlerze /api/users:', error)
		return res.status(500).json({ error: 'Wystąpił wewnętrzny błąd serwera.' })
	}
}
