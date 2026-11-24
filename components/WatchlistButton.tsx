"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";

interface WatchlistButtonProps {
  movieId: number;
  movieTitle: string;
  posterPath: string | null;
}

export default function WatchlistButton({
  movieId,
  movieTitle,
  posterPath,
}: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkWatchlist() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data } = await supabase
        .from("watchlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("movie_id", movieId)
        .maybeSingle();

      if (data) {
        setInWatchlist(true);
      }
      setLoading(false);
    }

    checkWatchlist();
  }, [movieId]);

  const toggleWatchlist = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    setLoading(true);

    if (inWatchlist) {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", userId)
        .eq("movie_id", movieId);

      if (!error) {
        setInWatchlist(false);
      }
    } else {
      const { error } = await supabase.from("watchlist").insert({
        user_id: userId,
        movie_id: movieId,
        movie_title: movieTitle,
        poster_path: posterPath,
      });

      if (!error) {
        setInWatchlist(true);
      }
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleWatchlist}
      disabled={loading}
      className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer disabled:opacity-50 ${
        inWatchlist
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
          : "bg-amber-500 text-zinc-950 hover:bg-amber-400"
      }`}
    >
      {loading
        ? "Yükleniyor..."
        : inWatchlist
        ? "✓ İzleme Listesinde"
        : "+ İzleme Listesine Ekle"}
    </button>
  );
}