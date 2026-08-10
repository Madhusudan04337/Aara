import { useState, useRef, useEffect } from 'react'
import './MainContent.css'
import { sectionsData } from '../../data/musicData'

const SHOW_ALL_THRESHOLD = 5

const MainContent = () => {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [scrollPositions, setScrollPositions] = useState({})
  const scrollContainersRef = useRef({})

  const updateScrollState = (key) => {
    const el = scrollContainersRef.current[key]
    if (!el) return
    const canScrollLeft = el.scrollLeft > 5
    const canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 5
    setScrollPositions((prev) => ({
      ...prev,
      [key]: { canScrollLeft, canScrollRight }
    }))
  }

  useEffect(() => {
    Object.keys(sectionsData).forEach((key) => {
      updateScrollState(key)
    })
  }, [activeCategory])

  const handleScroll = (key) => {
    updateScrollState(key)
  }

  const scrollLeft = (key) => {
    if (scrollContainersRef.current[key]) {
      scrollContainersRef.current[key].scrollBy({ left: -500, behavior: 'smooth' })
    }
  }

  const scrollRight = (key) => {
    if (scrollContainersRef.current[key]) {
      scrollContainersRef.current[key].scrollBy({ left: 500, behavior: 'smooth' })
    }
  }

  // If a category view ("Show all") is selected, render full grid view page for that category
  if (activeCategory && sectionsData[activeCategory]) {
    const category = sectionsData[activeCategory]
    return (
      <div className="main-content category-view">
        <div className="category-header">
          <h2>{category.title}</h2>
        </div>

        <div className="cards-grid category-grid">
          {category.items.map((item) => (
            <div
              key={`full-${item.id}`}
              className={`card ${category.type === 'artist' ? 'card--artist' : ''}`}
              onMouseEnter={() => setHoveredCard(`full-${item.id}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={`card-image-container ${
                  category.type === 'artist' ? 'card-image-container--round' : ''
                }`}
              >
                <img src={item.image} alt={item.title} className="card-image" />
                <button
                  className={`play-btn ${
                    hoveredCard === `full-${item.id}` ? 'play-btn--visible' : ''
                  }`}
                  aria-label={`Play ${item.title}`}
                >
                  <i className="fa-solid fa-play" />
                </button>
              </div>
              <div className="card-info">
                <h3 className="card-title" title={item.title}>{item.title}</h3>
                <p className="card-subtitle" title={item.subtitle}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Main overview page
  return (
    <div className="main-content">
      {Object.entries(sectionsData).map(([key, section]) => {
        const hasShowAll = section.items.length > SHOW_ALL_THRESHOLD
        const scrollState = scrollPositions[key] || { canScrollLeft: false, canScrollRight: true }

        return (
          <section key={key} className="content-section">
            <div className="section-header">
              {hasShowAll ? (
                <h2 className="section-title-link" onClick={() => setActiveCategory(key)}>
                  {section.title}
                </h2>
              ) : (
                <h2 className="section-title-static">{section.title}</h2>
              )}
              {hasShowAll && (
                <div className="section-header-actions">
                  <button className="show-all-btn" onClick={() => setActiveCategory(key)}>
                    Show all
                  </button>
                </div>
              )}
            </div>

            <div className="row-scroll-wrapper">
              {scrollState.canScrollLeft && (
                <button
                  className="scroll-btn scroll-btn--left"
                  onClick={() => scrollLeft(key)}
                  aria-label="Scroll left"
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
              )}

              <div
                className="cards-row"
                ref={(el) => (scrollContainersRef.current[key] = el)}
                onScroll={() => handleScroll(key)}
              >
                {section.items.map((item) => (
                  <div
                    key={`${key}-${item.id}`}
                    className={`card ${section.type === 'artist' ? 'card--artist' : ''}`}
                    onMouseEnter={() => setHoveredCard(`${key}-${item.id}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div
                      className={`card-image-container ${
                        section.type === 'artist' ? 'card-image-container--round' : ''
                      }`}
                    >
                      <img src={item.image} alt={item.title} className="card-image" />
                      <button
                        className={`play-btn ${
                          hoveredCard === `${key}-${item.id}` ? 'play-btn--visible' : ''
                        }`}
                        aria-label={`Play ${item.title}`}
                      >
                        <i className="fa-solid fa-play" />
                      </button>
                    </div>
                    <div className="card-info">
                      <h3 className="card-title" title={item.title}>{item.title}</h3>
                      <p className="card-subtitle" title={item.subtitle}>{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>

              {scrollState.canScrollRight && (
                <button
                  className="scroll-btn scroll-btn--right"
                  onClick={() => scrollRight(key)}
                  aria-label="Scroll right"
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default MainContent
