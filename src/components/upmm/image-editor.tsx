"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  X, 
  Download, 
  Save, 
  RotateCcw, 
  Type, 
  Sticker, 
  Palette,
  Sparkles,
  Sun,
  Contrast,
  Droplets,
  Loader2
} from "lucide-react";
import { Photo } from "@/store/useAppStore";

const FILTERS = [
  { id: "none", name: "Original", filter: "none" },
  { id: "fim-de-tarde", name: "Fim de Tarde", filter: "sepia(0.2) saturate(1.3) brightness(1.05) contrast(1.1)" },
  { id: "concreto", name: "Concreto", filter: "grayscale(0.3) contrast(1.2) brightness(0.95)" },
  { id: "neon", name: "Neon", filter: "saturate(1.5) contrast(1.2) brightness(1.1)" },
  { id: "vibrante", name: "Vibrante", filter: "saturate(1.4) contrast(1.15) brightness(1.05)" },
  { id: "vintage", name: "Vintage", filter: "sepia(0.4) saturate(0.8) contrast(1.1) brightness(0.95)" },
];

const STICKERS = [
  { id: "s1", name: "Tag 1", svg: `<svg viewBox="0 0 100 50" fill="none"><rect width="100" height="50" rx="8" fill="#FFB800"/><text x="50" y="32" text-anchor="middle" fill="#2D2A26" font-size="16" font-weight="bold">UPMM</text></svg>` },
  { id: "s2", name: "Glitch 1", svg: `<svg viewBox="0 0 120 60" fill="none"><rect x="5" y="5" width="110" height="50" fill="#00ff00" opacity="0.3"/><rect x="8" y="8" width="104" height="44" fill="#ff00ff" opacity="0.3"/><rect x="3" y="3" width="114" height="54" fill="none" stroke="#00ffff" stroke-width="2"/></svg>` },
  { id: "s3", name: "Triangle", svg: `<svg viewBox="0 0 100 100" fill="none"><polygon points="50,10 90,90 10,90" fill="#FFB800" opacity="0.8"/></svg>` },
  { id: "s4", name: "Circle", svg: `<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="none" stroke="#FFB800" stroke-width="4"/></svg>` },
  { id: "s5", name: "Lines", svg: `<svg viewBox="0 0 100 100" fill="none"><line x1="10" y1="30" x2="90" y2="30" stroke="#FFB800" stroke-width="3"/><line x1="10" y1="50" x2="90" y2="50" stroke="#FFB800" stroke-width="3"/><line x1="10" y1="70" x2="90" y2="70" stroke="#FFB800" stroke-width="3"/></svg>` },
  { id: "s6", name: "Star", svg: `<svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#FFB800"/></svg>` },
  { id: "s7", name: "Arrow", svg: `<svg viewBox="0 0 100 60" fill="none"><path d="M10 30 L70 30 L70 20 L90 30 L70 40 L70 30" fill="#FFB800"/></svg>` },
  { id: "s8", name: "Frame", svg: `<svg viewBox="0 0 100 100" fill="none"><rect x="10" y="10" width="80" height="80" fill="none" stroke="#FFB800" stroke-width="4"/><rect x="20" y="20" width="60" height="60" fill="none" stroke="#FFB800" stroke-width="2"/></svg>` },
];

const FONTS = ["Montserrat", "Impact", "Georgia", "Courier New"];

interface ImageEditorProps {
  photo: Photo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (imageUrl: string) => void;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

interface StickerElement {
  id: string;
  name?: string;
  svg: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageEditor({ photo, open, onOpenChange, onSave }: ImageEditorProps) {
  const { data: session } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [activeFilter, setActiveFilter] = useState("none");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [stickers, setStickers] = useState<StickerElement[]>([]);
  const [newText, setNewText] = useState("");
  const [textColor, setTextColor] = useState("#FFB800");
  const [textFont, setTextFont] = useState("Montserrat");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("filters");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });

  const currentFilter = FILTERS.find(f => f.id === activeFilter);

  // Reset when photo changes
  useEffect(() => {
    if (photo) {
      setActiveFilter("none");
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setTextElements([]);
      setStickers([]);
      setSelectedElement(null);
    }
  }, [photo?.id]);

