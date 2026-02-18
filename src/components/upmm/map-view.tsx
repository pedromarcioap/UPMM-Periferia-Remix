"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Heart, MessageCircle, Sparkles, X, Loader2 } from "lucide-react";
import { Photo } from "@/store/useAppStore";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

// Fix for default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Custom gold marker
const goldIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #FFB800, #FF8C00);
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapViewProps {
  photos: Photo[];
  onPhotoSelect?: (photo: Photo) => void;
  onRemix?: (photo: Photo) => void;
}

// Component to handle map center changes
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

// Helper to defer state updates
const deferSetState = <T,>(fn: (value: T) => void, value: T) => {
  setTimeout(() => fn(value), 0);
};

export function MapView({ photos, onPhotoSelect, onRemix }: MapViewProps) {
  const { data: session } = useSession();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationChecked, setLocationChecked] = useState(false);
  const likeStatusLoaded = useRef(false);

  // Default center: Palmas-TO, Brazil
  const defaultCenter: [number, number] = [-10.2491, -48.3243];

  // Filter photos with location
  const photosWithLocation = useMemo(() => {
    return photos.filter(
      (p) => p.latitude !== undefined && p.longitude !== undefined
    ) as (Photo & { latitude: number; longitude: number })[];
  }, [photos]);

  // Get user location
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      deferSetState(setLocationChecked, true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationChecked(true);
      },
      () => {
        setLocationChecked(true);
      },
      { timeout: 5000 }
    );
  }, []);

  // Initialize like counts from photos
  const photoIdsKey = useMemo(() => photosWithLocation.map(p => p.id).join(","), [photosWithLocation]);
  
  useEffect(() => {
    const counts: Record<string, number> = {};
    photosWithLocation.forEach((photo) => {
      counts[photo.id] = photo.vibeCount;
    });
    deferSetState(setLikeCounts, counts);
  }, [photoIdsKey]);

  // Load like status once
  useEffect(() => {
    if (likeStatusLoaded.current) return;
    if (!session?.user?.id || photosWithLocation.length === 0) return;
    
    likeStatusLoaded.current = true;
    
    const loadLikeStatus = async () => {
      for (const photo of photosWithLocation) {
        try {
          const res = await fetch(`/api/likes?userId=${session.user.id}&photoId=${photo.id}`);
          const data = await res.json();
          setLiked((prev) => ({ ...prev, [photo.id]: data.liked }));
        } catch (e) {
          console.error("Error loading like status:", e);
        }
      }
    };
    loadLikeStatus();
  }, [session?.user?.id, photoIdsKey]);

  const handleLike = useCallback(async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user?.id) return;

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          photoId,
        }),
      });

      const data = await res.json();
      setLiked((prev) => ({ ...prev, [photoId]: data.liked }));
      setLikeCounts((prev) => ({
        ...prev,
        [photoId]: data.liked ? (prev[photoId] || 0) + 1 : Math.max(0, (prev[photoId] || 1) - 1),
      }));
    } catch (e) {
      console.error("Error toggling like:", e);
    }
  }, [session]);

  const mapCenter = userLocation || defaultCenter;

  if (!locationChecked) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-2xl">
        <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div className="text-center p-1">
                  <strong>Você está aqui</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {photosWithLocation.map((photo) => (
            <Marker
              key={photo.id}
              position={[photo.latitude, photo.longitude]}
              icon={goldIcon}
              eventHandlers={{
                click: () => setSelectedPhoto(photo),
              }}
            >
              <Popup>
                <div className="w-48">
                  <img
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <h4 className="font-bold text-sm truncate">{photo.title}</h4>
                  <p className="text-xs text-gray-500">por {photo.author.name || "Anônimo"}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={(e) => handleLike(photo.id, e)}
                      className={`flex items-center gap-1 ${
                        liked[photo.id] ? "text-red-500" : "text-gray-400"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${liked[photo.id] ? "fill-current" : ""}`}
                      />
                      <span className="text-xs">{likeCounts[photo.id] || 0}</span>
                    </button>
                    <span className="text-xs text-gray-400">
                      <MessageCircle className="w-4 h-4 inline" />
                      {" "}{photo.commentCount}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Photo Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4 space-y-3">
                <h3 className="text-xl font-bold">{selectedPhoto.title}</h3>
                <p className="text-gray-600">{selectedPhoto.description}</p>
                <div className="flex items-center gap-2">
                  {selectedPhoto.tags.split(",").map((tag, i) => (
                    <span key={i} className="tag-upmm">#{tag.trim()}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleLike(selectedPhoto.id, e)}
                      className={`flex items-center gap-1.5 ${
                        liked[selectedPhoto.id] ? "text-red-500" : "text-gray-400"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${liked[selectedPhoto.id] ? "fill-current" : ""}`}
                      />
                      <span>{likeCounts[selectedPhoto.id] || 0}</span>
                    </button>
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <MessageCircle className="w-5 h-5" />
                      {selectedPhoto.commentCount}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      onRemix?.(selectedPhoto);
                      setSelectedPhoto(null);
                    }}
                    className="btn-upmm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Remixar
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg z-10">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-gradient-to-br from-[#FFB800] to-[#FF8C00] rounded-full" />
          <span className="font-medium">Fotos na região</span>
        </div>
      </div>
    </div>
  );
}
