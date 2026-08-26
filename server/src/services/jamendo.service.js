import axios from "axios";

const JAMENDO_API_URL = "https://api.jamendo.com/v3.0";

export async function searchTracks({
  query = "",
  page = 1,
  limit = 20,
} = {}) {
  const offset = (page - 1) * limit;

  const response = await axios.get(`${JAMENDO_API_URL}/tracks/`, {
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