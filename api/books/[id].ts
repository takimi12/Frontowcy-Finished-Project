import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase, ObjectId } from '../../utils/db'
import { convertMongoDoc } from '../../utils/mongoConverters'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const db = await connectToDatabase()
	const booksCollection = db.collection('books')
	const { id } = req.query

	const bookId = Array.isArray(id) ? id[0] : id

	if (!bookId) {
		return res.status(400).json({ error: 'Brak ID książki' })
	}

	if (!ObjectId.isValid(bookId)) {
		console.log('❌ Nieprawidłowy ObjectId dla książki:', bookId)
		return res.status(400).json({ error: 'Nieprawidłowy ID książki' })
	}

	const objectId = new ObjectId(bookId)

	try {
		switch (req.method) {
			case 'GET': {
				const book = await booksCollection.findOne({ _id: objectId })

				if (!book) {
					console.log('❌ Książka nie znaleziona dla ID:', bookId)
					return res.status(404).json({ error: 'Książka nie znaleziona' })
				}

				console.log('✅ Książka pobrana:', book.title || 'bez tytułu')
				const convertedBook = convertMongoDoc(book)
				return res.status(200).json(convertedBook)
			}

			case 'PUT': {
				const updatedBookData = { ...req.body }
				delete updatedBookData.id
				delete updatedBookData._id

				console.log('🔍 Rozpoczęcie aktualizacji książki:', {
					bookId: bookId,
					updatedData: updatedBookData,
				})

				const updateResult = await booksCollection.updateOne(
					{ _id: objectId },
					{ $set: updatedBookData },
				)

				console.log('📊 Wynik operacji aktualizacji książki:', {
					matchedCount: updateResult.matchedCount,
					modifiedCount: updateResult.modifiedCount,
				})

				if (updateResult.matchedCount === 0) {
					console.log(
						'❌ Błąd: Książka o podanym ID nie została znaleziona w bazie:',
						bookId,
					)
					return res.status(404).json({ error: 'Książka nie znaleziona' })
				}

				console.log('✅ Książka zaktualizowana pomyślnie!')
				return res.status(200).json({ message: 'Książka zaktualizowana' })
			}

			case 'DELETE': {
				console.log('🔍 Usuwanie książki o ID:', bookId)
				const deleteResult = await booksCollection.deleteOne({ _id: objectId })

				console.log('📊 Wynik operacji usunięcia książki:', {
					deletedCount: deleteResult.deletedCount,
				})

				if (deleteResult.deletedCount === 0) {
					console.log('❌ Książka nie znaleziona dla ID:', bookId)
					return res.status(404).json({ error: 'Książka nie znaleziona' })
				}

				console.log('✅ Książka usunięta pomyślnie!')
				return res.status(200).json({ message: 'Książka usunięta pomyślnie' })
			}

			default:
				res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
				return res.status(405).end(`Method ${req.method} Not Allowed`)
		}
	} catch (error) {
		console.error('❌ Błąd w handlerze /api/books/[id]:', error)
		return res.status(500).json({ error: 'Internal Server Error' })
	}
}
