import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import MainContent from './components/MainContent/MainContent'
import CategorySessionView from './components/CategorySessionView/CategorySessionView'
import PlayerBar from './components/PlayerBar/PlayerBar'
import './App.css'

function App() {
  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <Header />

      {/* Middle: Sidebar + Main Content */}
      <div className="middle-bar">
        <Sidebar />

        {/* Content area */}
        <main className="content" role="main" aria-label="Main content">
          <div className="content-scroll">
            <Routes>
              {/* Home Overview Page */}
              <Route path="/" element={<MainContent />} />
              {/* Category Session Page: /session/:id */}
              <Route path="/session/:id" element={<CategorySessionView />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Bottom Player / Signup Bar */}
      <PlayerBar />
    </div>
  )
}

export default App
