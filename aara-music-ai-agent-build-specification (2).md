# Aara Music — MERN AI Agent Build Specification

## Purpose

Build **Aara**, a responsive music discovery website using the existing MERN project. The application must continue from the current frontend and backend codebase and preserve its existing design. Spotify replaces Audius as the external music platform.

> Important Spotify limitation: Spotify Web API is primarily for catalog metadata, search, user libraries, playlists, and playback control. Full in-browser playback requires the Spotify Web Playback SDK and an active Spotify Premium user; the Web API does not provide unrestricted full-song audio files for a custom HTML5 player. Spotify preview clips may be available for some tracks. [web:20][web:21][web:22]

## Existing Codebase First

The existing repository is authoritative. Do not rebuild the frontend or backend from scratch.

Before coding, the AI agent must:

1. Inspect the complete repository tree.
2. Read `README.md`, `package.json` files, environment examples, routes, API clients, models, authentication, state management, and reusable UI components.
3. Run the existing frontend and backend.
4. Record current start, test, lint, and build commands.
5. Identify existing screens, design conventions, working features, and current API patterns.
6. Create a Git checkpoint before structural changes.

The first response must contain:

```text
Frontend location:
Backend location:
Start commands:
Existing routes:
API client:
Authentication:
Database models:
State management:
Design system:
Spotify integration status:
Risks:
```

Reuse existing layouts, styles, components, libraries, routing, authentication, and API conventions. Do not introduce a second UI library or redesign working screens without approval.

## Folder Rename Policy

Keep current folders when they are clear and functional. Rename only when a folder is misleading, duplicated, or necessary for clean separation.

Before renaming a folder:

- Search imports, aliases, scripts, tests, Docker files, deployment files, and documentation.
- Move files instead of recreating them where possible.
- Update every reference.
- Test case-sensitive paths on Linux.
- Run frontend and backend startup checks, linting, tests, and production builds.
- Report the old and new paths.

Never delete existing features, reset the database, or perform destructive refactoring without explicit approval.

## Product Scope

Aara should provide:

- Music search.
- Artist, album, playlist, and track metadata.
- Featured and recently searched content.
- Spotify login where user-specific features are needed.
- Personal favorites and playlists stored in Aara or managed through Spotify with appropriate scopes.
- A global player interface that either controls Spotify playback or plays available preview clips.
- Responsive desktop and mobile design using the current application style.

### First-release features

- Home page.
- Search tracks, artists, albums, and playlists.
- Track, artist, album, and playlist detail views.
- Spotify OAuth login.
- Profile and current-user state.
- Favorites or saved tracks.
- Aara custom playlists in MongoDB.
- Recently viewed or played metadata.
- Global player UI.
- Spotify playback integration for Premium users through the Web Playback SDK, or preview playback where a preview URL is available.

### Later features

- Audiobooks and podcast search.
- Recommendations based on user behavior.
- Social sharing.
- Administrator dashboard.
- Subscription features.

## MERN Architecture

```text
React frontend
  ├─ Existing application shell and design
  ├─ Search and discovery pages
  ├─ Spotify OAuth callback page
  ├─ Global player interface
  └─ Library and playlist pages

Express/Node backend
  ├─ Spotify OAuth and token exchange
  ├─ Spotify Web API integration
  ├─ Token refresh and secure session handling
  ├─ Favorites, playlists, and history APIs
  └─ Validation, caching, rate limiting, and errors

MongoDB
  ├─ Aara users
  ├─ Spotify account identifiers
  ├─ Favorites
  ├─ Custom playlists
  └─ Listening or browsing history
```

## Spotify Developer Setup

Create a Spotify app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard). Configure the exact redirect URI used by the application, for example:

```text
http://localhost:5000/api/v1/auth/spotify/callback
```

Spotify Web API access requires an access token. Spotify currently requires the app owner to have an active Premium account for Development Mode, and new development-mode apps have strict user limits. Confirm current limits in Spotify’s documentation before deployment. [web:21][web:25]

Environment variables:

