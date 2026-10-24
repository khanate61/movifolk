import { getTrendingMovies } from "@/lib/tmdb";
import Image from "next/image";
export const dynamic = 'force-dynamic';

export default async function Home() {
  const movies = await getTrendingMovies();

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-neutral-100">Günün Trend Filmleri</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie: any) => (
          <div key={movie.id} className="flex flex-col gap-3 group cursor-pointer">
            <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-200 truncate">{movie.title}</h2>
              <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                <span className="text-yellow-500">★</span>
                <span>{movie.vote_average.toFixed(1)}/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}