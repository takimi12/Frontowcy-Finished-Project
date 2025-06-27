import { MongoClient, Db, Collection, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import { NextApiRequest, NextApiResponse } from 'next' // Zmieniono na Next.js typy

dotenv.config()

interface Log {
    _id?: ObjectId
    id?: string
    message: string // Treść logu
    level?: 'info' | 'warn' | 'error' // Poziom logu (opcjonalny)
    timestamp: Date // Data i czas zdarzenia
    [key: string]: any // Pozwala na dodanie innych pól
}

interface ConvertedLog {
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

function convertMongoDocs(docs: Log[] | null): ConvertedLog[] {
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
    res: NextApiResponse<ConvertedLog[] | ApiResponse>,
): Promise<void> {
    try {
        const db = await connectToDatabase()
        const logsCollection: Collection<Log> = db.collection('logs')

        switch (req.method) {
            case 'GET': {
                // Pobiera wszystkie logi, sortując je od najnowszych do najstarszych
                const allLogs: Log[] = await logsCollection
                    .find({})
                    .sort({ timestamp: -1 }) // Użyj 'timestamp' zamiast 'date' dla spójności
                    .toArray()
                console.log('📜 Pobrano logi:', allLogs.length)
                const convertedLogs = convertMongoDocs(allLogs)
                return res.status(200).json(convertedLogs)
            }

            case 'POST': {
                const newLog: Log = req.body

                // Usuń pola '_id' i 'id' jeśli istnieją w body
                delete newLog.id
                delete newLog._id

                // Ustaw 'timestamp' jeśli nie został podany
                if (!newLog.timestamp) {
                    newLog.timestamp = new Date()
                } else if (typeof newLog.timestamp === 'string') {
                    // Konwertuj string na obiekt Date, jeśli przyszedł jako string
                    newLog.timestamp = new Date(newLog.timestamp)
                }

                // Walidacja - wymagane pole 'message'
                if (!newLog.message) {
                    console.log('❌ Brak wymaganego pola: message w logu.')
                    return res.status(400).json({ error: 'Brak wymaganego pola: message.' })
                }

                console.log('📜 Dodawanie nowego logu:', newLog)
                const result = await logsCollection.insertOne(newLog)
                console.log('✅ Log dodany z ID:', result.insertedId)

                return res.status(201).json({
                    message: 'Log dodany',
                    insertedId: result.insertedId,
                    id: result.insertedId.toString(),
                })
            }

            default: {
                res.setHeader('Allow', ['GET', 'POST'])
                return res.status(405).end(`Metoda ${req.method} Niedozwolona`)
            }
        }
    } catch (error) {
        console.error('❌ Błąd w handlerze /api/logs:', error)
        return res.status(500).json({ error: 'Wystąpił wewnętrzny błąd serwera.' })
    }
}