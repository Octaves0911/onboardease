import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import LandingPage from './pages/LandingPage'
import LoginPage   from './pages/LoginPage'
import SetupPage   from './pages/SetupPage'
import NewHirePage from './pages/NewHirePage'
import MentorPage  from './pages/MentorPage'
import AdminPage   from './pages/AdminPage'
import HRPage      from './pages/HRPage'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/setup"    element={<SetupPage />} />
          <Route path="/new-hire" element={<NewHirePage />} />
          <Route path="/mentor"   element={<MentorPage />} />
          <Route path="/admin"    element={<AdminPage />} />
          <Route path="/hr"       element={<HRPage />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
