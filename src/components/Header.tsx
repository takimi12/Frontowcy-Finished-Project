import React from 'react'
import { useAuth } from '../context/AuthContext'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
	const { user, logout } = useAuth()

	return (
		<AppBar position="static">
			<Toolbar sx={{ backgroundColor: '#3f51b5' }}>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					<Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
						Biblioteka
					</Link>
				</Typography>
				{user ? (
					<Box display="flex" alignItems="center">
						<Link to="/user" style={{ textDecoration: 'none' }}>
							<Typography variant="body1" sx={{ color: 'white', mr: 2 }}>
								Witaj, {user.name} {user.surname} ({user.role})
							</Typography>
						</Link>
						<Button
							color="inherit"
							onClick={logout}
							sx={{
								backgroundColor: '#f44336',
								'&:hover': {
									backgroundColor: '#d32f2f',
								},
								padding: '6px 12px',
								borderRadius: '4px',
								fontWeight: 'bold',
							}}
						>
							Wyloguj
						</Button>
					</Box>
				) : (
					<Button
						color="inherit"
						component={Link}
						to="/login"
						sx={{
							backgroundColor: '#4caf50',
							'&:hover': {
								backgroundColor: '#388e3c',
							},
							padding: '6px 16px',
							borderRadius: '4px',
							fontWeight: 'bold',
						}}
					>
						Zaloguj się
					</Button>
				)}
			</Toolbar>
		</AppBar>
	)
}

export default Header
