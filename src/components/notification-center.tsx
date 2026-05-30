"use client";

import { useState } from "react";
import { Bell, Check, X, AlertTriangle, MessageSquare, Calendar, Info } from "lucide-react";
import { markNotificationAsReadAction } from "@/lib/actions/notification-actions";
import { usePathname } from "next/navigation";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string | Date;
}

interface NotificationCenterProps {
  initialNotifications: NotificationItem[];
}

export default function NotificationCenter({ initialNotifications }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    const res = await markNotificationAsReadAction(id, pathname);
    if (res.success) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ALERT":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "FEEDBACK":
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case "MEETING":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-zinc-500" />;
    }
  };

  const formatTime = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-all border border-zinc-200/60"
        aria-label="Toggle notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <>
          {/* Overlay to close on outside click */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[480px] flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-xl z-40 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-4 border-b border-zinc-150 flex items-center justify-between bg-zinc-50/50">
              <span className="font-semibold text-zinc-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 max-h-[360px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 flex gap-3 transition-colors ${
                      n.isRead ? "bg-white hover:bg-zinc-50/55" : "bg-blue-50/20 hover:bg-blue-50/40"
                    }`}
                  >
                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs block font-medium ${n.isRead ? "text-zinc-800" : "text-zinc-950 font-semibold"}`}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(n.id)}
                            className="p-1 rounded-md text-blue-600 hover:bg-blue-100/60 transition-colors shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-zinc-600 text-xs mt-1 leading-relaxed break-words">{n.message}</p>
                      <span className="text-[10px] text-zinc-400 block mt-2">{formatTime(n.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
