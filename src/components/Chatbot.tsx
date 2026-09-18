import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Minus } from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage } from '../types';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Welcome to Lumina Beauty. I'm your virtual beauty assistant. How can I help you discover your radiance today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage([...messages, userMessage]);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting. Please try again or use our contact form." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[380px] h-[550px] bg-white shadow-2xl overflow-hidden flex flex-col border border-brand-ink/5"
          >
            {/* Header */}
            <div className="bg-white p-6 border-b border-black/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <h4 className="text-gray-500 font-bold text-[11px] uppercase tracking-tighter leading-none">Concierge (24/7)</h4>
                  <p className="text-[10px] text-brand-accent font-medium mt-1">Online & Ready</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-brand-ink transition-colors">
                <Minus size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#FDFDFB]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-brand-accent text-white rounded-2xl rounded-tr-none shadow-md shadow-brand-accent/20' 
                      : 'bg-gray-100 text-gray-600 rounded-2xl rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-black/5 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Lumière..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-gray-50 border-none rounded-full px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-brand-accent transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="w-10 h-10 bg-brand-accent text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-brand-ink text-brand-paper shadow-2xl flex items-center justify-center group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-brand-accent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={28} className="relative z-10" /> : <MessageCircle size={28} className="relative z-10" />}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent rounded-full animate-ping" />
      </motion.button>
    </div>
  );
}
