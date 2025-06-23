import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import FeedbackList from './components/FeedbackList'
import CreateFeedback from './components/CreateFeedback'
import TeamMembers from './components/TeamMembers'
import Footer from './components/Footer'
import './App.css'

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="loading">Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// Layout component for authenticated pages
const Layout = ({ children }) => {
  const { user } = useAuth()
  
  // Don't show footer on login/register pages
  if (!user) {
    return children
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feedback" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <FeedbackList />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feedback/create" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Layout>
                    <CreateFeedback />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/team" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Layout>
                    <TeamMembers />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
      </div>
      </Router>
    </AuthProvider>
  )
}

export default App
