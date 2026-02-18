"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Search,
  Globe,
  Folder,
  ExternalLink,
  LogIn,
  MapPin
} from "lucide-react";

const AVAILABLE_TAGS = [
  "Graffiti",
  "Arquitetura",
  "Rua",
  "Cotidiano",
  "Cores",
  "Texturas",
  "NaturezaUrbana",
  "Cultura",
  "Música",
  "Esporte",
];

// Bairros de Palmas-TO
const PALMAS_NEIGHBORHOODS = [
  { name: "Plano Diretor Norte", lat: -10.2123, lng: -48.3156 },
  { name: "Plano Diretor Sul", lat: -10.2678, lng: -48.3389 },
  { name: "Graciosa", lat: -10.2456, lng: -48.3123 },
  { name: "Taquaralto", lat: -10.3012, lng: -48.2890 },
  { name: "Taquarussu", lat: -10.2890, lng: -48.3012 },
  { name: "Jardim Aureny I", lat: -10.3456, lng: -48.2678 },
  { name: "Jardim Aureny II", lat: -10.3567, lng: -48.2567 },
  { name: "Jardim Aureny III", lat: -10.3678, lng: -48.2456 },
  { name: "Santa Fé", lat: -10.2789, lng: -48.3456 },
  { name: "Ponta Negra", lat: -10.3123, lng: -48.3567 },
  { name: "Arse 11", lat: -10.2012, lng: -48.3234 },
  { name: "Arse 21", lat: -10.2456, lng: -48.3289 },
  { name: "Lago Sul", lat: -10.2678, lng: -48.3567 },
  { name: "Beira Lago", lat: -10.2345, lng: -48.3012 },
  { name: "Centro Administrativo", lat: -10.1862, lng: -48.3347 },
];

