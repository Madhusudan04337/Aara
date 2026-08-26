# Aara Music — AI Agent Implementation README

## 1. Mission

Build and extend **Aara**, a music discovery and streaming web application using the existing MERN codebase and the Jamendo API.

The AI coding agent must continue from the current frontend and backend. It must preserve the existing design, working features, folder conventions, API conventions, and reusable components. Do not rebuild the project from scratch.

Aara uses Jamendo as its external music catalog and audio-stream source. Jamendo’s tracks API provides track metadata and audio stream URLs through the `audio` field; track licenses must be inspected and presented appropriately. [web:56][web:57]

## 2. Product Requirements

### Main goal

Allow users to discover and stream available Jamendo music through Aara’s web interface.

### Guest capabilities

- Open the Aara home page.
- Browse featured, popular, or recently retrieved tracks.
- Search tracks.
- View track artwork, title, artist, album, genre, duration, and license information.
- Stream available tracks through the global player.
- View artist and album information when available.
- View Jamendo attribution and license links.

### Registered-user capabilities

- Register and log in to Aara.
- Log out and retrieve the current user.
- Save tracks as favorites.
- Remove tracks from favorites.
- Create custom playlists.
- Rename and delete owned playlists.
- Add and remove tracks from playlists.
- View recently played tracks.
- Manage profile and preferences.

### Optional later features

- Artist profiles and artist-upload workflows.
- Track comments and likes.
- Follow artists.
- Admin moderation.
- Listening analytics.
- Audio quality selection where supported.
- Search by genre, mood, language, or license.

### Do not implement in the first version

- Spotify integration.
- Audius integration.
- Spotify OAuth or Premium playback.
- Unauthorized music downloads.
- Re-hosting or redistributing audio without permission.
- Social chat.
- Payments and subscriptions.
- A complex recommendation engine.

## 3. Existing Codebase Policy

### Mandatory first action

Before creating or modifying files, inspect the existing repository.

The AI agent must:

1. Inspect the complete file tree.
2. Read the root `README.md`.
3. Read frontend and backend `package.json` files.
4. Identify frontend and backend entry points.
5. Identify existing routes, controllers, services, models, middleware, components, pages, hooks, and stores.
6. Identify the current styling system: CSS, Tailwind, Material UI, Bootstrap, or another system.
7. Identify existing authentication and MongoDB configuration.
8. Run the existing frontend and backend.
9. Record current commands for development, testing, linting, and production builds.
10. Create a Git checkpoint before structural changes.

The agent must first report:

```text
Repository assessment:
- Frontend location:
- Backend location:
- Frontend start command:
- Backend start command:
- Test command:
- Lint command:
- Build command:
- Existing routes:
- Existing API client:
- Existing authentication:
- Existing database models:
- Existing state management:
- Existing design system:
- Existing reusable components:
- Existing Jamendo integration:
- Risks and unclear areas:
```

### Preserve the current design

The current Aara frontend design is the default design system.

The agent must:

- Reuse existing layouts and components.
- Preserve current colors, typography, spacing, navigation, and responsive behavior.
- Follow the existing CSS or component-library conventions.
- Avoid introducing a second UI framework.
- Extend existing screens instead of replacing them.
- Improve design only when required for usability, accessibility, or feature consistency.
- Ask before a major visual redesign.

### Preserve working behavior

When this README conflicts with existing working code, use this priority:

1. Preserve working user functionality.
2. Preserve the existing design and coding conventions.
3. Preserve existing API contracts when possible.
4. Add new functionality in the smallest compatible way.
5. Refactor only after behavior is protected by tests or verification.

Never delete existing features, reset the database, or replace the application without explicit approval.

## 4. Folder Rename Policy

Do not rename folders merely to match the examples in this README.

Rename or reorganize only when:

- A folder is misleading.
- A folder duplicates another folder.
- A clean frontend/backend separation is required.
- The current naming convention is inconsistent and the change has clear value.

