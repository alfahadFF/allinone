import React, { useState } from 'react';
import { X, Send, User, CheckCheck } from 'lucide-react';

interface CourierChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  driverAvatar?: string;
}

type Message = {
  id: string;
  sender: 'driver' | 'user';
  text: string;
  time: string;
};

export const CourierChatModal: React.FC<CourierChatModalProps> = ({
  isOpen,
  onClose,
  driverName,
  driverAvatar,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'driver',
      text: `السلام عليكم، معك ${driverName}. استلمت طلبك وأنا في الطريق إليك الآن.`,
      time: 'الآن',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const quickReplies = [
    'اترك الطلب عند الباب شكراً',
    'جرس الباب معطل، يرجى الاتصال عند الوصول',
    'كم دقيقة متبقية على وصولك؟',
    'العمارة البيضاء على اليمين',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: 'الآن',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Simulate smart driver response after 1.5 seconds
    setTimeout(() => {
      let reply = 'أبشر ولا يهمك يا غالي، دقائق وأكون عندك بإذن الله!';
      if (text.includes('الباب')) {
        reply = 'تم، سأضع الطلب أمام الباب وألتقط صورة للطلب.';
      } else if (text.includes('دقيقة')) {
        reply = 'حسب حركة السير متبقي تقريباً 8 إلى 10 دقائق.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-reply`,
          sender: 'driver',
          text: reply,
          time: 'الآن',
        },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl h-[85vh] max-h-[640px] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-3.5 bg-orange-500 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden bg-white/20 shrink-0">
              {driverAvatar ? (
                <img src={driverAvatar} alt={driverName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <User size={20} />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{driverName}</h3>
              <p className="text-[11px] text-white/80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>متصل الآن • كابتن التوصيل</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/70">
          <div className="text-center my-1">
            <span className="text-[10px] bg-gray-200/80 text-gray-600 px-3 py-1 rounded-full font-medium">
              محادثة آمنة ومسجلة مع كابتن التوصيل
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-orange-500 text-white rounded-br-xs'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 px-1">
                <span>{msg.time}</span>
                {msg.sender === 'user' && <CheckCheck size={12} className="text-orange-400" />}
              </div>
            </div>
          ))}
        </div>

        {/* Quick reply suggestions */}
        <div className="px-3 py-2 bg-white border-t border-gray-100 overflow-x-auto hide-scrollbar flex gap-2 shrink-0">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(reply)}
              className="text-[11px] whitespace-nowrap bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/60 rounded-full px-3 py-1 font-medium transition-colors shrink-0"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="اكتب رسالة للمندوب..."
            className="flex-1 bg-gray-100 text-xs text-gray-900 px-3.5 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 active:scale-95"
          >
            <Send size={15} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