// Quick search tags for periphery-related content
const QUICK_SEARCH_TAGS = [
  { label: "Periferia", query: "favela brazil" },
  { label: "Street Art", query: "street art graffiti" },
  { label: "Urbano", query: "urban street" },
  { label: "Arquitetura", query: "urban architecture" },
  { label: "Cores", query: "colorful street" },
  { label: "Cultura", query: "culture people" },
];

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  photographer: string;
  photographerUrl: string;
  avgColor: string;
  alt: string;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
  };
}

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UploadModal({ open, onOpenChange, onSuccess }: UploadModalProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && session?.user?.id;
  
  const [activeSource, setActiveSource] = useState<"local" | "online">("local");
  const [step, setStep] = useState<"guidelines" | "upload" | "details" | "uploading">("guidelines");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Geotagging - Palmas-TO
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [customLocation, setCustomLocation] = useState<string>("");

  // Pexels search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PexelsPhoto[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedPexelsPhoto, setSelectedPexelsPhoto] = useState<PexelsPhoto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Search Pexels images
  const searchPexels = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) return;
    
    setLoadingSearch(true);
    try {
      const res = await fetch(`/api/pexels?query=${encodeURIComponent(query)}&page=${page}&per_page=15`);
      const data = await res.json();
      
      if (page === 1) {
        setSearchResults(data.photos || []);
      } else {
        setSearchResults(prev => [...prev, ...(data.photos || [])]);
      }
      setTotalResults(data.totalResults || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error searching Pexels:", err);
    } finally {
      setLoadingSearch(false);
    }
  }, []);

  // Load more results
  const loadMore = useCallback(() => {
    if (!loadingSearch && searchResults.length < totalResults) {
      searchPexels(searchQuery, currentPage + 1);
    }
  }, [loadingSearch, searchResults.length, totalResults, searchQuery, currentPage, searchPexels]);

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    searchPexels(searchQuery, 1);
  };

  // Handle quick tag click
  const handleQuickTag = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    searchPexels(query, 1);
  };

  // Handle Pexels photo selection
  const handleSelectPexelsPhoto = async (photo: PexelsPhoto) => {
    setSelectedPexelsPhoto(photo);
    
    try {
      // Fetch the image and convert to base64
      const response = await fetch(photo.src.large);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setImageFile(null);
        setStep("details");
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      // Fallback: use the URL directly
      setImage(photo.src.large);
      setImageFile(null);
      setStep("details");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Por favor, selecione uma imagem válida");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 10MB");
        return;
      }
      
      setImageFile(file);
      setSelectedPexelsPhoto(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setStep("details");
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : prev.length < 5 
          ? [...prev, tag]
          : prev
    );
  };

  const handleUpload = async () => {
    if (!session?.user?.id || !image || !title || selectedTags.length < 3) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setStep("uploading");
    setError("");

    // Get neighborhood coordinates
    const neighborhoodData = PALMAS_NEIGHBORHOODS.find(n => n.name === selectedNeighborhood);

    try {
      let imageUrl = image;
      let thumbnailUrl = image;

      // If it's a local file, upload to Supabase Storage
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("fileName", title.replace(/\s+/g, "-").toLowerCase());

        const uploadRes = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "Erro ao fazer upload do arquivo");
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
        thumbnailUrl = uploadData.thumbnailUrl;
      }

      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          thumbnailUrl,
          tags: selectedTags,
          authorId: session.user.id,
          // Geotagging
          latitude: neighborhoodData?.lat,
          longitude: neighborhoodData?.lng,
          location: customLocation || neighborhoodData?.name,
          neighborhood: selectedNeighborhood,
          city: "Palmas",
          state: "Tocantins",
          country: "Brasil",
          // Source attribution
          source: selectedPexelsPhoto ? {
            type: "pexels",
            photographer: selectedPexelsPhoto.photographer,
            photographerUrl: selectedPexelsPhoto.photographerUrl,
          } : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar foto no banco de dados");
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || "Erro no upload");
      setStep("details");
    }
  };

  const handleClose = () => {
    setStep("guidelines");
    setActiveSource("local");
    setImage(null);
    setImageFile(null);
    setTitle("");
    setDescription("");
    setSelectedTags([]);
    setError("");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedPexelsPhoto(null);
    setCurrentPage(1);
    setSelectedNeighborhood("");
    setCustomLocation("");
    onOpenChange(false);
  };

  // Show login prompt if not logged in
  const showLoginPrompt = !isLoggedIn && step !== "guidelines";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-center">
            Nova Foto
          </DialogTitle>
          <DialogDescription className="text-center">
            Compartilhe uma imagem local ou busque online
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Guidelines */}
          {step === "guidelines" && (
            <motion.div
              key="guidelines"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 py-4"
            >
              <div className="bg-[#FFB800]/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-[#FFB800] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-[#2D2A26] mb-2">Diretrizes Éticas</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Antes de fazer upload, por favor, considere:
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-3 text-sm text-gray-600 ml-9">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Valorize a <strong>estética urbana</strong>: arquitetura, grafites, texturas, cores do cotidiano</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Respeite a <strong>privacidade</strong>: evite retratos de pessoas sem autorização</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Compartilhe com <strong>respeito</strong>: represente a periferia com dignidade</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Todas as imagens serão <strong>Creative Commons</strong></span>
                  </li>
                </ul>
              </div>

              {!isLoggedIn && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
                  <LogIn className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-700">Login Necessário</h4>
                    <p className="text-sm text-red-600">
                      Você precisa estar logado para fazer upload ou remixar imagens.
                    </p>
                  </div>
                </div>
              )}

              <Button 
                onClick={() => setStep("upload")}
                className="btn-upmm w-full"
              >
                Entendi, continuar
              </Button>
            </motion.div>
          )}

          {/* Step 2: Upload / Search */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 py-4"
            >
              {/* Source Tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                <button
                  onClick={() => setActiveSource("local")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeSource === "local"
                      ? "bg-white text-[#2D2A26] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  Arquivo Local
                </button>
                <button
                  onClick={() => setActiveSource("online")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeSource === "online"
                      ? "bg-white text-[#2D2A26] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Busca Online
                </button>
              </div>

              {/* Local Upload */}
              {activeSource === "local" && (
                <div
                  onClick={() => isLoggedIn && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center transition-all ${
                    isLoggedIn 
                      ? "cursor-pointer hover:border-[#FFB800] hover:bg-[#FFB800]/5" 
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={!isLoggedIn}
                  />
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FFB800]/10 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[#FFB800]" />
                  </div>
                  <p className="font-bold text-[#2D2A26] mb-1">
                    {isLoggedIn ? "Clique para selecionar uma imagem" : "Login necessário para upload"}
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG ou WEBP até 10MB
                  </p>
                </div>
              )}

              {/* Online Search */}
              {activeSource === "online" && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar imagens..."
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#FFB800] focus:ring-0 outline-none font-medium"
                    />
                    <Button 
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 btn-upmm rounded-xl"
                      disabled={!isLoggedIn}
                    >
                      Buscar
                    </Button>
                  </form>

                  {/* Quick Tags */}
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SEARCH_TAGS.map((tag) => (
                      <button
                        key={tag.label}
                        onClick={() => handleQuickTag(tag.query)}
                        disabled={!isLoggedIn}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          searchQuery === tag.query
                            ? "bg-[#FFB800] text-[#2D2A26]"
                            : isLoggedIn
                              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              : "bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>

                  {/* Login Warning */}
                  {!isLoggedIn && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                      <LogIn className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                      <p className="text-sm font-medium text-yellow-700">
                        Faça login para buscar e selecionar imagens
                      </p>
                    </div>
                  )}

                  {/* Search Results Grid */}
                  {isLoggedIn && searchResults.length > 0 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto rounded-xl">
                        {searchResults.map((photo) => (
                          <button
                            key={photo.id}
                            onClick={() => handleSelectPexelsPhoto(photo)}
                            className="relative aspect-square rounded-lg overflow-hidden group"
                            style={{ backgroundColor: photo.avgColor }}
                          >
                            <img
                              src={photo.src.small}
                              alt={photo.alt}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {searchResults.length < totalResults && (
                        <Button
                          variant="outline"
                          onClick={loadMore}
                          disabled={loadingSearch}
                          className="w-full rounded-xl"
                        >
                          {loadingSearch ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          Carregar mais
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Loading State */}
                  {loadingSearch && searchResults.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
                    </div>
                  )}

                  {/* Empty State */}
                  {isLoggedIn && !loadingSearch && searchQuery && searchResults.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Nenhuma imagem encontrada</p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </motion.div>
          )}

          {/* Step 3: Details */}
          {step === "details" && image && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 py-4"
            >
              {/* Login Required Warning */}
              {!isLoggedIn && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
                  <LogIn className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-700">Login Necessário</h4>
                    <p className="text-sm text-red-600">
                      Faça login para publicar esta imagem.
                    </p>
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
                <img 
                  src={image} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setStep("upload");
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Source Attribution */}
              {selectedPexelsPhoto && (
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Foto por</span>
                  <a 
                    href={selectedPexelsPhoto.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFB800] font-medium hover:underline"
                  >
                    {selectedPexelsPhoto.photographer}
                  </a>
                  <span className="text-gray-400">via Pexels</span>
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                    Título *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Dê um título para sua foto"
                    className="input-upmm"
                    maxLength={100}
                    disabled={!isLoggedIn}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                    Descrição
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Conte um pouco sobre a foto..."
                    className="input-upmm min-h-[80px] resize-none"
                    maxLength={500}
                    disabled={!isLoggedIn}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                    Tags (selecione 3-5) *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => isLoggedIn && toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-[#FFB800] text-[#2D2A26]"
                            : isLoggedIn
                              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              : "bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!isLoggedIn}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {selectedTags.length}/5 tags selecionadas
                  </p>
                </div>

                {/* Geotagging - Palmas-TO */}
                <div className="border-t border-gray-100 pt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 block flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FFB800]" />
                    Localização em Palmas
                  </label>
                  
                  <div className="space-y-3">
                    <div>
                      <select
                        value={selectedNeighborhood}
                        onChange={(e) => setSelectedNeighborhood(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FFB800] focus:ring-0 outline-none text-sm"
                        disabled={!isLoggedIn}
                      >
                        <option value="">Selecione a quebrada (bairro)</option>
                        {PALMAS_NEIGHBORHOODS.map((bairro) => (
                          <option key={bairro.name} value={bairro.name}>
                            {bairro.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedNeighborhood && (
                      <div>
                        <Input
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                          placeholder="Nome do local específico (ex: Praça dos Girassóis)"
                          className="input-upmm"
                          disabled={!isLoggedIn}
                        />
                      </div>
                    )}
                    
                    {selectedNeighborhood && (
                      <div className="bg-[#FFB800]/10 rounded-xl p-3 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#FFB800] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-[#2D2A26]">
                            {selectedNeighborhood}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Palmas, Tocantins
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setStep("upload")}
                  className="flex-1 rounded-2xl"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={!isLoggedIn || !title || selectedTags.length < 3}
                  className="btn-upmm flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Uploading */}
          {step === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <Loader2 className="w-12 h-12 mx-auto text-[#FFB800] animate-spin mb-4" />
              <p className="font-bold text-[#2D2A26]">Fazendo upload...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
