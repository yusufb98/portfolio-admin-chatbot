import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineMail, 
  HiOutlineMailOpen, 
  HiOutlineTrash, 
  HiX,
  HiOutlineRefresh
} from 'react-icons/hi';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await contactAPI.getAll();
      // API returns { messages: [], total, unread } object
      setMessages(response.data?.messages || []);
    } catch (error) {
      toast.error('Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const openMessage = async (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    
    if (!message.is_read) {
      try {
        await contactAPI.markAsRead(message.id);
        setMessages(prev => 
          prev.map(m => m.id === message.id ? { ...m, is_read: 1 } : m)
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;
    try {
      await contactAPI.delete(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Mesaj silindi!');
      if (selectedMessage?.id === id) {
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Silinemedi');
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread') return !m.is_read;
    if (filter === 'read') return m.is_read;
    return true;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-neutral-900 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">İletişim Mesajları</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {unreadCount > 0 ? `${unreadCount} okunmamış mesaj` : 'Tüm mesajlar okundu'}
          </p>
        </div>
        <button onClick={fetchMessages} className="btn-ghost flex items-center gap-2">
          <HiOutlineRefresh className="w-5 h-5" />
          Yenile
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Tümü', count: messages.length },
          { value: 'unread', label: 'Okunmamış', count: unreadCount },
          { value: 'read', label: 'Okunmuş', count: messages.length - unreadCount }
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <HiOutlineMail className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Mesaj bulunmuyor</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer ${
                !message.is_read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
              }`}
              onClick={() => openMessage(message)}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.is_read 
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400' 
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
                }`}>
                  {message.is_read ? (
                    <HiOutlineMailOpen className="w-5 h-5" />
                  ) : (
                    <HiOutlineMail className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium text-neutral-900 dark:text-white truncate ${
                          !message.is_read ? 'font-semibold' : ''
                        }`}>
                          {message.name}
                        </h3>
                        {!message.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 truncate">{message.email}</p>
                    </div>
                    <span className="text-xs text-neutral-400 flex-shrink-0">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                  <h4 className={`mt-1 text-sm ${
                    !message.is_read 
                      ? 'text-neutral-700 dark:text-neutral-200 font-medium' 
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}>
                    {message.subject || '(Konu yok)'}
                  </h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate mt-1">
                    {message.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {showModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Mesaj Detayı
                </h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <HiX className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-semibold text-lg">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">{selectedMessage.name}</h3>
                    <a 
                      href={`mailto:${selectedMessage.email}`} 
                      className="text-sm text-emerald-500 hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Konu</span>
                    <span className="text-xs text-neutral-400">{formatDate(selectedMessage.created_at)}</span>
                  </div>
                  <p className="text-neutral-900 dark:text-white font-medium">
                    {selectedMessage.subject || '(Konu belirtilmemiş)'}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Mesaj</span>
                  <p className="text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between">
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                  Sil
                </button>
                <a 
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || ''}`}
                  className="btn-primary flex items-center gap-2"
                >
                  <HiOutlineMail className="w-5 h-5" />
                  Yanıtla
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesManagement;
