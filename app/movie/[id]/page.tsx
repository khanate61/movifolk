import Link from "next/link";
import WatchlistButton from "../../../components/WatchlistButton";
import MovieComments from "../../../components/MovieComments";

export const dynamic = "force-dynamic";

async function getMovieDetails(id: string) {
  const apiKey = process.env.TMDB_API_KEY;
  const baseUrl = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

  const res = await fetch(
    `${baseUrl}/movie/${id}?api_key=${apiKey}&language=tr-TR&append_to_response=credits,videos`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovieDetails(id);

  if (!movie) {
    return { title: "Film Bulunamadı" };
  }

  return {
    title: movie.title,
    description: movie.overview?.slice(0, 160),
  };
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovieDetails(id);

  if (!movie) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white p-8 text-center flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Film bulunamadı.</h1>
        <Link href="/" className="text-blue-500 hover:underline mt-4">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  const trailer = movie.videos?.results?.find(
    (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 max-w-6xl mx-auto">
      <Link href="/" className="text-sm text-neutral-400 hover:text-white mb-8 inline-block transition-colors">
        ← Ana Sayfaya Dön
      </Link>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {movie.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full md:w-72 rounded-xl shadow-2xl object-cover self-start border border-neutral-800"
          />
        )}
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-neutral-100">{movie.title}</h1>
          <p className="text-neutral-400 mb-5 text-sm md:text-base">
            {movie.release_date?.split("-")[0]} • {movie.runtime ? `${movie.runtime} dakika` : "Süre belirtilmedi"} • 
            <span className="text-yellow-500 ml-2">★ {movie.vote_average?.toFixed(1)}/10</span>
          </p>

          <div className="mb-8">
            <WatchlistButton
              movieId={movie.id}
              movieTitle={movie.title}
              posterPath={movie.poster_path}
            />
          </div>

          <h2 className="text-xl font-semibold mb-3 text-neutral-200">Özet</h2>
          <p className="text-neutral-300 leading-relaxed mb-8 text-lg">
            {movie.overview || "Bu film için Türkçe özet henüz eklenmedi."}
          </p>

          {movie.credits?.cast?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-neutral-200">Öne Çıkan Oyuncular</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {movie.credits.cast.slice(0, 6).map((actor: any) => (
                  <div key={actor.id} className="flex-shrink-0 w-24 text-center">
                    {actor.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        className="w-24 h-24 rounded-full object-cover mb-2 border border-neutral-800"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-neutral-800 mb-2 border border-neutral-700"></div>
                    )}
                    <p className="text-sm font-medium text-neutral-200 truncate">{actor.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {trailer && (
        <div className="mt-16 border-t border-neutral-800 pt-10">
          <h2 className="text-2xl font-bold mb-6 text-neutral-200">Fragman</h2>
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="Film Fragmanı"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <MovieComments movieId={movie.id} />
    </main>
  );
}