/**
 * Fallback SVG Data URIs and image error handler to ensure no broken or invisible images
 */
export const DEFAULT_TRACK_ARTWORK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23282828"/><circle cx="150" cy="150" r="70" fill="%23181818"/><path d="M140 120v60c-2.8-1.5-6.2-2.5-10-2.5-11 0-20 6.7-20 15s9 15 20 15 20-6.7 20-15v-50h30v-17.5h-40z" fill="%23B91FE1"/></svg>`

export const DEFAULT_ARTIST_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23282828"/><circle cx="150" cy="150" r="140" fill="%231f1f1f"/><circle cx="150" cy="120" r="45" fill="%23555555"/><path d="M75 240c0-41.4 33.6-75 75-75s75 33.6 75 75" fill="%23555555"/></svg>`

export const handleImageError = (e, fallback = DEFAULT_TRACK_ARTWORK) => {
  if (e?.currentTarget) {
    e.currentTarget.onerror = null // prevent infinite loops
    e.currentTarget.src = fallback
  }
}
