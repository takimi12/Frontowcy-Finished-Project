import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase, ObjectId } from '../../utils/db'
import { convertMongoDoc } from '../../utils/mongoConverters'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const db = await connectToDatabase()
	const usersCollection = db.collection('users')
	const { id } = req.query

	const userId = Array.isArray(id) ? id[0] : id

	if (!userId) {
		return res.status(400).json({ error: 'Brak ID użytkownika' })
	}

	if (!ObjectId.isValid(userId)) {
		console.log('❌ Nieprawidłowy ObjectId dla użytkownika:', userId)
		return res.status(400).json({ error: 'Nieprawidłowy ID użytkownika' })
	}

	const objectId = new ObjectId(userId)

	try {
		switch (req.method) {
			case 'GET': {
				const user = await usersCollection.findOne({ _id: objectId })

				if (!user) {
					console.log('❌ Użytkownik nie znaleziony dla ID:', userId)
					return res.status(404).json({ error: 'Użytkownik nie znaleziony' })
				}

				console.log('✅ Użytkownik pobrany:', user.name || 'bez nazwy')
				const convertedUser = convertMongoDoc(user)
				return res.status(200).json(convertedUser)
			}

			case 'PUT': {
				const updatedUserData = { ...req.body }
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

				console.log('📊 Wynik operacji aktualizacji użytkownika:', {
					matchedCount: updateResult.matchedCount,
					modifiedCount: updateResult.modifiedCount,
				})

				if (updateResult.matchedCount === 0) {
					console.log(
						'❌ Błąd: Użytkownik o podanym ID nie został znaleziony w bazie:',
						userId,
					)
					return res.status(404).json({ error: 'Użytkownik nie znaleziony' })
				}

				console.log('✅ Użytkownik zaktualizowany pomyślnie!')
				return res.status(200).json({ message: 'Użytkownik zaktualizowany' })
			}

			case 'DELETE': {
				console.log('🔍 Usuwanie użytkownika o ID:', userId)
				const deleteResult = await usersCollection.deleteOne({ _id: objectId })

				console.log('📊 Wynik operacji usunięcia użytkownika:', {
					deletedCount: deleteResult.deletedCount,
				})

				if (deleteResult.deletedCount === 0) {
					console.log('❌ Użytkownik nie znaleziony dla ID:', userId)
					return res.status(404).json({ error: 'Użytkownik nie znaleziony' })
				}

				console.log('✅ Użytkownik usunięty pomyślnie!')
				return res
					.status(200)
					.json({ message: 'Użytkownik usunięty pomyślnie' })
			}

			default:
				res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
				return res.status(405).end(`Method ${req.method} Not Allowed`)
		}
	} catch (error) {
		console.error('❌ Błąd w handlerze /api/users/[id]:', error)
		return res.status(500).json({ error: 'Internal Server Error' })
	}
}