Before renaming:

1. Search all imports and dynamic imports.
2. Search path aliases and TypeScript configuration.
3. Search package scripts and build configuration.
4. Search tests, Docker files, deployment files, and documentation.
5. Move files rather than recreating them.
6. Update every reference.
7. Run the frontend and backend.
8. Run lint, tests, and production builds.
9. Report old and new folder paths.

## 5. Technology Requirements

### Frontend

- React with the project’s existing build tool.
- React Router if routing is required.
- Existing state-management solution; use Zustand or Redux Toolkit only if no solution exists.
- Existing styling system.
- HTML5 `<audio>` for Jamendo stream playback.
- TanStack Query or the existing data-fetching approach for server state.

### Backend

- Node.js.
- Express.js.
- MongoDB.
- Mongoose.
- Axios or native `fetch`.
- dotenv.
- Helmet.
- CORS with explicit origins.
- Rate limiting.
- Request validation.
- Centralized error handling.

### Testing

- Use the existing test framework.
- If none exists, use Vitest or Jest for unit tests.
- Use Supertest for Express endpoints.
- Use React Testing Library for UI behavior.
- Use Playwright for important end-to-end flows where practical.

## 6. Jamendo Application Configuration

The Jamendo application **Aara** is already live and has a Client ID and Client Secret.

For public catalog search and streaming, use the Client ID from the Express backend:

```env
JAMENDO_CLIENT_ID=replace_me
```

Keep the Client Secret on the backend only:

```env
JAMENDO_CLIENT_SECRET=replace_me
```

The initial public catalog implementation may not require the Client Secret or Redirect URL. Do not build authentication against Jamendo unless a specific user-account feature is required.

Frontend environment:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Backend environment:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/aara
CLIENT_URL=http://localhost:5173
JAMENDO_CLIENT_ID=replace_me
JAMENDO_CLIENT_SECRET=replace_me
```

Security rules:

- Never commit `.env` files.
- Never place `JAMENDO_CLIENT_SECRET` in React.
- Never log secrets.
- Create `.env.example` files with empty placeholders.
- Validate required environment variables at backend startup.

## 7. Jamendo API Integration

Create a dedicated integration layer. Components must not call Jamendo directly.

Suggested structure, adapted to the existing repository:

```text
server/src/integrations/jamendo/
├── jamendo.client.js
├── jamendo.service.js
├── jamendo.mapper.js
├── jamendo.cache.js
├── jamendo.controller.js
└── jamendo.routes.js
```

### Client responsibilities

- Configure the Jamendo base URL.
- Add the Client ID to requests.
- Set request timeout.
- Handle non-2xx responses.

### Service responsibilities

- Search tracks.
- Get track details.
- Get popular or featured tracks.
- Get tracks by artist, album, genre, or playlist where supported.
- Normalize pagination.
- Return only fields required by Aara.

### Mapper responsibilities

Map Jamendo responses to a stable internal shape:

```js
{
  id: "jamendo-track-id",
  title: "Track title",
  artist: {
    id: "artist-id",
    name: "Artist name"
  },
  album: {
    id: "album-id",
    name: "Album name",
    imageUrl: "image-url"
  },
  artworkUrl: "image-url",
  audioUrl: "stream-url",
  downloadUrl: null,
  durationSeconds: 240,
  genre: "Electronic",
  licenseUrl: "license-url",
  source: "jamendo"
}
```

Do not expose the complete raw Jamendo response unless required.

### Initial Jamendo service

```js
import axios from "axios";

const JAMENDO_BASE_URL = "https://api.jamendo.com/v3.0";

