const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = process.env.TMDB_BASE_URL;

export async function getTrendingMovies() {
  const res = await fetch(
    `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=tr-TR`
  );
  if (!res.ok) throw new Error("Filmler çekilemedi");
  const data = await res.json();
  return data.results;
}