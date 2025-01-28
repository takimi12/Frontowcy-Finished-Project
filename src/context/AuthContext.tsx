import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from 'react'
import { loginUser, User } from '../api/api'

interface AuthContextType {
	user: User | null
	login: (cardId: string, password: string) => Promise<void>
	logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
	children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		const savedUser = localStorage.getItem('user')
		if (savedUser) {
			setUser(JSON.parse(savedUser))
		}
	}, [])

	const login = async (cardId: string, password: string) => {
		try {
			const loggedInUser = await loginUser(cardId, password)
			setUser(loggedInUser)
			// Save the user to localStorage
			localStorage.setItem('user', JSON.stringify(loggedInUser))
		} catch (error) {
			console.error('Login failed:', error)
		}
	}

	const logout = () => {
		setUser(null)
		// Remove the user from localStorage
		localStorage.removeItem('user')
	}

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
