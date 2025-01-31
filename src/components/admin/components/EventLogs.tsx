import React, { useState } from 'react'
import { Typography, Box, Pagination } from '@mui/material'

type Log = {
	id: string
	date: string
	userId: string
	action: string
	details: string
}

interface EventLogProps {
	logs: Log[]
}

export const EventLog: React.FC<EventLogProps> = ({ logs }) => {
	const [page, setPage] = useState(1)
	const logsPerPage = 5 // You can adjust the number of logs per page

	// Calculate the index of the first log to display
	const indexOfLastLog = page * logsPerPage
	const indexOfFirstLog = indexOfLastLog - logsPerPage
	const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog)

	const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
		setPage(value)
	}

	return (
		<Box sx={{ mt: 4 }}>
			<Typography variant="h4" gutterBottom>
				Dziennik zdarzeń
			</Typography>
			<Box>
				{currentLogs.map((log) => (
					<Box key={log.id} sx={{ borderBottom: '1px solid #ccc', py: 1 }}>
						<Typography variant="body1">
							<strong>{new Date(log.date).toLocaleString()}:</strong>{' '}
							{log.action} - {log.details}
						</Typography>
					</Box>
				))}
			</Box>

			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
				<Pagination
					count={Math.ceil(logs.length / logsPerPage)}
					page={page}
					onChange={handleChange}
					color="primary"
				/>
			</Box>
		</Box>
	)
}
