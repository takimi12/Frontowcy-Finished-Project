import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from '../utils/db'
import { convertMongoDocs } from '../utils/mongoConverters'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const db = await connectToDatabase()
	const logsCollection = db.collection('logs')

	try {
		switch (req.method) {
			case 'GET': {
				const allLogs = await logsCollection
					.find({})
					.sort({ date: -1 })
					.toArray()
				console.log('📜 Pobrano logi:', allLogs.length)
				const convertedLogs = convertMongoDocs(allLogs)
				return res.status(200).json(convertedLogs)
			}

			case 'POST': {
				const newLog = req.body
				delete newLog.id
				delete newLog._id

				if (!newLog.date) {
					newLog.date = new Date().toISOString()
				}

				console.log('📜 Nowy log:', newLog)
				const result = await logsCollection.insertOne(newLog)
				console.log('✅ Log zapisany z ID:', result.insertedId)

				return res.status(201).json({
					message: 'Log zapisany',
					insertedId: result.insertedId,
					id: result.insertedId.toString(),
				})
			}

			default:
				res.setHeader('Allow', ['GET', 'POST'])
				return res.status(405).end(`Method ${req.method} Not Allowed`)
		}
	} catch (error) {
		console.error('❌ Błąd w handlerze /api/logs:', error)
		return res.status(500).json({ error: 'Internal Server Error' })
	}
}
