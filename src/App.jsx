import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/auth'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Groups from './pages/Groups'
import Campaigns from './pages/Campaigns'
import CampaignCreate from './pages/CampaignCreate'
import CampaignDetail from './pages/CampaignDetail'
import WhatsAppConnect from './pages/WhatsAppConnect'
import Conversations from './pages/Conversations'
import Bot from './pages/Bot'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { token } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="groups" element={<Groups />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="campaigns/create" element={<CampaignCreate />} />
        <Route path="campaigns/:id" element={<CampaignDetail />} />
        <Route path="whatsapp" element={<WhatsAppConnect />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="bot" element={<Bot />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
