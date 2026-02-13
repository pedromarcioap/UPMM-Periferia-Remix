"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Bell,
  X,
  Heart,
  Trophy,
  Crown,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBadgeProps {
  onOpenChange?: (open: boolean) => void;
}

export function NotificationBadge({ onOpenChange }: NotificationBadgeProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    let isMounted = true;
    
    const load = async () => {
      try {
        const res = await fetch("/api/notifications?limit=10");
        const data = await res.json();
        if (isMounted) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    
    load();
    const interval = setInterval(load, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [session?.user?.id]);

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          notificationIds
            ? { notificationIds }
            : { markAll: true }
        ),
      });
      
      if (!notificationIds) {
        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
      } else {
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n.id) ? { ...n, isRead: true } : n
          )
        );
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "REMIX_CREATED":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case "GOLD_STANDARD":
        return <Trophy className="w-4 h-4 text-[#FFB800]" />;
      case "BATTLE_WIN":
        return <Crown className="w-4 h-4 text-[#FFB800]" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  if (!session?.user?.id) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-xl hover:bg-[#FFB800]/10"
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#2D2A26]">Notificações</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead()}
                  className="text-xs text-[#FFB800] hover:text-[#E5A600]"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#FFB800] animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? "bg-[#FFB800]/5" : ""
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead([notification.id]);
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D2A26] line-clamp-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[#FFB800] flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
