import { useState, useRef, useEffect } from 'react'
import './Sidebar.css'

const Sidebar = () => {
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef(null)

  const MIN_WIDTH = 320
  const MAX_WIDTH = 380

  const startResizing = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return
      
      let newWidth = e.clientX
      if (sidebarRef.current) {
        const sidebarLeft = sidebarRef.current.getBoundingClientRect().left
        newWidth = e.clientX - sidebarLeft
      }

      if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH
      if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH

      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false)
      }
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <aside 
      className={`sidebar ${isResizing ? 'resizing' : ''}`} 
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      aria-label="Your Library"
    >

      {/* Library Header */}
      <div className="library">
        <div className="library-header">
          <div className="library-title">
            <i className="fa-solid fa-book-open" aria-hidden="true" />
            <p>Your Library</p>
          </div>
          <button className={`library-add-btn ${sidebarWidth >= 345 ? 'library-add-btn--expanded' : ''}`} id="btn-library-add" aria-label="Create playlist or podcast">
            <span className="library-add-btn__icon">
              {sidebarWidth >= 345 ? (
                <>
                  <span className="library-add-btn__text">Create</span>
                  <i className="fa-solid fa-plus" aria-hidden="true" />
                </>
              ) : (
                <i className="fa-solid fa-plus" aria-hidden="true" />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Library Content */}
      <div className="library-content">
        <div className="box-music">
          <div className="content-scroll">

            {/* Create Playlist Card */}
            <div className="playlist" id="card-create-playlist">
              <div className="playlist-content">
                <span className="title">Create your first playlist</span>
                <br />
                <span className="desc">It&apos;s easy, we&apos;ll help you</span>
              </div>
              <div>
                <button className="btn" id="btn-create-playlist">
                  <span>Create playlist</span>
                </button>
              </div>
            </div>

            {/* Browse Podcasts Card */}
            <div className="playlist" id="card-browse-podcasts">
              <div className="playlist-content">
                <span className="title">Let&apos;s find some podcasts to follow</span>
                <br />
                <span className="desc">We&apos;ll keep you updated on new episodes</span>
              </div>
              <div className="playlist-add-btn">
                <button className="btn" id="btn-browse-podcasts">
                  <span>Browse podcasts</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Library Footer */}
        <footer className="library-footer">
          <div className="footer-links">
            <div className="footer-links__list">
              <span className="footer-links__item">Legal</span>
              <span className="footer-links__item">Safety &amp; Privacy Center</span>
              <span className="footer-links__item">Privacy Policy</span>
              <span className="footer-links__item">Cookies</span>
              <span className="footer-links__item">About Ads</span>
              <span className="footer-links__item">Accessibility</span>
            </div>
            <div>
              <a
                className="footer-links__external"
                href="https://www.spotify.com/legal/cookies-policy/"
                target="_blank"
                rel="noopener noreferrer"
                draggable="false"
              >
                Cookies
              </a>
            </div>
          </div>

          <div className="language-selector">
            <button className="lang-btn" id="btn-language" aria-label="Change language">
              <span className="material-symbols-outlined">language</span>
              <span>English</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Resize Handle */}
      <div 
        className="sidebar-resize-handle" 
        onMouseDown={startResizing}
        title="Drag to resize sidebar"
      />
    </aside>
  )
}

export default Sidebar
