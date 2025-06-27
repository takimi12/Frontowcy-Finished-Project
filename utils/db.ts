import { MongoClient, Db, ObjectId } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI
const dbName = 'Books'
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<Db> {
	if (cachedDb) {
		console.log('✅ Używam istniejącego połączenia z bazą danych.')
		return cachedDb
	}

	if (!uri) {
		throw new Error(
			'MONGODB_URI nie jest zdefiniowany w zmiennych środowiskowych.',
		)
	}

	try {
		const client = new MongoClient(uri)
		await client.connect()
		cachedDb = client.db(dbName)
		console.log('✅ Połączono z bazą danych MongoDB i buforowano połączenie.')
		return cachedDb
	} catch (error) {
		console.error('❌ Błąd połączenia z bazą danych:', error)
		throw new Error('Nie udało się połączyć z bazą danych MongoDB.')
	}
}

export { ObjectId }
