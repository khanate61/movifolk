"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../utils/supabase/client";

interface CommentItem {
  id: string;
  content: string;
  rating: number | null;
  created_at: string;
  user_id: string;
  profiles: { username: string | null } | { username: string | null }[] | null;
}

export default function MovieComments({ movieId }: { movieId: number }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(8);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("id, content, rating, created_at, user_id, profiles(username)")
      .eq("movie_id", movieId)
      .order("created_at", { ascending: false });

    if (data) {
      setComments(data as CommentItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
    fetchComments();
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !content.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    const { error } = await supabase.from("comments").insert({
      user_id: userId,
      movie_id: movieId,
      content: content.trim(),
      rating,
    });

    if (error) {
      setErrorMsg("Yorum gönderilemedi: " + error.message);
    } else {
      setContent("");
      await fetchComments();
    }

    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const getUsername = (profiles: CommentItem["profiles"]) => {
    if (!profiles) return "kullanici";
    if (Array.isArray(profiles)) return profiles[0]?.username || "kullanici";
    return profiles.username || "kullanici";
  };

  return (
    <div className="mt-16 border-t border-neutral-800 pt-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-neutral-200">
        Yorumlar ({comments.length})
      </h2>

      {userId ? (
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-neutral-300">Puanın:</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm text-amber-400 font-semibold focus:outline-none"
            >
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>
                  ★ {num}/10
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bu film hakkında ne düşünüyorsun?"
            required
            className="w-full bg-neutral-950 p-4 rounded-lg text-white resize-none border border-neutral-800 focus:outline-none focus:border-neutral-500 transition-colors"
            rows={3}
          />

          {errorMsg && (
            <p className="text-red-400 text-sm mt-2">{errorMsg}</p>
          )}

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="bg-amber-500 text-zinc-950 hover:bg-amber-400 px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Gönderiliyor..." : "Yorum Gönder"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-neutral-900/60 p-6 rounded-xl border border-neutral-800 mb-8 text-center">
          <p className="text-neutral-300 text-sm mb-3">
            Yorum yazmak ve puan vermek için hesabına giriş yapmalısın.
          </p>
          <Link
            href="/login"
            className="inline-block bg-amber-500 text-zinc-950 hover:bg-amber-400 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      )}

      {loading ? (
        <p className="text-neutral-500 text-sm">Yorumlar yükleniyor...</p>
      ) : comments.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          Henüz yorum yapılmamış. İlk yorumu sen yaz!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-neutral-900/80 p-5 rounded-xl border border-neutral-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-sm text-neutral-200">
                    @{getUsername(comment.profiles)}
                  </span>
                  {comment.rating && (
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      ★ {comment.rating}/10
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">
                    {new Date(comment.created_at).toLocaleDateString("tr-TR")}
                  </span>
                  {userId === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Sil
                    </button>
                  )}
                </div>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}