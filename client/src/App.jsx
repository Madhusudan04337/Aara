import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import MainContent from './components/MainContent/MainContent'
import CategorySessionView from './components/CategorySessionView/CategorySessionView'
import SignupPage from './components/Auth/SignupPage'
import PlayerBar from './components/PlayerBar/PlayerBar'
import './App.css'

function App() {
  const [currentTrack, setCurrentTrack] = useState(null)

  return (
    <Routes>
      {/* Full-screen Signup Page */}
      <Route path="/signup" element={<SignupPage />} />

      {/* Main Layout Pages */}
      <Route
        path="*"
        element={
          <div className="app-layout">
            <Header />
            <div className="middle-bar">
              <Sidebar />
              <main className="content" role="main" aria-label="Main content">
                <div className="content-scroll">
                  <Routes>
                    <Route path="/" element={<MainContent onSelectTrack={setCurrentTrack} />} />
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
