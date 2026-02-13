"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  X, 
  Loader2, 
  Camera,
  Eye,
  Heart
} from "lucide-react";

// Dynamically import Leaflet components (no SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface Photo {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  thumbnailUrl?: string | null;
  tags: string;
  latitude?: number | null;
  longitude?: number | null;
  location?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  vibeCount: number;
  author: {
    id: string;
    name?: string | null;
    username?: string | null;
    avatar?: string | null;
  };
}

interface MapViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Palmas-TO center coordinates
const PALMAS_CENTER: [number, number] = [-10.2491, -48.3243];

export function MapView({ open, onOpenChange }: MapViewProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPhotos();
      // Dynamically import Leaflet CSS
      import("leaflet/dist/leaflet.css");
      
      // Fix Leaflet default marker icon
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
        setMapReady(true);
      });
    }
  }, [open]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/photos?limit=100");
      const data = await res.json();
      // Filter only photos with location
      const geoPhotos = (data.photos || []).filter(
        (p: Photo) => p.latitude && p.longitude
      );
      setPhotos(geoPhotos);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  // Create custom marker icon with UPMM colors
  const createCustomIcon = useMemo(() => {
    return () => {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const L = require("leaflet");
        return L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: 36px;
              height: 36px;
              background: #FFB800;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid #2D2A26;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              <div style="transform: rotate(45deg); color: #2D2A26; font-size: 14px;">
                📍
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });
      }
      return null;
    };
  }, []);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="absolute inset-4 md:inset-8 bg-white rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFB800] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#2D2A26]" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-[#2D2A26]">Mapa da Visão</h2>
                  <p className="text-xs text-gray-500">Explore {photos.length} pontos em Palmas, TO</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Map */}
          <div className="w-full h-full pt-16">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
              </div>
            ) : mapReady ? (
              <MapContainer
                center={PALMAS_CENTER}
                zoom={12}
                className="w-full h-full"
                style={{ zIndex: 1 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {photos.map((photo) => (
                  <Marker
                    key={photo.id}
                    position={[photo.latitude!, photo.longitude!]}
                    icon={createCustomIcon()}
                    eventHandlers={{
                      click: () => handleMarkerClick(photo),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <img
                          src={photo.thumbnailUrl || photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <h3 className="font-bold text-sm text-[#2D2A26]">{photo.title}</h3>
                        <p className="text-xs text-gray-500">{photo.neighborhood}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {photo.vibeCount}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Carregando mapa...</p>
              </div>
            )}
          </div>

          {/* Photo Details Sidebar */}
          <AnimatePresence>
            {selectedPhoto && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="absolute top-20 right-4 bottom-4 w-80 bg-white rounded-2xl shadow-xl overflow-hidden z-30"
              >
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg text-[#2D2A26]">{selectedPhoto.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedPhoto.description}</p>
                  
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <MapPin className="w-4 h-4 text-[#FFB800]" />
                    <span className="text-gray-600">
                      {selectedPhoto.location}, {selectedPhoto.neighborhood}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {selectedPhoto.author.avatar ? (
                      <img
                        src={selectedPhoto.author.avatar}
                        alt={selectedPhoto.author.name || ""}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#FFB800] flex items-center justify-center">
                        <span className="text-xs font-bold text-[#2D2A26]">
                          {(selectedPhoto.author.name || "U")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium">{selectedPhoto.author.name}</span>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{selectedPhoto.vibeCount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Ver detalhes</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-2 right-2 bg-white/80 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            <div className="text-xs font-bold uppercase text-gray-500 mb-2">Quebradas</div>
            <div className="flex flex-wrap gap-2">
              {["Plano Diretor Norte", "Graciosa", "Taquaralto", "Aureny"].map((bairro) => (
                <span
                  key={bairro}
                  className="px-2 py-1 bg-[#FFB800]/10 text-[#2D2A26] text-xs rounded-full font-medium"
                >
                  {bairro}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
