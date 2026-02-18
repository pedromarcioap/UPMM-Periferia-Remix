"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Sparkles, Globe, Eye } from "lucide-react";
import { Photo } from "@/store/useAppStore";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PhotoCardProps {
  photo: Photo;
  onRemix: () => void;
  onLike: () => void;
  onView: () => void;
}

export function PhotoCard({ photo, onRemix, onLike, onView }: PhotoCardProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(photo.vibeCount);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/likes?userId=${session.user.id}&photoId=${photo.id}`)
        .then(res => res.json())
        .then(data => setLiked(data.liked))
        .catch(console.error);
    }
  }, [session?.user?.id, photo.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user?.id || isLiking) return;
    
    setIsLiking(true);
    
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    
    // Show heart animation if liking (not unliking)
    if (!wasLiked) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          photoId: photo.id,
        }),
      });
      
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      onLike();
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const tags = photo.tags.split(",").filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card-upmm group cursor-pointer"
      onClick={onView}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={photo.thumbnailUrl || photo.imageUrl}
          alt={photo.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Heart Animation Overlay */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Heart 
                  className="w-20 h-20 text-red-500 fill-current drop-shadow-lg"
                  style={{ filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))" }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {photo.isGoldStandard && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-[#FFB800] text-[#2D2A26]">
              Padrão Ouro
            </span>
          )}
          {photo.isSynced && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-500 text-white flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Global
            </span>
          )}
        </div>

        {/* Remix Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemix();
          }}
          className="absolute bottom-3 right-3 px-4 py-2 rounded-2xl bg-[#FFB800] text-[#2D2A26] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Remixar
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-[#2D2A26] line-clamp-1">{photo.title}</h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="tag-upmm">#{tag.trim()}</span>
          ))}
        </div>

        {/* Author */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {photo.author.avatar ? (
              <img 
                src={photo.author.avatar} 
                alt={photo.author.name || ""} 
                className="w-6 h-6 rounded-lg object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-[#FFB800] flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#2D2A26]">
                  {(photo.author.name || "U")[0].toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs font-medium text-gray-600">
              {photo.author.name || "Anônimo"}
            </span>
          </div>
          
          <span className="text-[10px] text-gray-400">
            {formatDistanceToNow(new Date(photo.createdAt), { addSuffix: true, locale: ptBR })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 transition-colors ${
              liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
          >
            <motion.div
              animate={liked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-4 h-4 transition-transform ${liked ? "fill-current" : ""}`} />
            </motion.div>
            <span className="text-xs font-medium">{likeCount}</span>
          </motion.button>
          
          <div className="flex items-center gap-1.5 text-gray-400">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">{photo.commentCount}</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-400 ml-auto">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
