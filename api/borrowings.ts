import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from '../utils/db'
import { convertMongoDocs } from '../utils/mongoConverters'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const db = await connectToDatabase()
	const borrowingsCollection = db.collection('borrowings')

	try {
		switch (req.method) {
			case 'GET': {
				const allBorrowings = await borrowingsCollection.find({}).toArray()
				console.log('📋 Pobrano wypożyczenia:', allBorrowings.length)
				const convertedBorrowings = convertMongoDocs(allBorrowings)
				return res.status(200).json(convertedBorrowings)
			}

			case 'POST': {
				const newBorrowing = req.body
				delete newBorrowing.id
				delete newBorrowing._id

				console.log('📚 Nowe wypożyczenie:', newBorrowing)

				if (!newBorrowing.userId || !newBorrowing.bookId) {
					console.log('❌ Brak wymaganych pól w wypożyczeniu')
					return res
						.status(400)
						.json({ error: 'Brak wymaganych pól: userId i bookId' })
				}

				const result = await borrowingsCollection.insertOne(newBorrowing)

				console.log('✅ Wypożyczenie zapisane:', {
					insertedId: result.insertedId,
					acknowledged: result.acknowledged,
				})

				return res.status(201).json({
					message: 'Wypożyczenie zapisane',
					insertedId: result.insertedId,
					id: result.insertedId.toString(),
				})
			}

			default:
				res.setHeader('Allow', ['GET', 'POST'])
				return res.status(405).end(`Method ${req.method} Not Allowed`)
		}
	} catch (error) {
		console.error('❌ Błąd w handlerze /api/borrowings:', error)
		return res.status(500).json({ error: 'Internal Server Error' })
	}
}