export async function searchJamendoTracks({
  query = "",
  page = 1,
  limit = 20,
} = {}) {
  const offset = (page - 1) * limit;

  const response = await axios.get(`${JAMENDO_BASE_URL}/tracks/`, {
    params: {
      client_id: process.env.JAMENDO_CLIENT_ID,
      format: "json",
      namesearch: query,
      limit,
      offset,
      audioformat: "mp32",
      include: "musicinfo",
    },
    timeout: 10000,
  });

  return response.data;
}
```

Verify parameters and response fields against the current Jamendo documentation before finalizing the implementation. The official tracks documentation identifies `client_id`, `audio`, and `audiodownload` fields. [web:56][web:57]

## 8. Backend API

Use the existing API prefix. If no prefix exists, use `/api/v1`.

### Music routes

```text
GET /api/v1/music/search?q=&page=&limit=&genre=
GET /api/v1/music/trending?page=&limit=
GET /api/v1/music/tracks/:trackId
GET /api/v1/music/artists/:artistId
GET /api/v1/music/albums/:albumId
GET /api/v1/music/playlists/:playlistId
```

The backend should return a normalized Aara track shape rather than requiring React to understand every Jamendo field.

### User routes

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/favorites
POST   /api/v1/favorites
DELETE /api/v1/favorites/:trackId

GET    /api/v1/playlists
POST   /api/v1/playlists
GET    /api/v1/playlists/:playlistId
PATCH  /api/v1/playlists/:playlistId
DELETE /api/v1/playlists/:playlistId
POST   /api/v1/playlists/:playlistId/tracks
DELETE /api/v1/playlists/:playlistId/tracks/:trackId

GET    /api/v1/history
POST   /api/v1/history
DELETE /api/v1/history
```

Response format:

```js
{
  success: true,
  data: {},
  message: null,
  meta: {
    page: 1,
    limit: 20,
    total: 100
  }
}
```

Error format:

```js
{
  success: false,
  message: "Music service is temporarily unavailable",
  code: "JAMENDO_API_ERROR",
  errors: []
}
```

## 9. React Features

### Home page

Use the existing home layout and add:

- Featured or popular tracks.
- Search entry point.
- Recently played section.
- Favorite tracks section for logged-in users.
- Genre shortcuts if supported.
- Track cards or rows using existing components.

### Search page

Implement:

- Debounced search input.
- Search on Enter.
- Track result list.
- Pagination or load more.
- Loading skeleton.
- Empty result state.
- Error and retry state.
- Track artwork and metadata.
- Play button.
- Favorite button.
- License link.

### Track card

Display:

- Artwork.
- Track title.
- Artist name.
- Album name.
- Duration.
- Play action.
- Favorite action.
- More actions.

### Detail pages

Add or extend:

- Track page.
- Artist page.
- Album page.
- Playlist page.

Support missing artwork, missing metadata, and unavailable audio.

## 10. Global Audio Player

Create one global player near the application root. Do not create one `<audio>` element per track card.

The player must support:

- Play.
- Pause.
- Seek.
- Progress display.
- Duration display.
- Volume.
- Mute.
- Previous track.
- Next track.
- Queue.
- Shuffle.
- Repeat off, track, and queue.
- Loading state.
- Audio error state.
- Continue playback between route changes.
- Mobile and desktop layouts.

Suggested state:

```js
{
  currentTrack: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  shuffle: false,
  repeatMode: "off"
}
```

Handle these audio events:

```text
loadstart
loadedmetadata
canplay
timeupdate
play
pause
ended
error
```

When `track.audioUrl` is missing:

```text
Audio unavailable for this track
```

Do not expose or implement download actions unless the track license and product requirements explicitly allow them.

## 11. License and Attribution

Aara must treat licensing as a required feature, not optional metadata.

For each track:

- Store the license URL when provided.
- Display artist name.
- Display Jamendo as the source.
- Link to the license.
- Follow attribution requirements.
- Do not assume all tracks have identical usage permissions.

Example:

```text
Music: Track Name — Artist Name
Source: Jamendo
View license
```