  // Handle canvas resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = Math.min(width, 500);
        setCanvasSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [open]);

  const addText = () => {
    if (!newText.trim()) return;
    
    const element: TextElement = {
      id: `text-${Date.now()}`,
      text: newText,
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2,
      fontSize: 24,
      color: textColor,
      fontFamily: textFont,
    };
    
    setTextElements([...textElements, element]);
    setNewText("");
    setSelectedElement(element.id);
  };

  const addSticker = (sticker: typeof STICKERS[0]) => {
    const element: StickerElement = {
      id: `sticker-${Date.now()}`,
      svg: sticker.svg,
      x: canvasSize.width / 2 - 25,
      y: canvasSize.height / 2 - 25,
      width: 50,
      height: 50,
    };
    
    setStickers([...stickers, element]);
    setSelectedElement(element.id);
  };

  const removeElement = (id: string) => {
    setTextElements(textElements.filter(t => t.id !== id));
    setStickers(stickers.filter(s => s.id !== id));
    setSelectedElement(null);
  };

  const resetEditor = () => {
    setActiveFilter("none");
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setTextElements([]);
    setStickers([]);
    setSelectedElement(null);
  };

  const handleSave = async () => {
    if (!photo || !canvasRef.current || !session?.user?.id) return;
    
    setSaving(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Create final canvas at original image size
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = async () => {
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = img.width;
        finalCanvas.height = img.height;
        const finalCtx = finalCanvas.getContext("2d");
        if (!finalCtx) return;
        
        // Apply filter
        const filter = currentFilter?.filter || "none";
        if (filter !== "none") {
          finalCtx.filter = `brightness(${brightness/100}) contrast(${contrast/100}) saturate(${saturation/100}) ${filter}`;
        } else {
          finalCtx.filter = `brightness(${brightness/100}) contrast(${contrast/100}) saturate(${saturation/100})`;
        }
        
        // Draw image
        finalCtx.drawImage(img, 0, 0);
        finalCtx.filter = "none";
        
        // Draw text elements (scaled)
        const scaleX = img.width / canvasSize.width;
        const scaleY = img.height / canvasSize.height;
        
        textElements.forEach(el => {
          finalCtx.font = `bold ${el.fontSize * scaleX}px ${el.fontFamily}`;
          finalCtx.fillStyle = el.color;
          finalCtx.fillText(el.text, el.x * scaleX, el.y * scaleY);
        });
        
        // Get final image
        const finalImageUrl = finalCanvas.toDataURL("image/jpeg", 0.9);
        onSave(finalImageUrl);
      };
      
      img.src = photo.imageUrl;
    } catch (error) {
      console.error("Error saving remix:", error);
    } finally {
      setSaving(false);
    }
  };

  const getFilterStyle = () => {
    const filter = currentFilter?.filter || "";
    return `brightness(${brightness/100}) contrast(${contrast/100}) saturate(${saturation/100}) ${filter}`;
  };

  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl rounded-3xl h-[90vh] max-h-[900px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-black uppercase">
                Estúdio Criativo
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Remixando: {photo.title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetEditor}
                className="rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Resetar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="btn-upmm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                Salvar Remix
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Canvas Area */}
          <div 
            ref={containerRef}
            className="flex-1 bg-gray-900 flex items-center justify-center p-4 overflow-hidden"
          >
            <div 
              className="relative"
              style={{ 
                width: canvasSize.width, 
                height: canvasSize.height 
              }}
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ filter: getFilterStyle() }}
              />
              
              {/* Text Overlays */}
              {textElements.map((el) => (
                <div
                  key={el.id}
                  className={`absolute cursor-move select-none ${
                    selectedElement === el.id ? "ring-2 ring-[#FFB800]" : ""
                  }`}
                  style={{
                    left: el.x,
                    top: el.y,
                    fontSize: el.fontSize,
                    fontFamily: el.fontFamily,
                    color: el.color,
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(el.id);
                  }}
                >
                  {el.text}
                </div>
              ))}
              
              {/* Sticker Overlays */}
              {stickers.map((st) => (
                <div
                  key={st.id}
                  className={`absolute cursor-move ${
                    selectedElement === st.id ? "ring-2 ring-[#FFB800]" : ""
                  }`}
                  style={{
                    left: st.x,
                    top: st.y,
                    width: st.width,
                    height: st.height,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(st.id);
                  }}
                  dangerouslySetInnerHTML={{ __html: st.svg }}
                />
              ))}
            </div>
          </div>

          {/* Tools Panel */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 bg-[#FDFCFB] flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 p-2 bg-white">
                <TabsTrigger value="filters" className="rounded-xl text-xs">
                  <Palette className="w-4 h-4 mr-1" />
                  Filtros
                </TabsTrigger>
                <TabsTrigger value="text" className="rounded-xl text-xs">
                  <Type className="w-4 h-4 mr-1" />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="stickers" className="rounded-xl text-xs">
                  <Sticker className="w-4 h-4 mr-1" />
                  Stickers
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-4">
                {/* Filters Tab */}
                <TabsContent value="filters" className="space-y-6 mt-0">
                  {/* Preset Filters */}
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                      Presets Urbanos
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {FILTERS.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setActiveFilter(filter.id)}
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            activeFilter === filter.id 
                              ? "border-[#FFB800] ring-2 ring-[#FFB800]/20" 
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={photo.thumbnailUrl || photo.imageUrl}
                            alt={filter.name}
                            className="w-full h-full object-cover"
                            style={{ filter: filter.filter }}
                          />
                          <p className="text-[9px] font-bold p-1 bg-white">{filter.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Adjustments */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Ajustes
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium flex items-center gap-2">
                            <Sun className="w-4 h-4" /> Brilho
                          </label>
                          <span className="text-xs text-gray-500">{brightness}%</span>
                        </div>
                        <Slider
                          value={[brightness]}
                          onValueChange={([v]) => setBrightness(v)}
                          min={50}
                          max={150}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium flex items-center gap-2">
                            <Contrast className="w-4 h-4" /> Contraste
                          </label>
                          <span className="text-xs text-gray-500">{contrast}%</span>
                        </div>
                        <Slider
                          value={[contrast]}
                          onValueChange={([v]) => setContrast(v)}
                          min={50}
                          max={150}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium flex items-center gap-2">
                            <Droplets className="w-4 h-4" /> Saturação
                          </label>
                          <span className="text-xs text-gray-500">{saturation}%</span>
                        </div>
                        <Slider
                          value={[saturation]}
                          onValueChange={([v]) => setSaturation(v)}
                          min={0}
                          max={200}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Text Tab */}
                <TabsContent value="text" className="space-y-4 mt-0">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                        Texto
                      </label>
                      <Input
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Digite seu texto..."
                        className="input-upmm"
                        onKeyDown={(e) => e.key === "Enter" && addText()}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                          Cor
                        </label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full h-10 rounded-xl cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                          Fonte
                        </label>
                        <select
                          value={textFont}
                          onChange={(e) => setTextFont(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm"
                        >
                          {FONTS.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <Button onClick={addText} className="btn-upmm w-full">
                      <Type className="w-4 h-4 mr-2" />
                      Adicionar Texto
                    </Button>
                  </div>

                  {/* Added Texts */}
                  {textElements.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Textos Adicionados
                      </h4>
                      {textElements.map((el) => (
                        <div 
                          key={el.id}
                          className={`flex items-center justify-between p-2 rounded-xl ${
                            selectedElement === el.id ? "bg-[#FFB800]/10" : "bg-gray-50"
                          }`}
                        >
                          <span className="text-sm truncate flex-1">{el.text}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeElement(el.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Stickers Tab */}
                <TabsContent value="stickers" className="space-y-4 mt-0">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Biblioteca de Stickers
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {STICKERS.map((sticker) => (
                      <button
                        key={sticker.id}
                        onClick={() => addSticker(sticker)}
                        className="aspect-square rounded-xl bg-gray-50 hover:bg-[#FFB800]/10 border border-gray-200 hover:border-[#FFB800] transition-all p-2"
                        title={sticker.name}
                        dangerouslySetInnerHTML={{ __html: sticker.svg }}
                      />
                    ))}
                  </div>

                  {/* Added Stickers */}
                  {stickers.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Stickers Adicionados
                      </h4>
                      {stickers.map((st) => (
                        <div 
                          key={st.id}
                          className={`flex items-center justify-between p-2 rounded-xl ${
                            selectedElement === st.id ? "bg-[#FFB800]/10" : "bg-gray-50"
                          }`}
                        >
                          <span className="text-sm">{st.name || "Sticker"}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeElement(st.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
        
        {/* Hidden canvas for export */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
