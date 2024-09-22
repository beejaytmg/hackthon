'use client';
import { useSearchParams } from 'next/navigation';
function MovieButton() {
    const searchParams = useSearchParams();
    const param = searchParams.get('param');
  
    if (!param) return null;
  
    return (
      <a
        href={`https://bollyfunmaza.info/goto/imovie.php?cid=${param}`}
        className="mt-8 inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Watch Movie
      </a>
    );
  }
export default MovieButton;