Free API access does not automatically grant unrestricted commercial, download, redistribution, or advertising rights. Jamendo provides separate licensing options for some use cases, so verify the license for each track before production distribution or monetization. [web:40][web:41]

## 12. MongoDB Models

### User

```js
{
  name,
  email,
  passwordHash,
  avatarUrl,
  preferences: {
    theme,
    autoplay,
    preferredGenres
  },
  createdAt,
  updatedAt
}
```

### Favorite

```js
{
  userId,
  track: {
    jamendoTrackId,
    title,
    artistName,
    albumName,
    artworkUrl,
    audioUrl,
    durationSeconds,
    licenseUrl,
    source
  },
  createdAt,
  updatedAt
}
```

Create a unique compound index on `userId` and `track.jamendoTrackId`.

### Playlist

```js
{
  userId,
  name,
  description,
  artworkUrl,
  tracks: [
    {
      jamendoTrackId,
      title,
      artistName,
      artworkUrl,
      audioUrl,
      durationSeconds,
      licenseUrl,
      addedAt
    }
  ],
  createdAt,
  updatedAt
}
```

### Listening history

```js
{
  userId,
  jamendoTrackId,
  trackSnapshot,
  playedAt
}
```

Keep history bounded to the latest 50–100 records per user.

## 13. Security and Reliability

Implement:

- Helmet.
- Explicit CORS origins.
- Rate limiting on public search endpoints.
- Request validation.
- MongoDB query validation.
- Authentication middleware.
- Playlist ownership validation.
- Centralized error handling.
- Jamendo timeout handling.
- Jamendo rate-limit handling.
- Safe logging without credentials.
- Environment-variable validation.

Do not expose stack traces, Client Secrets, or internal database details to the browser.

## 14. Performance

- Debounce search by approximately 300–500 ms.
- Limit result size.
- Paginate or use load more.
- Cache trending results.
- Cache repeated searches for a short TTL.
- Cancel stale search requests.
- Lazy-load noncritical images.
- Use one global audio element.
- Avoid unnecessary player re-renders.
- Add MongoDB indexes.

## 15. Ordered Implementation Phases

Complete and verify each phase before beginning the next.

### Phase 0 — Repository audit

Tasks:

- Inspect the existing repository.
- Run current frontend and backend.
- Document commands and design system.
- Identify existing routes, services, models, and components.
- Identify existing search, player, auth, and database functionality.
- Create a Git checkpoint.

Exit criteria:

- Current application runs.
- Existing behavior is documented.
- The agent provides the repository assessment.

### Phase 1 — Structure alignment

Tasks:

- Compare the current structure with this README.
- Retain clear, working folders.
- Rename only necessary folders.
- Update all references after a rename.
- Do not redesign the UI.

Exit criteria:

- No broken imports.
- Frontend and backend start successfully.
- Existing screens still work.

### Phase 2 — Jamendo configuration

Tasks:

- Add `JAMENDO_CLIENT_ID` to the backend environment.
- Add `.env.example`.
- Validate configuration at startup.
- Test the API with cURL.
- Confirm response fields and stream URLs.

Test command:

```bash
curl "https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_CLIENT_ID&format=json&limit=5"
```

Exit criteria:

- Jamendo returns track results.
- Credentials are not exposed to React.

### Phase 3 — Jamendo backend integration

Tasks:

- Create or extend the Jamendo client.
- Add service, mapper, controller, and routes.
- Add search endpoint.
- Add trending or featured endpoint.
- Add timeouts and error mapping.
- Add caching where appropriate.

Exit criteria:

- Express returns normalized Aara track objects.
- Jamendo errors produce predictable API errors.

### Phase 4 — React discovery

Tasks:

- Connect the existing search UI.
- Add debounce.
- Render track cards or rows.
- Add home-page music sections.
- Add loading, empty, error, and retry states.
- Add license links and attribution.

Exit criteria:

- Guests can search and browse Jamendo music.

