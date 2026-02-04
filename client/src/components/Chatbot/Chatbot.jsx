import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineChat, 
  HiX, 
  HiOutlinePaperAirplane,
  HiOutlineRefresh
} from 'react-icons/hi';
import { useChatStore, useTranslation } from '../../store';
import { chatbotAPI } from '../../services/api';

const Chatbot = () => {
  const { t } = useTranslation();
  const { isOpen, messages, config, setOpen, addMessage, setConfig, setVisitorId, visitorId, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch chatbot config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await chatbotAPI.getConfig();
        setConfig(response.data);
      } catch (error) {
        console.error('Error fetching chatbot config:', error);
      }
    };

    fetchConfig();
  }, [setConfig]);

  // Generate visitor ID
  useEffect(() => {
    if (!visitorId) {
      const id = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setVisitorId(id);
    }
  }, [visitorId, setVisitorId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Add welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0 && config?.welcome_message) {
      addMessage({
        id: Date.now(),
        type: 'bot',
        text: config.welcome_message,
        timestamp: new Date().toISOString()
      });
    }
  }, [isOpen, messages.length, config, addMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);
    setTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, config?.response_delay || 500));
      
      const response = await chatbotAPI.chat(userMessage.text, visitorId);
      
      setTyping(false);
      
      addMessage({
        id: Date.now() + 1,
        type: 'bot',
        text: response.data.response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Chat error:', error);
      setTyping(false);
      addMessage({
        id: Date.now() + 1,
        type: 'bot',
        text: t('chatbot.error', 'Sorry, an error occurred. Please try again.'),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    clearMessages();
    if (config?.welcome_message) {
      setTimeout(() => {
        addMessage({
          id: Date.now(),
          type: 'bot',
          text: config.welcome_message,
          timestamp: new Date().toISOString()
        });
      }, 100);
    }
  };

  if (config && !config.is_active) return null;

  return (
    <>
      {/* Chat bubble button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Open chat"
          >
            <HiOutlineChat className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="p-4 bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  {config?.bot_avatar ? (
                    <img src={config.bot_avatar} alt="Bot" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <span className="text-lg">🤖</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{config?.bot_name || t('chatbot.title', 'Assistant')}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-xs text-neutral-400">{t('chatbot.online', 'Online')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Reset chat"
                >
                  <HiOutlineRefresh className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close chat"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-950">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl rounded-br-md'
                        : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-2xl rounded-bl-md border border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1.5 ${
                      message.type === 'user' 
                        ? 'text-neutral-400 dark:text-neutral-500' 
                        : 'text-neutral-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-neutral-800 px-4 py-3 rounded-2xl rounded-bl-md border border-neutral-200 dark:border-neutral-700">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chatbot.placeholder', 'Type a message...')}
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white text-sm"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 transition-all hover:opacity-90 disabled:opacity-50"
                  aria-label="Send message"
                >
                  <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
