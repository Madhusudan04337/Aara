import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
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

        {/* Content area - to be built next */}
        <main className="content" role="main" aria-label="Main content">
          <div className="content-scroll" />
        </main>
      </div>

      {/* Bottom Player / Signup Bar */}
      <PlayerBar />
    </div>
  )
}

export default App
