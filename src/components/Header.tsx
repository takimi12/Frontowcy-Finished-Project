import React from 'react'
import { useAuth } from '../context/AuthContext'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
	const { user, logout } = useAuth()

	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					<Link to="/">Biblioteka</Link>
				</Typography>
				{user ? (
					<Box display="flex" alignItems="center">
						<Typography variant="body1" sx={{ mr: 2 }}>
							Witaj, {user.name} {user.surname} ({user.role})
						</Typography>
						<Button color="inherit" onClick={logout}>
							Wyloguj
						</Button>
					</Box>
				) : (
					<Button color="inherit" component={Link} to="/login">
						Zaloguj się
					</Button>
				)}
			</Toolbar>
		</AppBar>
	)
}

export default Header
