import { useState, useEffect } from 'react'
import { storage } from './services/api'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import CustomerPage from './pages/CustomerPage'
import EmployeePage from './pages/EmployeePage'
import ManagerPage from './pages/ManagerPage'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  // Kiểm tra token khi load app
  useEffect(() => {
    const token = storage.getToken()
    const user = storage.getUser()
    if (token && user) {
      setCurrentUser(user.chucVu)
      setShowLogin(true) // Skip landing page if already logged in
    }
  }, [])

  const handleLogin = (role) => {
    setCurrentUser(role)
  }

  const handleLogout = () => {
    storage.clear()
    setCurrentUser(null)
    setShowLogin(false) // Return to landing page after logout
  }

  const handleNavigateToLogin = () => {
    setShowLogin(true)
  }

  const handleBackToLanding = () => {
    setShowLogin(false)
  }

  // Show landing page first
  if (!showLogin && !currentUser) {
    return <LandingPage onNavigateToLogin={handleNavigateToLogin} />
  }

  // Show login page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onBackToLanding={handleBackToLanding} />
  }

  // Hiển thị trang theo vai trò
  if (currentUser === 'khachhang') {
    return <CustomerPage onLogout={handleLogout} />
  }

  if (currentUser === 'nhanvien') {
    return <EmployeePage onLogout={handleLogout} />
  }

  if (currentUser === 'quanly') {
    return <ManagerPage onLogout={handleLogout} />
  }

  return null
}

export default App
