import { MongoClient, Db, Collection, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import { NextApiRequest, NextApiResponse } from 'next' // Zmieniono na Next.js typy, bo '@vercel/node' może być specyficzne dla Vercel Functions

dotenv.config()

interface User {
    _id?: ObjectId
    id?: string
    name: string // Przykład pola użytkownika
    email: string // Przykład pola użytkownika
    [key: string]: any // Pozwala na dodanie innych pól
}

interface ConvertedUser {
    id: string
    [key: string]: any
}

interface ApiResponse {
    message?: string
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

function convertMongoDoc(doc: User | null): ConvertedUser | null {
    if (!doc) {
        return null
    }
    const { _id, ...rest } = doc
    return { id: _id!.toString(), ...rest }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ConvertedUser | ApiResponse>,
): Promise<void> {
    const { id } = req.query

    // Upewnij się, że ID jest stringiem i przypisz je do userId
    const userId = Array.isArray(id) ? id[0] : id

    if (!userId) {
        return res.status(400).json({ error: 'Brak ID użytkownika.' })
    }

    if (!ObjectId.isValid(userId)) {
        console.log('❌ Nieprawidłowy format ID użytkownika:', userId)
        return res.status(400).json({ error: 'Nieprawidłowy format ID użytkownika.' })
    }

    const objectId = new ObjectId(userId)

    try {
        const db = await connectToDatabase()
        const usersCollection: Collection<User> = db.collection('users')

        switch (req.method) {
            case 'GET': {
                const user: User | null = await usersCollection.findOne({ _id: objectId })

                if (!user) {
                    console.log('❌ Użytkownik nie znaleziony dla ID:', userId)
                    return res.status(404).json({ error: 'Użytkownik nie znaleziony.' })
                }

                console.log('✅ Użytkownik pobrany:', user.name || 'brak nazwy')
                const convertedUser = convertMongoDoc(user)
                return res.status(200).json(convertedUser!) // Używamy !, bo wiemy, że user nie jest null
            }

            case 'PUT': {
                const updatedUserData: Partial<User> = { ...req.body } // Użyj Partial, bo nie wszystkie pola muszą być w body
                delete updatedUserData.id
                delete updatedUserData._id

                console.log('🔍 Rozpoczęcie aktualizacji użytkownika:', {
                    userId: userId,
                    updatedData: updatedUserData,
                })

                const updateResult = await usersCollection.updateOne(
                    { _id: objectId },
                    { $set: updatedUserData },
                )

                if (updateResult.matchedCount === 0) {
                    console.log('❌ Błąd: Użytkownik o podanym ID nie został znaleziony:', userId)
                    return res.status(404).json({ error: 'Użytkownik nie znaleziony.' })
                }

                console.log('✅ Użytkownik zaktualizowany pomyślnie!', {
                    matchedCount: updateResult.matchedCount,
                    modifiedCount: updateResult.modifiedCount,
                })
                return res.status(200).json({ message: 'Użytkownik zaktualizowany.' })
            }

            case 'DELETE': {
                console.log('🔍 Usuwanie użytkownika o ID:', userId)
                const deleteResult = await usersCollection.deleteOne({ _id: objectId })

                if (deleteResult.deletedCount === 0) {
                    console.log('❌ Użytkownik nie znaleziony dla ID:', userId)
                    return res.status(404).json({ error: 'Użytkownik nie znaleziony.' })
                }

                console.log('✅ Użytkownik usunięty pomyślnie!', {
                    deletedCount: deleteResult.deletedCount,
                })
                return res.status(200).json({ message: 'Użytkownik usunięty pomyślnie.' })
            }

            default: {
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
                return res.status(405).end(`Metoda ${req.method} Niedozwolona`)
            }
        }
    } catch (error) {
        console.error('❌ Błąd w handlerze /api/users/[id]:', error)
        return res.status(500).json({ error: 'Wystąpił wewnętrzny błąd serwera.' })
    }
}