import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import IPConfiguration from './pages/IPConfiguration'
import LeaveManagement from './pages/LeaveManagement'
import WorkSchedules from './pages/WorkSchedules'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="work-schedules" element={<WorkSchedules />} />
            <Route path="ip-configuration" element={<IPConfiguration />} />
            <Route path="leave-management" element={<LeaveManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

