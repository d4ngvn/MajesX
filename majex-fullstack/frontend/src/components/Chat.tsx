import React, { useState, useEffect, useRef } from 'react';
import { User, Message, UserRole } from '../types';
import { Send, Shield, Users } from 'lucide-react';

interface ChatProps {
  user: User;
  messages: Message[];
  sendMessage: (text: string) => void;
  role: UserRole;
  onlineCount: number; // Nhận số lượng online thật
  totalMembers: number; // Nhận tổng số thành viên thật
}

export const CommunityChat: React.FC<ChatProps> = ({ 
  user, 
  messages, 
  sendMessage, 
  role, 
  onlineCount, 
  totalMembers 
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
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
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Cộng Đồng Cư Dân
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {totalMembers} thành viên • <span className="text-green-600 font-medium">{onlineCount} đang online</span>
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 mt-10 text-sm">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        ) : (
          messages.map((msg) => {
            // Kiểm tra xem tin nhắn có phải của chính mình không
            const isMe = msg.senderId === user.id;
            // Kiểm tra xem người gửi có phải là Admin không (dựa vào role hoặc ID)
            const isAdminSender = msg.senderName.toLowerCase().includes('admin') || msg.senderName.includes('Manager');
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-center gap-1 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                     {isAdminSender && <Shield className="w-3 h-3 text-indigo-500" />}
                     <span className="text-xs text-slate-500 font-medium">
                        {msg.senderName}
                     </span>
                     <span className="text-[10px] text-slate-400 ml-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                  </div>
                  
                  <div 
                    className={`px-4 py-2 rounded-2xl text-sm shadow-sm break-words ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900 transition-all"
        />
        <button 
          type="submit"
          disabled={!input.trim()}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};