import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase, ObjectId } from '../../utils/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const db = await connectToDatabase()
	const borrowingsCollection = db.collection('borrowings')
	const { id } = req.query

	const borrowingId = Array.isArray(id) ? id[0] : id

	if (!borrowingId) {
		return res.status(400).json({ error: 'Brak ID wypożyczenia' })
	}

	if (!ObjectId.isValid(borrowingId)) {
		console.log('❌ Nieprawidłowy ObjectId dla wypożyczenia:', borrowingId)
		return res.status(400).json({ error: 'Nieprawidłowy ID wypożyczenia' })
	}

	const objectId = new ObjectId(borrowingId)

	try {
		switch (req.method) {
			case 'PUT': {
				const updatedBorrowingData = { ...req.body }
				delete updatedBorrowingData.id
				delete updatedBorrowingData._id

				console.log('🔍 Aktualizacja wypożyczenia:', {
					borrowingId: borrowingId,
					updatedData: updatedBorrowingData,
				})

				const updateResult = await borrowingsCollection.updateOne(
					{ _id: objectId },
					{ $set: updatedBorrowingData },
				)

				console.log('📊 Wynik aktualizacji wypożyczenia:', {
					matchedCount: updateResult.matchedCount,
					modifiedCount: updateResult.modifiedCount,
				})

				if (updateResult.matchedCount === 0) {
					console.log('❌ Wypożyczenie nie znalezione dla ID:', borrowingId)
					return res.status(404).json({ error: 'Wypożyczenie nie znalezione' })
				}

				console.log('✅ Wypożyczenie zaktualizowane pomyślnie')
				return res.status(200).json({ message: 'Wypożyczenie zaktualizowane' })
			}

			default:
				res.setHeader('Allow', ['PUT'])
				return res.status(405).end(`Method ${req.method} Not Allowed`)
		}
	} catch (error) {
		console.error('❌ Błąd w handlerze /api/borrowings/[id]:', error)
		return res.status(500).json({ error: 'Internal Server Error' })
	}
}