### Phase 5 — Global player

Tasks:

- Add or extend the existing player store.
- Mount one global audio element.
- Implement play, pause, progress, seek, volume, next, previous, queue, repeat, and shuffle.
- Handle missing stream URLs and playback failures.
- Preserve current visual design.

Exit criteria:

- Users can select a result and stream it.
- Playback continues during navigation.

### Phase 6 — Authentication

Tasks:

- Reuse existing authentication if available.
- Otherwise implement registration, login, logout, current user, password hashing, and protected routes.
- Keep secrets on the backend.

Exit criteria:

- Guest and authenticated behavior are separated.
- Existing authentication still works.

### Phase 7 — Favorites and playlists

Tasks:

- Add favorite creation, deletion, and listing.
- Add custom playlist CRUD.
- Add track insertion and removal.
- Validate ownership.
- Add MongoDB indexes.
- Add optimistic UI only with rollback behavior.

Exit criteria:

- Authenticated users can manage favorites and playlists.

### Phase 8 — History and detail pages

Tasks:

- Add bounded listening history.
- Add track detail page.
- Add artist page.
- Add album page.
- Add playlist page.
- Add unavailable-content handling.

Exit criteria:

- Users can explore content and view their recent activity.

### Phase 9 — Quality and deployment

Tasks:

- Add frontend and backend tests.
- Test search, streaming, favorites, playlists, auth, and failures.
- Run linting.
- Run production builds.
- Review CORS and secret handling.
- Add deployment environment variables.
- Update the project README.
- Perform regression testing.

Exit criteria:

- The application is deployable and documented.

## 16. Testing Checklist

### Backend

- Jamendo search with a valid query.
- Empty query validation.
- Pagination validation.
- Jamendo timeout handling.
- Jamendo rate-limit handling.
- Normalized response mapping.
- Registration.
- Login.
- Protected favorites.
- Duplicate favorite prevention.
- Playlist ownership.
- Invalid IDs.

### Frontend

- Search form.
- Debounce behavior.
- Loading state.
- Empty state.
- API error state.
- Track card.
- Player play and pause.
- Progress updates.
- Queue behavior.
- Missing audio URL.
- Favorite button.
- Protected route.
- Mobile layout.

## 17. AI Agent Rules

1. Inspect before creating, modifying, or renaming files.
2. Complete Phase 0 before implementing features.
3. Preserve the existing design and working behavior.
4. Reuse existing components and libraries.
5. Keep Jamendo requests inside an integration/service layer.
6. Keep the Jamendo Client Secret on the backend.
7. Verify Jamendo method names, fields, parameters, and licenses before coding.
8. Do not invent stream URLs.
9. Do not add unauthorized downloads or redistribution.
10. Add loading, empty, error, and unavailable-audio states.
11. Keep one global audio element.
12. Do not perform destructive refactoring without approval.
13. Do not reset the database without approval.
14. Run lint, tests, and production builds after substantial changes.
15. Preserve user modifications.
16. Report every changed file and migration.
17. Stop and ask when API licensing or technical behavior is uncertain.

After every phase, report:

```text
Phase completed:
Implemented:
Files changed:
Folders renamed:
Database changes:
Existing behavior preserved:
Commands run:
Tests/build status:
Known issues:
Next phase:
```

## 18. Definition of Done

A feature is complete only when it:

- Works in the browser.
- Matches the existing Aara design.
- Works responsively.
- Has loading, empty, and error states.
- Validates input.
- Handles Jamendo failures.
- Does not expose secrets.
- Follows license and attribution requirements.
- Includes appropriate tests.
- Passes linting.
- Passes the production build.
- Is documented.

The first milestone is complete when a guest can open Aara, search Jamendo, view music metadata, play an available stream, and see attribution/license information.

The second milestone is complete when an authenticated user can save favorites, create playlists, add tracks, remove tracks, and view listening history.
