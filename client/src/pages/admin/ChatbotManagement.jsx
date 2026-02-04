import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlinePlus, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineSave,
  HiX,
  HiOutlineChatAlt2,
  HiOutlineCog
} from 'react-icons/hi';
import { chatbotAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ChatbotManagement = () => {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState(null);
  const [qaPairs, setQAPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingQA, setEditingQA] = useState(null);
  const [qaForm, setQAForm] = useState({
    keywords: '',
    question: '',
    answer: '',
    category: 'general',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [configRes, qaRes] = await Promise.all([
        chatbotAPI.getConfig(),
        chatbotAPI.getQA()
      ]);
      setConfig(configRes.data);
      setQAPairs(qaRes.data);
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await chatbotAPI.updateConfig(config);
      toast.success('Ayarlar kaydedildi!');
    } catch (error) {
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const openQAModal = (qa = null) => {
    if (qa) {
      setEditingQA(qa);
      setQAForm({
        keywords: qa.keywords,
        question: qa.question,
        answer: qa.answer,
        category: qa.category || 'general',
        is_active: qa.is_active === 1
      });
    } else {
      setEditingQA(null);
      setQAForm({
        keywords: '',
        question: '',
        answer: '',
        category: 'general',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQA(null);
  };

  const handleQASubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQA) {
        await chatbotAPI.updateQA(editingQA.id, qaForm);
        toast.success('Soru-cevap güncellendi!');
      } else {
        await chatbotAPI.createQA(qaForm);
        toast.success('Soru-cevap eklendi!');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const deleteQA = async (id) => {
    if (!confirm('Bu soru-cevabı silmek istediğinizden emin misiniz?')) return;
    try {
      await chatbotAPI.deleteQA(id);
      toast.success('Silindi!');
      fetchData();
    } catch (error) {
      toast.error('Silinemedi');
    }
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
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Chatbot Yönetimi</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Chatbot ayarlarını ve soru-cevapları yönetin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'config'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          <HiOutlineCog className="w-5 h-5 inline mr-2" />
          Genel Ayarlar
        </button>
        <button
          onClick={() => setActiveTab('qa')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'qa'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          <HiOutlineChatAlt2 className="w-5 h-5 inline mr-2" />
          Soru-Cevaplar ({qaPairs.length})
        </button>
      </div>

      {/* Config Tab */}
      {activeTab === 'config' && config && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white">Chatbot Durumu</h3>
                <p className="text-sm text-neutral-500">Chatbot'u aktif veya pasif yapın</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={config.is_active}
                  onChange={handleConfigChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Bot Adı</label>
                <input
                  type="text"
                  name="bot_name"
                  value={config.bot_name || ''}
                  onChange={handleConfigChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tema Rengi</label>
                <input
                  type="color"
                  name="theme_color"
                  value={config.theme_color || '#10b981'}
                  onChange={handleConfigChange}
                  className="input h-10 p-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Hoşgeldin Mesajı</label>
              <textarea
                name="welcome_message"
                value={config.welcome_message || ''}
                onChange={handleConfigChange}
                rows={3}
                className="input resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Fallback Mesajı</label>
              <textarea
                name="fallback_message"
                value={config.fallback_message || ''}
                onChange={handleConfigChange}
                rows={3}
                className="input resize-none"
                placeholder="Cevap bulunamadığında gösterilecek mesaj"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Yanıt Gecikmesi (ms): {config.response_delay || 500}
              </label>
              <input
                type="range"
                name="response_delay"
                value={config.response_delay || 500}
                onChange={handleConfigChange}
                min="0"
                max="2000"
                step="100"
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button onClick={saveConfig} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <HiOutlineSave className="w-5 h-5" />
                )}
                Kaydet
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Q&A Tab */}
      {activeTab === 'qa' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-end">
            <button onClick={() => openQAModal()} className="btn-primary flex items-center gap-2">
              <HiOutlinePlus className="w-5 h-5" />
              Yeni Soru-Cevap
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
            {qaPairs.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">Henüz soru-cevap eklenmemiş</div>
            ) : (
              qaPairs.map((qa) => (
                <div key={qa.id} className={`p-4 ${!qa.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-neutral-900 dark:text-white">{qa.question}</h3>
                        {qa.hit_count > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-full">
                            {qa.hit_count} hit
                          </span>
                        )}
                        {!qa.is_active && (
                          <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-xs rounded-full">
                            Pasif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">{qa.answer}</p>
                      <div className="flex flex-wrap gap-1">
                        {qa.keywords?.split(',').map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs rounded text-neutral-600 dark:text-neutral-400">
                            {kw.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openQAModal(qa)}
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <HiOutlinePencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteQA(qa.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Q&A Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {editingQA ? 'Soru-Cevabı Düzenle' : 'Yeni Soru-Cevap'}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <HiX className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleQASubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Anahtar Kelimeler (virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={qaForm.keywords}
                    onChange={(e) => setQAForm(prev => ({ ...prev, keywords: e.target.value }))}
                    className="input"
                    placeholder="robotik, ros, gazebo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Soru</label>
                  <input
                    type="text"
                    value={qaForm.question}
                    onChange={(e) => setQAForm(prev => ({ ...prev, question: e.target.value }))}
                    className="input"
                    placeholder="ROS nedir?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Cevap</label>
                  <textarea
                    value={qaForm.answer}
                    onChange={(e) => setQAForm(prev => ({ ...prev, answer: e.target.value }))}
                    rows={4}
                    className="input resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Kategori</label>
                    <select 
                      value={qaForm.category} 
                      onChange={(e) => setQAForm(prev => ({ ...prev, category: e.target.value }))}
                      className="input"
                    >
                      <option value="general">Genel</option>
                      <option value="projects">Projeler</option>
                      <option value="skills">Yetenekler</option>
                      <option value="contact">İletişim</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qaForm.is_active}
                        onChange={(e) => setQAForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Aktif</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-ghost">İptal</button>
                  <button type="submit" className="btn-primary">
                    {editingQA ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotManagement;
