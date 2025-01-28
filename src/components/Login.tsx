import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import {
	Container,
	TextField,
	Button,
	Typography,
	Box,
	Paper,
} from '@mui/material'

interface LoginFormInputs {
	cardId: string
	password: string
}

const validationSchema = Yup.object().shape({
	cardId: Yup.string()
		.required('Numer karty jest wymagany')
		.matches(
			/^[a-zA-Z0-9]{9,10}$/,
			'Numer karty musi zawierać od 9 do 10 znaków alfanumerycznych',
		),
	password: Yup.string()
		.required('Hasło jest wymagane')
		.min(6, 'Hasło musi mieć co najmniej 6 znaków'),
})

const Login: React.FC = () => {
	const { login } = useAuth()

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(validationSchema),
	})

	const onSubmit = async (data: LoginFormInputs) => {
		const { cardId, password } = data
		try {
			await login(cardId, password)
			alert('Zalogowano pomyślnie!')
		} catch (error) {
			alert(`Błąd logowania ${error}`)
		}
	}

	return (
		<Container
			maxWidth="sm"
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '100vh',
				py: 4,
			}}
		>
			<Paper
				elevation={6}
				sx={{
					width: '100%',
					padding: 4,
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
				}}
			>
				<Typography variant="h5" align="center" color="primary">
					Zaloguj się
				</Typography>

				<form onSubmit={handleSubmit(onSubmit)}>
					<Box sx={{ mb: 3 }}>
						<Controller
							name="cardId"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Numer karty"
									fullWidth
									variant="outlined"
									error={!!errors.cardId}
									helperText={errors.cardId?.message}
								/>
							)}
						/>
					</Box>

					<Box sx={{ mb: 3 }}>
						<Controller
							name="password"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Hasło"
									type="password"
									fullWidth
									variant="outlined"
									error={!!errors.password}
									helperText={errors.password?.message}
								/>
							)}
						/>
					</Box>

					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<Button
							type="submit"
							variant="contained"
							color="primary"
							size="large"
							sx={{ width: '100%' }}
						>
							Zaloguj
						</Button>
					</Box>
				</form>
			</Paper>
		</Container>
	)
}

export default Login
