import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import MainContent from './components/MainContent/MainContent'
import CategorySessionView from './components/CategorySessionView/CategorySessionView'
import SignupPage from './components/Auth/SignupPage'
import LoginPage from './components/Auth/LoginPage'
import PlayerBar from './components/PlayerBar/PlayerBar'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <AuthProvider>
      <PlayerProvider>
        <Routes>
          {/* Full-screen Auth Pages */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Main Layout Pages */}
          <Route
            path="*"
            element={
              <div className="app-layout">
                <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <div className="middle-bar">
                  <Sidebar />
                  <main className="content" role="main" aria-label="Main content">
                    <div className="content-scroll">
                      <Routes>
                        <Route
                          path="/"
                          element={<MainContent searchQuery={searchQuery} />}
                        />
                        <Route path="/session/:id" element={<CategorySessionView />} />
                      </Routes>
                    </div>
                  </main>
                </div>
                <PlayerBar />
              </div>
            }
          />
        </Routes>
      </PlayerProvider>
    </AuthProvider>
  )
}

export default App
