"use client";

import { motion } from "framer-motion";
import { Camera, Heart, Sparkles, Users, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2D2A26] text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FFB800] rounded-2xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#2D2A26]" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">UPMM</h3>
                <p className="text-[8px] uppercase tracking-widest text-gray-400">
                  Unidos Por Um Mundo Melhor
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Uma plataforma comunitária focada na valorização da estética visual 
              das periferias brasileiras. Transformando fotos em arte digital.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#FFB800] mb-4">
              Explorar
            </h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Galeria</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Remixes</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Criadores</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Tags Populares</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#FFB800] mb-4">
              Comunidade
            </h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Diretrizes</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacidade</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Suporte</a></li>
            </ul>
          </div>

          {/* Stats */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#FFB800] mb-4">
              Impacto
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={<Users className="w-4 h-4" />} value="1.2k+" label="Criadores" />
              <StatCard icon={<Camera className="w-4 h-4" />} value="5.4k+" label="Fotos" />
              <StatCard icon={<Sparkles className="w-4 h-4" />} value="2.1k+" label="Remixes" />
              <StatCard icon={<Heart className="w-4 h-4" />} value="12k+" label="Vibes" />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2024 UPMM. Todos os direitos reservados. Creative Commons.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-[#FFB800] hover:text-[#2D2A26] flex items-center justify-center transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-[#FFB800] hover:text-[#2D2A26] flex items-center justify-center transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-gray-700/50 rounded-2xl p-3">
      <div className="flex items-center gap-2 text-[#FFB800] mb-1">
        {icon}
        <span className="text-lg font-black">{value}</span>
      </div>
      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
    </div>
  );
}
