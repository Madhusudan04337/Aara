const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function searchTracks(query, page = 1) {
  const response = await fetch(
    `${API_URL}/music/search?q=${encodeURIComponent(query)}&page=${page}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Music search failed");
  }

  return result;
}