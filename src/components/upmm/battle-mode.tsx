"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trophy, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Photo } from "@/store/useAppStore";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface BattlePhoto extends Omit<Photo, '_count'> {
  _count?: {
    likes: number;
    comments?: number;
    remixes?: number;
  };
}

export function BattleMode() {
  const { data: session } = useSession();
  const [photo1, setPhoto1] = useState<BattlePhoto | null>(null);
  const [photo2, setPhoto2] = useState<BattlePhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [winner, setWinner] = useState<BattlePhoto | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [heartAnimation, setHeartAnimation] = useState<string | null>(null);

  const fetchBattle = async () => {
    setLoading(true);
    setWinner(null);
    try {
      const res = await fetch("/api/battle");
      const data = await res.json();
      setPhoto1(data.photo1);
      setPhoto2(data.photo2);
      
      // Check like status
      if (session?.user?.id) {
        const [like1, like2] = await Promise.all([
          fetch(`/api/likes?userId=${session.user.id}&photoId=${data.photo1.id}`).then(r => r.json()),
          fetch(`/api/likes?userId=${session.user.id}&photoId=${data.photo2.id}`).then(r => r.json()),
        ]);
        setLiked({
          [data.photo1.id]: like1.liked,
          [data.photo2.id]: like2.liked,
        });
      }
    } catch (error) {
      console.error("Error fetching battle:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBattle();
  }, []);

  const handleVote = async (winnerId: string, loserId: string) => {
    if (!session?.user?.id || voting) return;
    
    setVoting(true);
    const votedPhoto = winnerId === photo1?.id ? photo1 : photo2;
    
    // Show heart animation
    setHeartAnimation(winnerId);
    setTimeout(() => setHeartAnimation(null), 800);
    
    try {
      const res = await fetch("/api/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, loserId }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setWinner(votedPhoto);
        setLiked(prev => ({ ...prev, [winnerId]: true }));
        
        // Auto refresh after 3 seconds
        setTimeout(() => {
          fetchBattle();
        }, 3000);
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setVoting(false);
    }
  };

  const handleLike = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user?.id) return;

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, photoId }),
      });
      
      const data = await res.json();
      setLiked(prev => ({ ...prev, [photoId]: data.liked }));
    } catch (error) {
      console.error("Error liking:", error);
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-600">Faça login para participar</h3>
        <p className="text-sm text-gray-400 mt-2">Você precisa estar logado para votar nas batalhas</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
      </div>
    );
  }

  if (!photo1 || !photo2) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-600">Fotos insuficientes</h3>
        <p className="text-sm text-gray-400 mt-2">Precisamos de mais fotos para iniciar a batalha</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-black uppercase text-[#2D2A26] flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-[#FFB800]" />
          Batalha de Fotos
        </h2>
        <p className="text-gray-500 mt-1">Escolha sua favorita!</p>
      </div>

      {/* Battle Arena */}
      <div className="relative">
        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          {/* Photo 1 */}
          <motion.div
            className={`relative rounded-2xl overflow-hidden cursor-pointer ${
              winner === photo1 ? "ring-4 ring-[#FFB800]" : ""
            }`}
            whileHover={{ scale: winner ? 1 : 1.02 }}
            whileTap={{ scale: winner ? 1 : 0.98 }}
            onClick={() => !winner && handleVote(photo1.id, photo2.id)}
          >
            <div className="aspect-square relative">
              <img
                src={photo1.imageUrl}
                alt={photo1.title}
                className="w-full h-full object-cover"
              />
              
              {/* Heart Animation Overlay */}
              <AnimatePresence>
                {heartAnimation === photo1.id && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                  >
                    <Heart className="w-24 h-24 text-red-500 fill-current animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Winner Badge */}
              {winner === photo1 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50"
                >
                  <div className="bg-[#FFB800] text-[#2D2A26] px-6 py-3 rounded-2xl font-black uppercase text-xl flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Venceu!
                  </div>
                </motion.div>
              )}

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-bold truncate">{photo1.title}</h3>
                <p className="text-white/70 text-sm">por {photo1.author.name || "Anônimo"}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={(e) => handleLike(photo1.id, e)}
                    className={`flex items-center gap-1 ${
                      liked[photo1.id] ? "text-red-400" : "text-white/70 hover:text-red-400"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked[photo1.id] ? "fill-current" : ""}`} />
                    <span className="text-sm">{photo1._count?.likes || photo1.vibeCount}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* VS Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
            <div className="w-16 h-16 rounded-full bg-[#FFB800] flex items-center justify-center shadow-lg">
              <span className="text-[#2D2A26] font-black text-xl">VS</span>
            </div>
          </div>

          {/* Photo 2 */}
          <motion.div
            className={`relative rounded-2xl overflow-hidden cursor-pointer ${
              winner === photo2 ? "ring-4 ring-[#FFB800]" : ""
            }`}
            whileHover={{ scale: winner ? 1 : 1.02 }}
            whileTap={{ scale: winner ? 1 : 0.98 }}
            onClick={() => !winner && handleVote(photo2.id, photo1.id)}
          >
            <div className="aspect-square relative">
              <img
                src={photo2.imageUrl}
                alt={photo2.title}
                className="w-full h-full object-cover"
              />
              
              {/* Heart Animation Overlay */}
              <AnimatePresence>
                {heartAnimation === photo2.id && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                  >
                    <Heart className="w-24 h-24 text-red-500 fill-current animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Winner Badge */}
              {winner === photo2 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50"
                >
                  <div className="bg-[#FFB800] text-[#2D2A26] px-6 py-3 rounded-2xl font-black uppercase text-xl flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Venceu!
                  </div>
                </motion.div>
              )}

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-bold truncate">{photo2.title}</h3>
                <p className="text-white/70 text-sm">por {photo2.author.name || "Anônimo"}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={(e) => handleLike(photo2.id, e)}
                    className={`flex items-center gap-1 ${
                      liked[photo2.id] ? "text-red-400" : "text-white/70 hover:text-red-400"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked[photo2.id] ? "fill-current" : ""}`} />
                    <span className="text-sm">{photo2._count?.likes || photo2.vibeCount}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile VS */}
        <div className="md:hidden flex justify-center my-2">
          <div className="w-12 h-12 rounded-full bg-[#FFB800] flex items-center justify-center shadow-lg">
            <span className="text-[#2D2A26] font-black text-lg">VS</span>
          </div>
        </div>
      </div>

      {/* Skip Button */}
      {!winner && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={fetchBattle}
            disabled={voting}
            className="rounded-2xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Pular esta batalha
          </Button>
        </div>
      )}

      {/* Next Battle Button */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button onClick={fetchBattle} className="btn-upmm">
            <Sparkles className="w-4 h-4 mr-2" />
            Próxima Batalha
          </Button>
        </motion.div>
      )}
    </div>
  );
}