```env
# server only
SPOTIFY_CLIENT_ID=replace_me
SPOTIFY_CLIENT_SECRET=replace_me
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/v1/auth/spotify/callback
SPOTIFY_SCOPES=user-read-private user-read-email user-library-read user-library-modify playlist-read-private playlist-modify-private playlist-modify-public streaming user-read-playback-state user-modify-playback-state

# frontend
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Never expose `SPOTIFY_CLIENT_SECRET` in React. Never commit secrets. Use the Authorization Code with PKCE flow for browser-oriented authentication where appropriate; keep token exchange and refresh logic on the backend unless the chosen OAuth architecture explicitly requires otherwise.

## Spotify Integration Layer

Keep all Spotify calls inside a dedicated service. Follow the existing backend service pattern if one exists.

```text
server/src/integrations/spotify/
├── spotify.client.js
├── spotify.auth.service.js
├── spotify.music.service.js
├── spotify.token.service.js
├── spotify.mapper.js
├── spotify.cache.js
└── spotify.routes.js
```

Responsibilities:

- Generate the Spotify authorization URL.
- Handle OAuth callback.
- Exchange authorization code for tokens.
- Refresh expired access tokens.
- Search Spotify catalog content.
- Retrieve tracks, artists, albums, and playlists.
- Read and modify user library where authorized.
- Control playback for eligible Premium users.
- Map Spotify responses to stable Aara objects.
- Handle rate limits and token errors.

Suggested normalized track shape:

```js
{
  id: "spotify-track-id",
  uri: "spotify:track:...",
  title: "Track title",
  artist: {
    id: "spotify-artist-id",
    name: "Artist name"
  },
  album: {
    id: "spotify-album-id",
    name: "Album name",
    artworkUrl: "image-url"
  },
  durationMs: 240000,
  previewUrl: null,
  externalUrl: "https://open.spotify.com/track/..."
}
```

Do not assume that every track has a `preview_url`. If no preview exists and the user is not using an eligible Spotify playback device, show an **Open in Spotify** action instead of pretending that full audio can be played.

## Playback Strategy

Implement playback in two supported modes:

### Mode A — Spotify Web Playback SDK

Use this mode when:

- The user is authenticated with Spotify.
- The user has an active Spotify Premium account.
- The application has the required `streaming` scope.
- The browser supports the SDK.

The Web Playback SDK creates a Spotify Connect device in the browser and requires a Premium account. [web:22][web:23]

The player must:

- Create one player instance.
- Obtain access tokens safely.
- Connect and register the device.
- Transfer playback when required.
- Control play, pause, seek, volume, next, and previous.
- Display device and connection status.
- Handle token expiration.
- Handle Premium or unavailable-device errors.

### Mode B — Preview playback

If a track provides a preview URL, use an HTML5 `<audio>` element for the short preview. Preview availability is not guaranteed.

```jsx
<audio controls src={track.previewUrl || undefined} />
```

If no preview is available, render:

```text
Preview unavailable — Open in Spotify
```

Do not download, proxy, cache, or expose full Spotify audio as if it were a normal MP3 file. Spotify streaming is subject to Spotify’s developer policy and commercial-use restrictions. [web:20][web:23]

## Backend API

Use the current API prefix if one exists. Otherwise use `/api/v1`.

```text
GET    /api/v1/auth/spotify/login
GET    /api/v1/auth/spotify/callback
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/spotify/search?q=&type=&page=&limit=
GET    /api/v1/spotify/tracks/:trackId
GET    /api/v1/spotify/artists/:artistId
GET    /api/v1/spotify/albums/:albumId
GET    /api/v1/spotify/playlists/:playlistId
GET    /api/v1/spotify/me/player
POST   /api/v1/spotify/me/player/transfer

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

Use a predictable response shape:

```js
{ success: true, data: {}, message: null, meta: {} }
{ success: false, message: "Readable error", code: "SPOTIFY_ERROR", errors: [] }
```

## MongoDB Models

### User

```js
{
  name,
  email,
  passwordHash,
  spotifyUserId,
  spotifyDisplayName,
  spotifyAccessTokenEncrypted,
  spotifyRefreshTokenEncrypted,
  spotifyTokenExpiresAt,
  avatarUrl,
  preferences,
  createdAt,
  updatedAt
}
```

Encrypt or otherwise protect stored refresh tokens. Do not log access or refresh tokens.

### Favorite

```js
{
  userId,
  spotifyTrackId,
  trackSnapshot: {
    title,
    artistName,
    artworkUrl,
    durationMs,
    externalUrl
  },
  createdAt
}
```

Create a unique compound index on `userId` and `spotifyTrackId`.

### Playlist

```js
{
  userId,
  name,
  description,
  artworkUrl,
  tracks: [
    {
      spotifyTrackId,
      title,
      artistName,
      artworkUrl,
      addedAt
    }
  ],
  createdAt,
  updatedAt
}
```

### History

```js
{
  userId,
  spotifyTrackId,
  trackSnapshot,
  playedAt
}
```

Keep history bounded, such as the latest 50–100 records per user.

## Frontend Structure

Retain the current structure when it is clear. If new folders are needed, use a structure similar to:

```text
client/src/
├── components/layout
├── components/music
├── components/player
├── components/search
├── pages
├── services
├── stores
├── hooks
└── styles
```

Pages:

- Home.
- Search.
- Track details.
- Artist details.
- Album details.
- Playlist details.
- Library.
- Favorites.
- Login and OAuth callback.
- Profile.
- Not found.

