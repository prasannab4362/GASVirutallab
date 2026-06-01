"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { sendChatMessageAction, getChatMessagesAction } from "@/lib/actions/chat-actions";

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string | Date;
  senderId: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

interface BatchChatInterfaceProps {
  batchId: string;
  currentUserId: string;
}

export default function BatchChatInterface({ batchId, currentUserId }: BatchChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for messages every 3 seconds
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchMessages = async () => {
      if (!batchId) return;
      const res = await getChatMessagesAction(batchId);
      if (res.success && res.messages) {
        setMessages(res.messages as any);
      }
    };

    setIsLoading(true);
    fetchMessages().then(() => {
      setIsLoading(false);
      scrollToBottom();
    });

    intervalId = setInterval(fetchMessages, 3000);

    return () => clearInterval(intervalId);
  }, [batchId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when new messages arrive if we were already at the bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      const res = await sendChatMessageAction(batchId, content);
      if (res.success && res.message) {
        // Optimistic UI update
        setMessages(prev => [...prev, res.message as any]);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Batch Chat</h3>
          <p className="text-[10px] text-zinc-500 font-medium">Real-time collaboration</p>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/30 dark:bg-zinc-950/20">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-zinc-400 space-y-2">
            <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
            <p className="text-xs">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender.id === currentUserId;
            const isMentor = msg.sender.role === "MENTOR";
            const isAdmin = msg.sender.role === "ADMIN";

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                    {isMe ? "You" : msg.sender.name}
                  </span>
                  {(isMentor || isAdmin) && (
                    <span className="text-[8px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-sm">
                      {msg.sender.role}
                    </span>
                  )}
                  <span className="text-[9px] text-zinc-400">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div 
                  className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-xs shadow-sm ${
                    isMe 
                      ? "bg-blue-600 text-white rounded-tr-sm" 
                      : isMentor || isAdmin
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-amber-200/50 dark:border-amber-900/30 rounded-tl-sm shadow-amber-500/5"
                        : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
        />
        <button
          type="submit"
          disabled={isSending || !newMessage.trim()}
          className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl transition-colors shadow-md shadow-blue-500/20"
        >
          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
        </button>
      </form>
    </div>
  );
}
