"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, 
  User, 
  LogIn, 
  LogOut, 
  Upload, 
  Sparkles,
  Shield,
  MapPin,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBadge } from "./notification-badge";

export function Header() {
  const { data: session } = useSession();
  const { user, setUser, setActiveTab, activeTab } = useAppStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (isRegister: boolean) => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          isRegister: isRegister ? "true" : "false",
          redirect: "false",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro na autenticação");
      }

      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setUser(null);
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#FDFCFB]/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTab("feed")}
            >
              <div className="w-10 h-10 bg-[#FFB800] rounded-2xl flex items-center justify-center shadow-upmm">
                <Camera className="w-5 h-5 text-[#2D2A26]" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter text-[#2D2A26]">
                  UPMM
                </h1>
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">
                  Unidos Por Um Mundo Melhor
                </p>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <NavButton 
                active={activeTab === "feed"} 
                onClick={() => setActiveTab("feed")}
                icon={<Sparkles className="w-4 h-4" />}
                label="Galeria"
              />
              <NavButton 
                active={activeTab === "upload"} 
                onClick={() => setActiveTab("upload")}
                icon={<Upload className="w-4 h-4" />}
                label="Upload"
              />
              <NavButton 
                active={activeTab === "map"} 
                onClick={() => setActiveTab("map")}
                icon={<MapPin className="w-4 h-4" />}
                label="Mapa"
              />
              <NavButton 
                active={activeTab === "battle"} 
                onClick={() => setActiveTab("battle")}
                icon={<Flame className="w-4 h-4" />}
                label="Batalha"
              />
              {session?.user?.role === "ADMIN" && (
                <NavButton 
                  active={activeTab === "admin"} 
                  onClick={() => setActiveTab("admin")}
                  icon={<Shield className="w-4 h-4" />}
                  label="Admin"
                />
              )}
            </nav>

            {/* User Area */}
            <div className="flex items-center gap-3">
              {session ? (
                <>
                  <NotificationBadge />
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab("profile")}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#FFB800]/10 hover:bg-[#FFB800]/20 transition-colors"
                  >
                    {session.user?.image || user?.avatar ? (
                      <img 
                        src={user?.avatar || session.user?.image || ""} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#FFB800] rounded-xl flex items-center justify-center">
                        <User className="w-4 h-4 text-[#2D2A26]" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-semibold text-[#2D2A26]">
                      {user?.name || session.user?.name || "Usuário"}
                    </span>
                  </motion.button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="rounded-2xl hover:bg-red-50 hover:text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-upmm flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2 mt-3 overflow-x-auto pb-1">
            <NavButton 
              active={activeTab === "feed"} 
              onClick={() => setActiveTab("feed")}
              icon={<Sparkles className="w-4 h-4" />}
              label="Galeria"
              mobile
            />
            <NavButton 
              active={activeTab === "upload"} 
              onClick={() => setActiveTab("upload")}
              icon={<Upload className="w-4 h-4" />}
              label="Upload"
              mobile
            />
            <NavButton 
              active={activeTab === "map"} 
              onClick={() => setActiveTab("map")}
              icon={<MapPin className="w-4 h-4" />}
              label="Mapa"
              mobile
            />
            <NavButton 
              active={activeTab === "battle"} 
              onClick={() => setActiveTab("battle")}
              icon={<Flame className="w-4 h-4" />}
              label="Batalha"
              mobile
            />
            {session?.user?.role === "ADMIN" && (
              <NavButton 
                active={activeTab === "admin"} 
                onClick={() => setActiveTab("admin")}
                icon={<Shield className="w-4 h-4" />}
                label="Admin"
                mobile
              />
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-center">
              Bem-vindo à UPMM
            </DialogTitle>
            <DialogDescription className="text-center">
              Entre para fazer parte da nossa comunidade criativa
            </DialogDescription>
          </DialogHeader>

          <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 rounded-2xl">
              <TabsTrigger value="login" className="rounded-xl">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-upmm"
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-upmm"
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button 
                onClick={() => handleAuth(false)}
                disabled={loading || !formData.email || !formData.password}
                className="btn-upmm w-full"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-upmm"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-upmm"
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-upmm"
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button 
                onClick={() => handleAuth(true)}
                disabled={loading || !formData.email || !formData.password || !formData.name}
                className="btn-upmm w-full"
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

function NavButton({ 
  active, 
  onClick, 
  icon, 
  label,
  mobile = false 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  mobile?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-2xl font-bold uppercase text-sm transition-all
        ${active 
          ? "bg-[#FFB800] text-[#2D2A26] shadow-upmm" 
          : "bg-transparent text-[#2D2A26] hover:bg-gray-100"
        }
        ${mobile ? "text-xs px-3 py-1.5 whitespace-nowrap" : ""}
      `}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}
