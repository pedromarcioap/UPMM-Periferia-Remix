"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Camera, 
  Sparkles, 
  Award, 
  Settings, 
  Edit2, 
  Save,
  X,
  Star,
  TrendingUp,
  Zap
} from "lucide-react";
import { Photo, Remix } from "@/store/useAppStore";

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserProfile {
  id: string;
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  vibePoints: number;
  responsaPoints: number;
  level: number;
  badges: { badge: { name: string; description: string; icon: string } }[];
  _count: { photos: number; remixes: number; comments: number };
}

const LEVELS = [
  { level: 1, name: "Observador", minPoints: 0, icon: "👁️" },
  { level: 2, name: "Criador", minPoints: 100, icon: "🎨" },
  { level: 3, name: "Ativista Visual", minPoints: 500, icon: "🌟" },
];

export function UserProfile({ open, onOpenChange }: UserProfileProps) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [remixes, setRemixes] = useState<Remix[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "", username: "" });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("photos");

  useEffect(() => {
    if (session?.user?.id && open) {
      fetchProfile();
      fetchUserContent();
    }
  }, [session?.user?.id, open]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    
    const res = await fetch(`/api/users?userId=${session.user.id}`);
    const data = await res.json();
    setProfile(data);
    setEditForm({
      name: data.name || "",
      bio: data.bio || "",
      username: data.username || "",
    });
  };

  const fetchUserContent = async () => {
    if (!session?.user?.id) return;
    
    const [photosRes, remixesRes] = await Promise.all([
      fetch(`/api/photos?userId=${session.user.id}&limit=20`),
      fetch(`/api/remixes?userId=${session.user.id}&limit=20`),
    ]);
    
    const photosData = await photosRes.json();
    const remixesData = await remixesRes.json();
    
    setPhotos(photosData.photos || []);
    setRemixes(remixesData || []);
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          ...editForm,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => prev ? { ...prev, ...data } : null);
        setIsEditing(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLevel = () => {
    const points = (profile?.vibePoints || 0) + (profile?.responsaPoints || 0);
    let currentLevel = LEVELS[0];
    for (const level of LEVELS) {
      if (points >= level.minPoints) {
        currentLevel = level;
      }
    }
    return currentLevel;
  };

  const getNextLevel = () => {
    const points = (profile?.vibePoints || 0) + (profile?.responsaPoints || 0);
    const currentIndex = LEVELS.findIndex(l => l.level === getCurrentLevel().level);
    if (currentIndex < LEVELS.length - 1) {
      return LEVELS[currentIndex + 1];
    }
    return null;
  };

  const getProgressToNextLevel = () => {
    const points = (profile?.vibePoints || 0) + (profile?.responsaPoints || 0);
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    
    if (!nextLevel) return 100;
    
    const progress = points - currentLevel.minPoints;
    const needed = nextLevel.minPoints - currentLevel.minPoints;
    return Math.min(100, (progress / needed) * 100);
  };

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-center">
            Meu Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-br from-[#FFB800]/20 to-[#FFB800]/5 rounded-3xl">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.name || ""} 
                  className="w-24 h-24 rounded-3xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-[#FFB800] flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-[#2D2A26]" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center text-lg">
                {getCurrentLevel().icon}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nome"
                    className="input-upmm"
                  />
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="Username"
                    className="input-upmm"
                  />
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Bio"
                    className="input-upmm min-h-[60px] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={loading} className="btn-upmm flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 rounded-2xl">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-[#2D2A26]">
                    {profile.name || "Anônimo"}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">@{profile.username}</p>
                  {profile.bio && (
                    <p className="text-sm text-gray-600 mb-3">{profile.bio}</p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard 
              icon={<Zap className="w-5 h-5" />}
              label="Vibe"
              value={profile.vibePoints}
              color="text-[#FFB800]"
            />
            <StatCard 
              icon={<Star className="w-5 h-5" />}
              label="Responsa"
              value={profile.responsaPoints}
              color="text-purple-500"
            />
            <StatCard 
              icon={<Camera className="w-5 h-5" />}
              label="Fotos"
              value={profile._count.photos}
            />
            <StatCard 
              icon={<Sparkles className="w-5 h-5" />}
              label="Remixes"
              value={profile._count.remixes}
            />
          </div>

          {/* Level Progress */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCurrentLevel().icon}</span>
                <div>
                  <p className="font-bold text-[#2D2A26]">Nível {getCurrentLevel().level}</p>
                  <p className="text-xs text-gray-500">{getCurrentLevel().name}</p>
                </div>
              </div>
              {getNextLevel() && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Próximo: {getNextLevel()?.name}</p>
                  <p className="text-xs text-gray-400">
                    {getNextLevel()!.minPoints - (profile.vibePoints + profile.responsaPoints)} pts restantes
                  </p>
                </div>
              )}
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressToNextLevel()}%` }}
                className="h-full bg-gradient-to-r from-[#FFB800] to-[#E5A600] rounded-full"
              />
            </div>
          </div>

          {/* Badges */}
          {profile.badges.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                Conquistas
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((b, i) => (
                  <Badge key={i} className="px-3 py-1.5 rounded-xl bg-[#FFB800]/10 text-[#2D2A26] border border-[#FFB800]/20">
                    <Award className="w-4 h-4 mr-1.5 text-[#FFB800]" />
                    {b.badge.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 rounded-2xl">
              <TabsTrigger value="photos" className="rounded-xl">
                <Camera className="w-4 h-4 mr-2" />
                Minhas Fotos ({profile._count.photos})
              </TabsTrigger>
              <TabsTrigger value="remixes" className="rounded-xl">
                <Sparkles className="w-4 h-4 mr-2" />
                Meus Remixes ({profile._count.remixes})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photos" className="mt-4">
              {photos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Nenhuma foto ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={photo.thumbnailUrl || photo.imageUrl} 
                        alt={photo.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="remixes" className="mt-4">
              {remixes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Nenhum remix ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {remixes.map((remix) => (
                    <div key={remix.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={remix.imageUrl} 
                        alt={remix.title || "Remix"}
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                      />
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

function StatCard({ 
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
    <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <p className="text-xl font-black text-[#2D2A26]">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
    </div>
  );
}
