import { useState, useEffect } from 'react'
import { storage } from './services/api'
import LoginPage from './pages/LoginPage'
import CustomerPage from './pages/CustomerPage'
import EmployeePage from './pages/EmployeePage'
import ManagerPage from './pages/ManagerPage'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)

  // Kiểm tra token khi load app
  useEffect(() => {
    const token = storage.getToken()
    const user = storage.getUser()
    if (token && user) {
      setCurrentUser(user.chucVu)
    }
  }, [])

  const handleLogin = (role) => {
    setCurrentUser(role)
  }

  const handleLogout = () => {
    storage.clear()
    setCurrentUser(null)
  }

  // Hiển thị trang theo vai trò
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />
  }

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
