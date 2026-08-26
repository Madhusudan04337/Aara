import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import MainContent from './components/MainContent/MainContent'
import CategorySessionView from './components/CategorySessionView/CategorySessionView'
import SignupPage from './components/Auth/SignupPage'
import LoginPage from './components/Auth/LoginPage'
import PlayerBar from './components/PlayerBar/PlayerBar'
import './App.css'

function App() {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  return (
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
                      element={
                        <MainContent
                          searchQuery={searchQuery}
                          onSelectTrack={setCurrentTrack}
                        />
                      }
                    />
                    <Route path="/session/:id" element={<CategorySessionView onSelectTrack={setCurrentTrack} />} />
                  </Routes>
                </div>
              </main>
            </div>
            <PlayerBar currentTrack={currentTrack} />
          </div>
        }
      />
    </Routes>
  )
}

export default App
