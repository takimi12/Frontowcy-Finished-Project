import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { checkIfUserExists, registerUser } from '../api/api'
import {
	Container,
	TextField,
	Button,
	Typography,
	Box,
	Paper,
} from '@mui/material'
import { useNavigate } from 'react-router-dom' // Dodany import

type FormData = {
	name: string
	surname: string
	email: string
	password: string
	borrowedBooks: string[]
}

const schema = yup.object().shape({
	name: yup.string().required('Imię jest wymagane'),
	surname: yup.string().required('Nazwisko jest wymagane'),
	email: yup
		.string()
		.email('Nieprawidłowy adres email')
		.required('Email jest wymagany'),
	password: yup
		.string()
		.min(6, 'Hasło musi mieć co najmniej 6 znaków')
		.required('Hasło jest wymagane'),
	borrowedBooks: yup
		.array()
		.of(yup.string().required())
		.required('Lista wypożyczonych książek jest wymagana'),
})

const Register: React.FC = () => {
	const navigate = useNavigate() // Inicjalizacja hooka
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: yupResolver(schema),
		defaultValues: {
			name: '',
			surname: '',
			email: '',
			password: '',
			borrowedBooks: [],
		},
	})

	const onSubmit = async (data: FormData) => {
		try {
			const userExists = await checkIfUserExists(data.email)
			if (userExists) {
				alert('Użytkownik o podanym adresie email już istnieje')
				return
			}

			const newUser = await registerUser(data)
			alert(
				`Zarejestrowano użytkownika z kartą biblioteczną: ${newUser.cardId}`,
			)
			reset()
			navigate('/login') // Przekierowanie po udanej rejestracji
		} catch (error) {
			if (error instanceof Error) {
				if (
					error.message === 'Nie udało się sprawdzić, czy użytkownik istnieje.'
				) {
					alert('Błąd podczas sprawdzania dostępności adresu email')
				} else {
					alert('Błąd podczas rejestracji')
				}
			} else {
				alert('Wystąpił nieznany błąd')
			}
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
					Zarejestruj się
				</Typography>

				<form role="form" onSubmit={handleSubmit(onSubmit)}>
					<Box sx={{ mb: 3 }}>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Imię"
									fullWidth
									variant="outlined"
									error={!!errors.name}
									helperText={errors.name?.message}
								/>
							)}
						/>
					</Box>

					<Box sx={{ mb: 3 }}>
						<Controller
							name="surname"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Nazwisko"
									fullWidth
									variant="outlined"
									error={!!errors.surname}
									helperText={errors.surname?.message}
								/>
							)}
						/>
					</Box>

					<Box sx={{ mb: 3 }}>
						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Email"
									type="email"
									fullWidth
									variant="outlined"
									error={!!errors.email}
									helperText={errors.email?.message}
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
							Zarejestruj się
						</Button>
					</Box>
				</form>
			</Paper>
		</Container>
	)
}

export default Register