Components:

- `TrackCard`.
- `TrackRow`.
- `ArtistCard`.
- `PlaylistCard`.
- `SearchBar`.
- `SpotifyLoginButton`.
- `AudioPlayer`.
- `QueueDrawer`.
- `PlaybackStatus`.
- `LoadingSkeleton`.
- `EmptyState`.
- `ErrorState`.

## Ordered Implementation Phases

Complete and verify each phase before starting the next.

### Phase 0 — Repository audit

- Inspect and run the existing project.
- Document structure, design, routes, APIs, authentication, models, and commands.
- Create a Git checkpoint.
- Do not redesign or rename folders.

**Exit criteria:** existing functionality still works and the assessment is documented.

### Phase 1 — Structure alignment

- Compare current folders with this document.
- Keep working folders.
- Rename only necessary folders after searching all references.
- Update imports, aliases, scripts, tests, and deployment files.

**Exit criteria:** no broken imports and existing screens work unchanged.

### Phase 2 — Spotify developer configuration

- Create a Spotify developer app.
- Add exact redirect URIs.
- Add server environment variables.
- Implement safe configuration validation.
- Confirm Development Mode and Premium requirements.

**Exit criteria:** configuration loads without exposing secrets.

### Phase 3 — Spotify OAuth

- Add Spotify login route.
- Implement authorization code with PKCE or the approved server flow.
- Handle callback and state validation.
- Store user identity and protected refresh token.
- Implement token refresh.
- Add logout and current-user behavior.

**Exit criteria:** a test user can authenticate and the application can obtain a valid access token.

### Phase 4 — Catalog discovery

- Add Spotify search through Express.
- Add track, artist, album, and playlist detail endpoints.
- Add search debounce, pagination, loading, empty, and error states.
- Preserve the existing UI design.

**Exit criteria:** users can browse Spotify metadata through Aara.

### Phase 5 — Playback

- Decide whether the first release uses preview playback, Web Playback SDK, or both.
- Implement one global player state.
- Add Preview mode where `previewUrl` exists.
- Add Web Playback SDK only after OAuth works.
- Add Premium, unavailable-preview, disconnected-device, and token-expiration states.
- Provide an Open in Spotify fallback.

**Exit criteria:** playback behavior is honest and compliant: preview playback, eligible Spotify playback, or a clear Spotify redirect.

### Phase 6 — Aara library

- Add favorites.
- Add custom playlists.
- Add history.
- Add ownership validation and MongoDB indexes.
- Add optimistic updates only with rollback handling.

**Exit criteria:** authenticated users can manage their Aara library.

### Phase 7 — Detail pages and responsive polish

- Add track, artist, album, and playlist pages.
- Match the existing design.
- Improve mobile behavior using current breakpoints.
- Add keyboard accessibility and unavailable-content handling.

**Exit criteria:** primary flows work on desktop and mobile.

### Phase 8 — Testing, security, and deployment

- Test OAuth, token refresh, logout, and protected routes.
- Test Spotify API errors, rate limits, missing previews, and non-Premium playback.
- Run linting, unit tests, integration tests, and production builds.
- Review CORS, cookies, token storage, validation, and secret exposure.
- Update setup and deployment documentation.
- Perform regression testing of all existing features.

**Exit criteria:** the application is deployable, documented, and free of known critical regressions.

## AI Agent Rules

1. Inspect before creating, modifying, or renaming files.
2. Complete Phase 0 and report the assessment first.
3. Preserve the existing design and working behavior.
4. Reuse existing components and libraries.
5. Keep Spotify calls inside an integration/service layer.
6. Keep client secrets and refresh tokens on the backend.
7. Do not implement full-song downloads or unauthorized audio proxies.
8. Verify current Spotify endpoint and SDK requirements before coding.
9. Add loading, empty, error, Premium, preview-unavailable, and authentication states.
10. Build one small feature slice at a time.
11. Ask before destructive refactoring, database resets, or major redesign.
12. Run linting, tests, and production builds after substantial changes.
13. Report changed files, commands, test status, known issues, and next steps.

After each phase, report:

```text
Phase completed:
Implemented:
Files changed:
Existing behavior preserved:
Commands run:
Tests/build status:
Known issues:
Next phase:
```

## Definition of Done

A feature is complete when it works in the browser, matches the existing design, is responsive, validates input, handles Spotify errors, protects credentials, includes appropriate tests, passes linting, passes the production build, and is documented.

The first milestone is complete when a user can authenticate or browse as allowed, search Spotify content, view metadata, and either play an available preview, use the Spotify Web Playback SDK, or open the track in Spotify. The second milestone is complete when an authenticated user can save favorites and manage a personal playlist.
