import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from 'react'
import { loginUser } from '../api/api'

interface AuthContextType {
	user: any
	login: (cardId: string, password: string) => Promise<void>
	logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
	children: ReactNode // Define the children prop
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<any>(null)

	// Check localStorage for a saved user on initial load
	useEffect(() => {
		const savedUser = localStorage.getItem('user')
		if (savedUser) {
			setUser(JSON.parse(savedUser))
		}
	}, [])

	const login = async (cardId: string, password: string) => {
		const user = await loginUser(cardId, password)
		setUser(user)
		// Save the user to localStorage
		localStorage.setItem('user', JSON.stringify(user))
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
