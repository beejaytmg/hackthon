import Image from 'next/image';

async function getMovieDetails(tmdbId) {
  const res = await fetch(`https://portbijay.pythonanywhere.com/api/movie/${tmdbId}/`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch movie details');
  }
  return res.json();
}

async function getTMDBDetails(tmdbId) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch TMDB details');
    }
    console.log(res);
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch TMDB details for movie ${tmdbId}:`, error);
    return null;
  }
}

export default async function MovieDetailPage({ params }) {
  const { tmdb_id } = params;
  const movie = await getMovieDetails(tmdb_id);
  const tmdbDetails = await getTMDBDetails(tmdb_id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          {tmdbDetails && tmdbDetails.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/original${tmdbDetails.poster_path}`}
              alt={tmdbDetails.title || movie.title || `Movie ${tmdb_id}`}
              width={500}
              height={750}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-0 pb-[150%] bg-gray-300 flex items-center justify-center rounded-lg shadow-lg">
              <span className="text-gray-500">No poster available</span>
            </div>
          )}
        </div>
        <div className="md:w-2/3">
        {/* Watch Now Button */}
        <a
            href={`https://bollyfunmaza.info/goto/imovie.php?cid=${movie.imdb_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Watch Now
          </a>
          <h1 className="text-3xl font-bold mb-4">{tmdbDetails?.title || movie.title || `Movie ${tmdb_id}`}</h1>
          <p className="text-gray-600 mb-4">{tmdbDetails?.overview || 'No overview available.'}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Movie Details</h2>
              <p><strong>Language:</strong> {movie.language}</p>
              <p><strong>Year:</strong> {movie.year}</p>
              <p><strong>Quality:</strong> {movie.quality}</p>
              <p><strong>IMDB ID:</strong> {movie.imdb_id}</p>
            </div>
            {tmdbDetails && (
              <div>
                <h2 className="text-xl font-semibold mb-2">TMDB Details</h2>
                <p><strong>Release Date:</strong> {tmdbDetails.release_date || 'N/A'}</p>
                <p><strong>Runtime:</strong> {tmdbDetails.runtime ? `${tmdbDetails.runtime} minutes` : 'N/A'}</p>
                <p><strong>Vote Average:</strong> {tmdbDetails.vote_average ? `${tmdbDetails.vote_average.toFixed(1)}/10` : 'N/A'}</p>
                <p><strong>Genres:</strong> {tmdbDetails.genres ? tmdbDetails.genres.map(g => g.name).join(', ') : 'N/A'}</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
