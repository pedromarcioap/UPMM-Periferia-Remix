"use client";

import { useState, useRef } from "react";
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
  Loader2
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

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UploadModal({ open, onOpenChange, onSuccess }: UploadModalProps) {
  const { data: session } = useSession();
  const [step, setStep] = useState<"guidelines" | "upload" | "details" | "uploading">("guidelines");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    try {
      // Convert base64 to blob for upload
      const response = await fetch(image);
      const blob = await response.blob();
      
      // For MVP, we'll use the base64 image directly
      // In production, you'd upload to a CDN/storage service
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          imageUrl: image,
          thumbnailUrl: image,
          tags: selectedTags,
          authorId: session.user.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao fazer upload");
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
    setImage(null);
    setImageFile(null);
    setTitle("");
    setDescription("");
    setSelectedTags([]);
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-center">
            Nova Foto
          </DialogTitle>
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

              <Button 
                onClick={() => setStep("upload")}
                className="btn-upmm w-full"
              >
                Entendi, continuar
              </Button>
            </motion.div>
          )}

          {/* Step 2: Upload */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 py-4"
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-[#FFB800] hover:bg-[#FFB800]/5 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FFB800]/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-[#FFB800]" />
                </div>
                <p className="font-bold text-[#2D2A26] mb-1">
                  Clique para selecionar uma imagem
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG ou WEBP até 10MB
                </p>
              </div>

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
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-[#FFB800] text-[#2D2A26]"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {selectedTags.length}/5 tags selecionadas
                  </p>
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
                  disabled={!title || selectedTags.length < 3}
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
