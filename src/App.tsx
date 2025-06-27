import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import { AuthProvider } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import { Admin } from './components/admin/Admin'
import { BooksList } from './components/books/BooksList'
import BookDetail from './components/books/BookDetail'
import UserPanel from './components/user/UserPanel'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// new vercel.json
export const App: React.FC = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<Router>
					<Header />
					<Routes>
						<Route path="/" element={<BooksList />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/admin" element={<Admin />} />
						<Route path="/user" element={<UserPanel />} />
						<Route path="/books/:id" element={<BookDetail />} />
					</Routes>
				</Router>
			</AuthProvider>
		</QueryClientProvider>
	)
}
