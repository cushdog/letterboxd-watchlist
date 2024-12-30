'use client';

import React, { useState, ChangeEvent } from 'react';
import { FilmIcon, Loader2, Upload, Clock, Star, Calendar, Award } from 'lucide-react';
import Papa from 'papaparse';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { fetchMovieDetails } from '@/lib/tmdb';
import { LetterboxdMovie, MovieDetails } from '@/types/types';

const MoviePicker: React.FC = () => {
  const [movies, setMovies] = useState<LetterboxdMovie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<LetterboxdMovie | null>(null);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    
    Papa.parse<string[]>(file, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const parsedMovies = results.data
            .filter(row => row.length >= 4)
            .map(row => ({
              date: row[0],
              title: row[1],
              year: row[2],
              url: row[3]
            }));
          setMovies(parsedMovies);
          setSelectedMovie(null);
          setMovieDetails(null);
          setLoading(false);
        }
      },
      error: (error: Error) => {
        setError('Error parsing CSV file. Please ensure it\'s in the correct format.');
        setLoading(false);
      }
    });
  };

  const pickRandomMovie = async (): Promise<void> => {
    if (movies.length === 0) {
      setError('Please upload your Letterboxd watchlist first!');
      return;
    }

    setLoading(true);
    const randomIndex = Math.floor(Math.random() * movies.length);
    const movie = movies[randomIndex];
    setSelectedMovie(movie);
    
    try {
      const details = await fetchMovieDetails(movie.title, movie.year);
      setMovieDetails(details);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }

    setLoading(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const getRatingColor = (rating: string): string => {
    const numRating = parseFloat(rating);
    if (numRating >= 8) return 'text-green-600';
    if (numRating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4 flex items-center justify-center gap-3">
            <FilmIcon className="w-10 h-10" />
            Movie Night Picker
          </h1>
          <p className="text-gray-600">Let&apos;s find your next movie adventure!</p>
        </div>

        {/* File Upload */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8 transition-all hover:shadow-xl">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-purple-500" />
              <p className="mb-2 text-sm text-purple-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">Your Letterboxd watchlist CSV</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Movie Count */}
        {movies.length > 0 && (
          <div className="text-center mb-8 text-gray-600">
            {movies.length} movies in your watchlist
          </div>
        )}

        {/* Pick Button */}
        <button
          onClick={pickRandomMovie}
          disabled={loading || movies.length === 0}
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg 
                   hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            'Pick a Random Movie! 🎬'
          )}
        </button>

        {/* Selected Movie with Details */}
        {selectedMovie && movieDetails && (
          <div className="mt-12 bg-white p-8 rounded-xl shadow-lg transform transition-all duration-500">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Movie Poster */}
              {movieDetails.Poster && movieDetails.Poster !== 'N/A' && (
                <div className="w-full md:w-1/3">
                  <img
                    src={movieDetails.Poster}
                    alt={`${movieDetails.Title} poster`}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              )}
              
              {/* Movie Details */}
              <div className="w-full md:w-2/3">
                <h2 className="text-3xl font-bold text-purple-800 mb-2">
                  {movieDetails.Title} ({movieDetails.Year})
                </h2>
                
                <div className="flex flex-wrap gap-4 mb-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {movieDetails.Runtime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span className={getRatingColor(movieDetails.imdbRating)}>
                      {movieDetails.imdbRating}/10
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {movieDetails.Released}
                  </div>
                  {movieDetails.Awards !== 'N/A' && (
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {movieDetails.Awards}
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  {movieDetails.Genre.split(', ').map(genre => (
                    <span
                      key={genre}
                      className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-600 mb-4">
                  {movieDetails.Plot}
                </p>

                <div className="mb-4">
                  <div className="text-gray-600">
                    <strong>Director:</strong> {movieDetails.Director}
                  </div>
                  <div className="text-gray-600">
                    <strong>Cast:</strong> {movieDetails.Actors}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <a
                    href={selectedMovie.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    View on Letterboxd →
                  </a>
                  <a
                    href={`https://www.imdb.com/title/${movieDetails.imdbID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    View on IMDb →
                  </a>
                </div>
                
                <div className="mt-4 text-gray-500 text-sm">
                  Added to watchlist: {selectedMovie.date}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confetti Effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-purple-500 rounded-full animate-ping" />
              <div className="w-4 h-4 bg-pink-500 rounded-full animate-ping delay-100" />
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-ping delay-200" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviePicker;