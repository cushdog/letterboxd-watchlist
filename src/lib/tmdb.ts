import { MovieDetails } from "@/types/types";

const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;
const OMDB_BASE_URL = 'http://www.omdbapi.com';

export async function fetchMovieDetails(title: string, year: string): Promise<MovieDetails | null> {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&y=${year}&plot=full`
    );
    const data = await response.json();
    return data.Response === 'True' ? data : null;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}