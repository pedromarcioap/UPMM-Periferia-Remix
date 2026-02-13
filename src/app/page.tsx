"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoCard } from "@/components/upmm/photo-card";
import { ImageEditor } from "@/components/upmm/image-editor";
import { UploadModal } from "@/components/upmm/upload-modal";
import { UserProfile } from "@/components/upmm/user-profile";
import { AdminDashboard } from "@/components/upmm/admin-dashboard";
import { Header } from "@/components/upmm/header";
import { Footer } from "@/components/upmm/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Camera, 
  TrendingUp, 
  Filter, 
  Search,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useAppStore, Photo, Remix } from "@/store/useAppStore";

const TAGS = [
  "Todas",
  "Graffiti",
  "Arquitetura",
  "Rua",
  "Cotidiano",
  "Cores",
  "Texturas",
  "NaturezaUrbana",
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const {
    activeTab,
    setActiveTab,
    photos,
    setPhotos,
    editingPhoto,
    setEditingPhoto,
    sortBy,
    setSortBy,
    selectedTag,
    setSelectedTag,
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch photos
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: "all",
        sort: sortBy,
        ...(selectedTag && selectedTag !== "Todas" && { tag: selectedTag }),
      });
      
      const res = await fetch(`/api/photos?${params}`);
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, selectedTag, setPhotos]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Handle active tab changes
  useEffect(() => {
    if (activeTab === "upload") {
      setShowUpload(true);
    } else if (activeTab === "profile") {
      setShowProfile(true);
    } else if (activeTab === "admin") {
      setShowAdmin(true);
    }
  }, [activeTab]);

  // Handle remix save
  const handleRemixSave = async (imageUrl: string) => {
    if (!editingPhoto || !session?.user?.id) return;
    
    try {
      const res = await fetch("/api/remixes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          originalPhotoId: editingPhoto.id,
          creatorId: session.user.id,
          title: `Remix de ${editingPhoto.title}`,
        }),
      });
      
      if (res.ok) {
        setShowEditor(false);
        setEditingPhoto(null);
        fetchPhotos();
      }
    } catch (error) {
      console.error("Error saving remix:", error);
    }
  };

  const handleUploadSuccess = () => {
    fetchPhotos();
  };

  const filteredPhotos = photos.filter(photo => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      photo.title.toLowerCase().includes(query) ||
      photo.description?.toLowerCase().includes(query) ||
      photo.tags.toLowerCase().includes(query) ||
      photo.author.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2D2A26] via-[#2D2A26] to-[#1a1918] text-white py-16 md:py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFB800' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              <span className="text-gradient-upmm">UPMM</span>
              <br />
              <span className="text-2xl md:text-3xl font-bold">Galeria Comunitária</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Explore a estética visual das periferias brasileiras. Faça upload, remixe e compartilhe.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => setShowUpload(true)}
                className="btn-upmm text-lg px-8"
              >
                <Camera className="w-5 h-5 mr-2" />
                Upload
              </Button>
              <Button
                variant="outline"
                className="btn-upmm-outline text-lg px-8 border-white text-white hover:bg-white hover:text-[#2D2A26]"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Remixar
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          {/* Tag Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {TAGS.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag === "Todas" ? null : tag)}
                className={`rounded-xl whitespace-nowrap ${
                  selectedTag === tag 
                    ? "bg-[#FFB800] text-[#2D2A26] hover:bg-[#E5A600]" 
                    : ""
                }`}
              >
                {tag === "Todas" ? "Tudo" : `#${tag}`}
              </Button>
            ))}
          </div>

          {/* Sort & Search */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 outline-none text-sm"
              />
            </div>
            
            <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as "recent" | "popular")}>
              <TabsList className="bg-gray-100 rounded-xl p-1">
                <TabsTrigger value="recent" className="rounded-lg text-xs px-3">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Recentes
                </TabsTrigger>
                <TabsTrigger value="popular" className="rounded-lg text-xs px-3">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Populares
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Photo Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhuma foto encontrada</h3>
            <p className="text-gray-400 mb-6">Seja o primeiro a compartilhar!</p>
            <Button onClick={() => setShowUpload(true)} className="btn-upmm">
              <Camera className="w-4 h-4 mr-2" />
              Fazer Upload
            </Button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PhotoCard
                    photo={photo}
                    onRemix={() => {
                      setEditingPhoto(photo);
                      setShowEditor(true);
                    }}
                    onLike={() => {}}
                    onView={() => {}}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Load More */}
        {filteredPhotos.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              onClick={fetchPhotos}
              className="rounded-2xl px-8"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Carregar mais
            </Button>
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <ImageEditor
        photo={editingPhoto}
        open={showEditor}
        onOpenChange={(open) => {
          setShowEditor(open);
          if (!open) setEditingPhoto(null);
        }}
        onSave={handleRemixSave}
      />

      <UploadModal
        open={showUpload}
        onOpenChange={(open) => {
          setShowUpload(open);
          if (!open) setActiveTab("feed");
        }}
        onSuccess={handleUploadSuccess}
      />

      <UserProfile
        open={showProfile}
        onOpenChange={(open) => {
          setShowProfile(open);
          if (!open) setActiveTab("feed");
        }}
      />

      <AdminDashboard
        open={showAdmin}
        onOpenChange={(open) => {
          setShowAdmin(open);
          if (!open) setActiveTab("feed");
        }}
      />
    </div>
  );
}
