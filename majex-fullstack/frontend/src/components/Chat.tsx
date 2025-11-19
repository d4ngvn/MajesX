import React, { useState, useEffect, useRef } from 'react';
import { User, Message, UserRole } from '../types';
import { Send, Shield } from 'lucide-react';

interface ChatProps {
  user: User;
  messages: Message[];
  sendMessage: (text: string) => void;
  role: UserRole;
  onlineCount: number;
  totalMembers: number;
}

export const CommunityChat: React.FC<ChatProps> = ({ user, messages, sendMessage, role, onlineCount, totalMembers }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div>
          <h2 className="font-bold text-slate-800">Building A Community</h2>
          <p className="text-xs text-slate-500">{totalMembers} members • {onlineCount} online</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          const isAdmin = msg.senderId.startsWith('user_admin');
          
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                   {isAdmin && <Shield className="w-3 h-3 text-indigo-500" />}
                   <span className="text-xs text-slate-500 font-medium">{msg.senderName}</span>
                   <span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div 
                  className={`p-3 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
        />
        <button 
          type="submit"
          className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
