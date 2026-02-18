"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Star, 
  Globe, 
  Trash2, 
  Users, 
  Camera, 
  Sparkles, 
  MessageCircle,
  TrendingUp,
  Eye
} from "lucide-react";

interface AdminDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Stats {
  totalUsers: number;
  totalPhotos: number;
  totalRemixes: number;
  totalComments: number;
  goldPhotos: number;
  syncedPhotos: number;
}

interface Photo {
  id: string;
  title: string;
  imageUrl: string;
  vibeCount: number;
  isGoldStandard: boolean;
  isSynced: boolean;
  author: { id: string; name?: string; username?: string };
  _count: { likes: number; comments: number; remixes: number };
}

export function AdminDashboard({ open, onOpenChange }: AdminDashboardProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [topPhotos, setTopPhotos] = useState<Photo[]>([]);
  const [goldPhotos, setGoldPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (open && session?.user?.role === "ADMIN") {
      fetchData();
    }
  }, [open, session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, goldRes] = await Promise.all([
        fetch("/api/admin?action=stats"),
        fetch("/api/admin?action=gold"),
      ]);
      
      const statsData = await statsRes.json();
      const goldData = await goldRes.json();
      
      setStats(statsData.stats);
      setTopPhotos(statsData.topPhotos || []);
      setGoldPhotos(goldData || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSetGold = async (photoId: string, isGold: boolean) => {
    if (!session?.user?.id) return;
    
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: isGold ? "setGold" : "removeGold",
        photoId,
        userId: session.user.id,
      }),
    });
    
    fetchData();
  };

  const handleSetSynced = async (photoId: string) => {
    if (!session?.user?.id) return;
    
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "setSynced",
        photoId,
        userId: session.user.id,
      }),
    });
    
    fetchData();
  };

  const handleDelete = async (photoId: string) => {
    if (!session?.user?.id || !confirm("Tem certeza que deseja excluir esta foto?")) return;
    
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deletePhoto",
        photoId,
        userId: session.user.id,
      }),
    });
    
    fetchData();
  };

  if (session?.user?.role !== "ADMIN") return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl rounded-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D2A26] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#FFB800]" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase">
                Dashboard Admin
              </DialogTitle>
              <p className="text-sm text-gray-500">Curadoria e gestão de conteúdo</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl mb-6">
              <TabsTrigger value="overview" className="rounded-xl">Visão Geral</TabsTrigger>
              <TabsTrigger value="curate" className="rounded-xl">Curadoria</TabsTrigger>
              <TabsTrigger value="synced" className="rounded-xl">Sincronizados</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <AdminStatCard 
                    icon={<Users className="w-6 h-6" />}
                    label="Usuários"
                    value={stats.totalUsers}
                    color="text-blue-500"
                  />
                  <AdminStatCard 
                    icon={<Camera className="w-6 h-6" />}
                    label="Fotos"
                    value={stats.totalPhotos}
                    color="text-[#FFB800]"
                  />
                  <AdminStatCard 
                    icon={<Sparkles className="w-6 h-6" />}
                    label="Remixes"
                    value={stats.totalRemixes}
                    color="text-purple-500"
                  />
                  <AdminStatCard 
                    icon={<MessageCircle className="w-6 h-6" />}
                    label="Comentários"
                    value={stats.totalComments}
                  />
                  <AdminStatCard 
                    icon={<Star className="w-6 h-6" />}
                    label="Padrão Ouro"
                    value={stats.goldPhotos}
                    color="text-amber-500"
                  />
                  <AdminStatCard 
                    icon={<Globe className="w-6 h-6" />}
                    label="Sincronizados"
                    value={stats.syncedPhotos}
                    color="text-green-500"
                  />
                </div>
              )}

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                  Top Fotos por Vibe
                </h3>
                <div className="space-y-3">
                  {topPhotos.slice(0, 5).map((photo, i) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100"
                    >
                      <span className="text-lg font-black text-gray-300 w-6">#{i + 1}</span>
                      <img 
                        src={photo.imageUrl} 
                        alt={photo.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#2D2A26] truncate">{photo.title}</p>
                        <p className="text-xs text-gray-500">por {photo.author.name || "Anônimo"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#FFB800]">{photo.vibeCount} vibes</p>
                        <p className="text-xs text-gray-500">{photo._count.remixes} remixes</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Curate Tab */}
            <TabsContent value="curate" className="space-y-4">
              <p className="text-sm text-gray-500">
                Selecione fotos para marcar como "Padrão Ouro" - destacando o melhor conteúdo da comunidade.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {topPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-colors ${
                      photo.isGoldStandard 
                        ? "border-[#FFB800]" 
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.title}
                      className="w-full aspect-square object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm font-bold truncate">{photo.title}</p>
                        <p className="text-white/70 text-xs">{photo.vibeCount} vibes</p>
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1">
                      {photo.isGoldStandard && (
                        <Badge className="bg-[#FFB800] text-[#2D2A26] text-[10px]">OURO</Badge>
                      )}
                    </div>

                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant={photo.isGoldStandard ? "default" : "outline"}
                        className={`h-8 w-8 rounded-lg ${
                          photo.isGoldStandard 
                            ? "bg-[#FFB800] text-[#2D2A26]" 
                            : "bg-white/90 hover:bg-[#FFB800] hover:text-[#2D2A26]"
                        }`}
                        onClick={() => handleSetGold(photo.id, !photo.isGoldStandard)}
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                      {photo.isGoldStandard && !photo.isSynced && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-lg bg-white/90 hover:bg-green-500 hover:text-white"
                          onClick={() => handleSetSynced(photo.id)}
                        >
                          <Globe className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Synced Tab */}
            <TabsContent value="synced" className="space-y-4">
              <p className="text-sm text-gray-500">
                Fotos sincronizadas com plataformas externas (Pexels/Unsplash).
              </p>
              
              {goldPhotos.filter(p => p.isSynced).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma foto sincronizada ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {goldPhotos.filter(p => p.isSynced).map((photo) => (
                    <div
                      key={photo.id}
                      className="relative rounded-2xl overflow-hidden border-2 border-green-500"
                    >
                      <img 
                        src={photo.imageUrl} 
                        alt={photo.title}
                        className="w-full aspect-square object-cover"
                      />
                      
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-500 text-white text-[10px]">
                          <Globe className="w-3 h-3 mr-1" />
                          GLOBAL
                        </Badge>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                        <p className="text-white text-sm font-bold truncate">{photo.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminStatCard({ 
  icon, 
  label, 
  value, 
  color = "text-gray-600" 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 border border-gray-100"
    >
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        <span className="text-2xl font-black text-[#2D2A26]">{value}</span>
      </div>
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
    </motion.div>
  );
}
