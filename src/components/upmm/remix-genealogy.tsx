"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GitBranch,
  X,
  Loader2,
  Users,
  Heart,
  Sparkles,
  ArrowRight,
  Camera,
} from "lucide-react";

interface GenealogyNode {
  id: string;
  type: "photo" | "remix";
  title: string;
  imageUrl: string;
  author?: {
    id: string;
    name?: string | null;
    username?: string | null;
    avatar?: string | null;
  };
  creator?: {
    id: string;
    name?: string | null;
    username?: string | null;
    avatar?: string | null;
  };
  createdAt: string;
  vibeCount: number;
}

interface GenealogyTree {
  original: GenealogyNode;
  remixes: GenealogyNode[];
  stats: {
    totalRemixes: number;
    totalVibes: number;
    contributors: number;
  };
}

interface RemixGenealogyProps {
  photoId?: string;
  remixId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemixGenealogy({
  photoId,
  remixId,
  open,
  onOpenChange,
}: RemixGenealogyProps) {
  const [tree, setTree] = useState<GenealogyTree | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && (photoId || remixId)) {
      fetchGenealogy();
    }
  }, [open, photoId, remixId]);

  const fetchGenealogy = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (photoId) params.append("photoId", photoId);
      if (remixId) params.append("remixId", remixId);

      const res = await fetch(`/api/remixes/genealogy?${params}`);
      const data = await res.json();
      setTree(data);
    } catch (error) {
      console.error("Error fetching genealogy:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB800] flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-[#2D2A26]" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black">
                Árvore de Linhagem
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Veja como esta ideia evoluiu
              </p>
            </div>
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
          </div>
        )}

        {!loading && tree && (
          <div className="space-y-6 py-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#FFB800]/10 rounded-2xl p-4 text-center">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#FFB800]" />
                <p className="text-2xl font-black text-[#2D2A26]">
                  {tree.stats.totalRemixes}
                </p>
                <p className="text-xs text-gray-500">Remixes</p>
              </div>
              <div className="bg-[#FFB800]/10 rounded-2xl p-4 text-center">
                <Heart className="w-6 h-6 mx-auto mb-2 text-[#FFB800]" />
                <p className="text-2xl font-black text-[#2D2A26]">
                  {tree.stats.totalVibes}
                </p>
                <p className="text-xs text-gray-500">Vibes totais</p>
              </div>
              <div className="bg-[#FFB800]/10 rounded-2xl p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-[#FFB800]" />
                <p className="text-2xl font-black text-[#2D2A26]">
                  {tree.stats.contributors}
                </p>
                <p className="text-xs text-gray-500">Artistas</p>
              </div>
            </div>

            {/* Tree Visualization */}
            <div className="relative">
              {/* Original Photo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-[#FFB800]/20 to-[#FFB800]/5 rounded-2xl p-4 border-2 border-[#FFB800]">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={tree.original.imageUrl}
                        alt={tree.original.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Camera className="w-4 h-4 text-[#FFB800]" />
                        <span className="text-xs font-bold text-[#FFB800] uppercase">
                          Foto Original
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-[#2D2A26]">
                        {tree.original.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        {tree.original.author?.avatar ? (
                          <img
                            src={tree.original.author.avatar}
                            alt={tree.original.author.name || ""}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#FFB800] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-[#2D2A26]">
                              {(tree.original.author?.name || "U")[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-sm text-gray-600">
                          {tree.original.author?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-gray-400">
                        <Heart className="w-3 h-3" />
                        <span className="text-xs">{tree.original.vibeCount} vibes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connector */}
                {tree.remixes.length > 0 && (
                  <div className="flex justify-center my-4">
                    <div className="w-0.5 h-8 bg-[#FFB800]/30" />
                  </div>
                )}
              </motion.div>

              {/* Remixes */}
              {tree.remixes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <GitBranch className="w-4 h-4" />
                    <span>Ramificações ({tree.remixes.length})</span>
                  </div>

                  {tree.remixes.map((remix, index) => (
                    <motion.div
                      key={remix.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-8"
                    >
                      {/* Connector line */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                        <ArrowRight className="w-5 h-5 text-[#FFB800]" />
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 flex gap-3 hover:bg-[#FFB800]/5 transition-colors">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={remix.imageUrl}
                            alt={remix.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-[#2D2A26]">
                            {remix.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {remix.creator?.avatar ? (
                              <img
                                src={remix.creator.avatar}
                                alt={remix.creator.name || ""}
                                className="w-5 h-5 rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-[#FFB800]/50 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-[#2D2A26]">
                                  {(remix.creator?.name || "U")[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-gray-500">
                              {remix.creator?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-gray-400">
                            <Heart className="w-3 h-3" />
                            <span className="text-xs">{remix.vibeCount}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {tree.remixes.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhum remix ainda</p>
                  <p className="text-xs">Seja o primeiro a remixar!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
