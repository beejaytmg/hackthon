import Link from 'next/link';
import Image from 'next/image';

async function getMovies(page = 1) {
  const res = await fetch(`https://portbijay.pythonanywhere.com/api/movies?page=${page}`, {
    cache: 'no-store', // Ensures fresh data is fetched on every request
  });
  if (!res.ok) {
    throw new Error('Failed to fetch movies');
  }
  return res.json();
}

async function getMovieDetails(tmdbId) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch movie details');
    }
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch TMDB details for movie ${tmdbId}:`, error);
    return null;
  }
}

export default async function MoviesPage({ searchParams }) {
  const page = Number(searchParams.page) || 1;
  const { results: movies, next, previous, count } = await getMovies(page);
  const moviesWithDetails = await Promise.all(
    movies.map(async (movie) => {
      const details = await getMovieDetails(movie.tmdb_id);
      return { ...movie, ...details };
    })
  );

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold my-8">Movies</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"> {/* Adjust grid for smaller images */}
        {moviesWithDetails.map((movie) => (
          <Link href={`/movie/${movie.tmdb_id}`} key={movie.id}>
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              {/* {movie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                  alt={movie.title || `Movie ${movie.tmdb_id}`}
                  width={250} // Smaller width
                  height={375} // Smaller height
                  className="w-full h-auto"
                />
              ) : ( */}
                <div className="w-full h-0 pb-[150%] bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">No poster available</span>
                </div>
              {/* )} */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4">
                <h2 className="text-white text-lg font-semibold">{movie.title || `Movie ${movie.tmdb_id}`}</h2>
                <div className="flex justify-between mt-2">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">{movie.language}</span>
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">{movie.year}</span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">{movie.quality}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-between items-center mt-8">
        {previous && (
          <Link href={`?page=${page - 1}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Previous
          </Link>
        )}
        <span>Page {page} of {Math.ceil(count / movies.length)}</span>
        {next && (
          <Link href={`?page=${page + 1}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Next
          </Link>
        )}
      </div>
    </div>
  );
}