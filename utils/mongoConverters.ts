export const convertMongoDoc = (doc: any) => {
	if (!doc) return null
	const { _id, ...rest } = doc
	return {
		...rest,
		id: _id.toString(),
	}
}

export const convertMongoDocs = (docs: any[]) => {
	if (!docs) return []
	return docs.map(convertMongoDoc)
}
