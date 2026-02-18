"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Trophy,
  X,
  Loader2,
  Heart,
  MapPin,
  Sparkles,
  Crown,
  Flame,
  LogIn,
} from "lucide-react";

interface BattlePhoto {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  thumbnailUrl?: string | null;
  neighborhood?: string | null;
  location?: string | null;
  vibeCount: number;
  battleWins: number;
  communityGold: boolean;
  author: {
    id: string;
    name?: string | null;
    username?: string | null;
    avatar?: string | null;
  };
}

interface BattleModeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BattleMode({ open, onOpenChange }: BattleModeProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && session?.user?.id;

  const [photo1, setPhoto1] = useState<BattlePhoto | null>(null);
  const [photo2, setPhoto2] = useState<BattlePhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [winner, setWinner] = useState<BattlePhoto | null>(null);
  const [streak, setStreak] = useState(0);

  const fetchBattlePair = useCallback(async () => {
    setLoading(true);
    setWinner(null);
    try {
      const res = await fetch("/api/battle");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.photo1 && data.photo2) {
        setPhoto1(data.photo1);
        setPhoto2(data.photo2);
      } else {
        throw new Error("Invalid battle pair received");
      }
    } catch (error) {
      console.error("Error fetching battle pair:", error);
      // Show error message to user
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchBattlePair();
      setStreak(0);
    }
  }, [open, fetchBattlePair]);

  const handleVote = async (selectedId: string) => {
    if (!isLoggedIn || !photo1 || !photo2 || voting) return;

    setVoting(true);
    try {
      const res = await fetch("/api/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo1Id: photo1.id,
          photo2Id: photo2.id,
          winnerId: selectedId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        const winnerPhoto = selectedId === photo1.id ? photo1 : photo2;
        setWinner(winnerPhoto);
        setStreak((prev) => prev + 1);

        // Award points for winning
        if (winnerPhoto.id === selectedId) {
          // You could add points logic here
        }

        // Wait 2 seconds before showing next pair
        setTimeout(() => {
          fetchBattlePair();
        }, 2000);
      } else {
        // Handle error case
        console.error("Vote failed:", data.error);
      }
    } catch (error) {
      console.error("Error voting:", error);
      // Show error message to user
      // You could add a toast notification here
    } finally {
      setVoting(false);
    }
  };

  const handleSkip = () => {
    fetchBattlePair();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl rounded-3xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFB800] flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#2D2A26]" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black">
                  Batalha de Vibes
                </DialogTitle>
                <DialogDescription>
                  Escolha a foto com mais visão!
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {streak > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-[#FFB800]/10 rounded-full">
                  <Flame className="w-4 h-4 text-[#FFB800]" />
                  <span className="font-bold text-sm">{streak} seguidas</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {!isLoggedIn && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Login Necessário</h3>
            <p className="text-gray-500 mb-6">
              Faça login para participar da Batalha de Vibes e ganhar pontos!
            </p>
            <Button onClick={() => onOpenChange(false)} className="btn-upmm">
              Entendi
            </Button>
          </div>
        )}

        {isLoggedIn && loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
          </div>
        )}

        {isLoggedIn && !loading && photo1 && photo2 && (
          <div className="relative">
            {/* Winner Overlay */}
            <AnimatePresence>
              {winner && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center text-white"
                  >
                    <Crown className="w-16 h-16 mx-auto mb-4 text-[#FFB800]" />
                    <h3 className="text-2xl font-black mb-2">Vitória!</h3>
                    <p className="text-sm opacity-80">{winner.title}</p>
                    {winner.communityGold && (
                      <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-[#FFB800] text-[#2D2A26] rounded-full text-sm font-bold">
                        <Trophy className="w-4 h-4" />
                        Ouro Comunitário
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Battle Cards */}
            <div className="grid grid-cols-2 gap-0">
              {/* Photo 1 */}
              <motion.div
                whileHover={{ scale: winner ? 1 : 1.02 }}
                whileTap={{ scale: winner ? 1 : 0.98 }}
                onClick={() => handleVote(photo1.id)}
                className={`relative cursor-pointer group ${
                  voting ? "pointer-events-none" : ""
                }`}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={photo1.thumbnailUrl || photo1.imageUrl}
                    alt={photo1.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {photo1.communityGold && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-[#FFB800] text-[#2D2A26] rounded-full text-xs font-bold flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Ouro
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="font-bold text-white text-lg mb-1">{photo1.title}</h3>
                    {photo1.neighborhood && (
                      <p className="text-white/70 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {photo1.neighborhood}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-white/70 text-sm flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {photo1.vibeCount}
                      </span>
                      <span className="text-white/70 text-sm flex items-center gap-1">
                        <Trophy className="w-4 h-4" /> {photo1.battleWins} vitórias
                      </span>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1.1 }}
                      className="w-20 h-20 rounded-full bg-[#FFB800] flex items-center justify-center shadow-xl"
                    >
                      <Sparkles className="w-10 h-10 text-[#2D2A26]" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Photo 2 */}
              <motion.div
                whileHover={{ scale: winner ? 1 : 1.02 }}
                whileTap={{ scale: winner ? 1 : 0.98 }}
                onClick={() => handleVote(photo2.id)}
                className={`relative cursor-pointer group ${
                  voting ? "pointer-events-none" : ""
                }`}
              >
                <div className="aspect-square relative overflow-hidden border-l border-gray-200">
                  <img
                    src={photo2.thumbnailUrl || photo2.imageUrl}
                    alt={photo2.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {photo2.communityGold && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-[#FFB800] text-[#2D2A26] rounded-full text-xs font-bold flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Ouro
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="font-bold text-white text-lg mb-1">{photo2.title}</h3>
                    {photo2.neighborhood && (
                      <p className="text-white/70 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {photo2.neighborhood}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-white/70 text-sm flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {photo2.vibeCount}
                      </span>
                      <span className="text-white/70 text-sm flex items-center gap-1">
                        <Trophy className="w-4 h-4" /> {photo2.battleWins} vitórias
                      </span>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1.1 }}
                      className="w-20 h-20 rounded-full bg-[#FFB800] flex items-center justify-center shadow-xl"
                    >
                      <Sparkles className="w-10 h-10 text-[#2D2A26]" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Skip Button */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="bg-white/90 backdrop-blur-sm rounded-full px-6"
                disabled={voting}
              >
                Pular esta batalha
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
