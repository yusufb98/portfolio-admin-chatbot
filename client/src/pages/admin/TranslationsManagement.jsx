import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineGlobeAlt,
  HiOutlineSave,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineInformationCircle,
  HiOutlinePencil
} from 'react-icons/hi';
import { translationsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TranslationsManagement = () => {
  const [translations, setTranslations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [defaultLanguage, setDefaultLanguage] = useState('tr');
  const [editedTranslations, setEditedTranslations] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [expandedKey, setExpandedKey] = useState(null);
  const [newKey, setNewKey] = useState({ key: '', category: 'general', translations: {} });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, defaultRes] = await Promise.all([
        translationsAPI.getAllTranslations(),
        translationsAPI.getDefaultLanguage()
      ]);
      setTranslations(transRes.data.keys || []);
      setLanguages(transRes.data.languages || []);
      setDefaultLanguage(defaultRes.data.code || 'tr');
    } catch (error) {
      toast.error('Veriler yüklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(translations.map(t => t.category))];
  const activeLanguages = languages.filter(l => l.is_active);

  // Category labels in Turkish
  const categoryLabels = {
    'all': 'Tüm Kategoriler',
    'nav': '🧭 Navigasyon',
    'hero': '🏠 Ana Bölüm',
    'about': '👤 Hakkımda',
    'skills': '💡 Yetenekler',
    'projects': '📁 Projeler',
    'contact': '📬 İletişim',
    'footer': '📍 Alt Bilgi',
    'chatbot': '🤖 Chatbot',
    'common': '⚙️ Genel',
    'maintenance': '🔧 Bakım',
    'profile': '👨‍💼 Profil İçerikleri',
    'general': '📝 Genel'
  };

  const filteredTranslations = translations.filter(t => {
    const matchesSearch = searchTerm === '' || 
      t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(t.translations).some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTranslationChange = (key, langCode, value) => {
    setEditedTranslations(prev => ({
      ...prev,
      [`${langCode}:${key}`]: value
    }));
  };

  const getTranslationValue = (key, langCode, original) => {
    const editKey = `${langCode}:${key}`;
    return editKey in editedTranslations ? editedTranslations[editKey] : (original || '');
  };

  const saveChanges = async () => {
    if (Object.keys(editedTranslations).length === 0) {
      toast.error('Değişiklik yok');
      return;
    }

    setSaving(true);
    try {
      const updates = Object.entries(editedTranslations).map(([editKey, value]) => {
        const [lang_code, ...keyParts] = editKey.split(':');
        const key = keyParts.join(':');
        return { lang_code, key, value };
      });

      await translationsAPI.bulkUpdate(updates);
      toast.success('Çeviriler kaydedildi!');
      setEditedTranslations({});
      fetchData();
    } catch (error) {
      toast.error('Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultLanguage = async (code) => {
    try {
      await translationsAPI.setDefaultLanguage(code);
      setDefaultLanguage(code);
      toast.success('Varsayılan dil güncellendi!');
    } catch (error) {
      toast.error('Güncellenemedi');
    }
  };

  const toggleLanguageActive = async (lang) => {
    try {
      await translationsAPI.updateLanguage(lang.code, { is_active: lang.is_active ? 0 : 1 });
      toast.success(`${lang.native_name} ${lang.is_active ? 'devre dışı' : 'aktif'} edildi`);
      fetchData();
    } catch (error) {
      toast.error('Güncellenemedi');
    }
  };

  const addNewKey = async () => {
    if (!newKey.key) {
      toast.error('Anahtar boş olamaz');
      return;
    }

    try {
      await translationsAPI.addKey(newKey.key, newKey.category, newKey.translations);
      toast.success('Yeni çeviri eklendi!');
      setShowAddModal(false);
      setNewKey({ key: '', category: 'general', translations: {} });
      fetchData();
    } catch (error) {
      toast.error('Eklenemedi');
    }
  };

  const deleteKey = async (key) => {
    if (!confirm(`"${key}" anahtarını silmek istediğinizden emin misiniz?`)) return;
    
    try {
      await translationsAPI.deleteKey(key);
      toast.success('Silindi!');
      fetchData();
    } catch (error) {
      toast.error('Silinemedi');
    }
  };

  // Quick templates for common translations
  const quickTemplates = [
    { key: 'profile.title', category: 'profile', desc: 'Meslek/Unvan' },
    { key: 'profile.subtitle', category: 'profile', desc: 'Alt başlık' },
    { key: 'profile.bio', category: 'profile', desc: 'Hakkımda metni' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Dil & Çeviri Yönetimi</h1>
          <p className="text-neutral-500 text-sm">Site metinlerini farklı dillerde yönetin</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHelpModal(true)}
            className="btn-secondary"
            title="Yardım"
          >
            <HiOutlineInformationCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Yeni Ekle
          </button>
          <button
            onClick={saveChanges}
            disabled={saving || Object.keys(editedTranslations).length === 0}
            className="btn-primary"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <HiOutlineSave className="w-5 h-5" />
            )}
            Kaydet ({Object.keys(editedTranslations).length})
          </button>
        </div>
      </div>

      {/* Quick Info Banner */}
      {activeLanguages.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            ⚠️ <strong>Hiçbir dil aktif değil!</strong> Aşağıdan en az bir dili aktifleştirin.
          </p>
        </div>
      )}

      {/* Languages Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
      >
        <h2 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <HiOutlineGlobeAlt className="w-5 h-5" />
          Diller ({languages.length})
          <span className="text-sm font-normal text-neutral-500">
            - Aktif: {activeLanguages.length}
          </span>
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => toggleLanguageActive(lang)}
              className={`relative p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                lang.is_active 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm' 
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 dark:text-white text-sm truncate">
                    {lang.native_name}
                  </div>
                  <div className="text-xs text-neutral-500">{lang.code.toUpperCase()}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <span className={`flex-1 text-center text-xs py-1 rounded ${
                  lang.is_active
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                    : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500'
                }`}>
                  {lang.is_active ? '✓ Aktif' : 'Pasif'}
                </span>
                
                {lang.is_active && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefaultLanguage(lang.code);
                    }}
                    className={`text-xs py-1 px-2 rounded transition-colors ${
                      defaultLanguage === lang.code
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200'
                    }`}
                    title="Varsayılan yap"
                  >
                    {defaultLanguage === lang.code ? '★' : '☆'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-neutral-500 mt-4">
          💡 Dil kartına tıklayarak aktif/pasif yapabilirsiniz. Yıldız (★) varsayılan dili gösterir.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Çeviri ara... (anahtar veya metin)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input w-auto min-w-[200px]"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {categoryLabels[cat] || cat}
            </option>
          ))}
        </select>
      </div>

      {/* Translations Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        {activeLanguages.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <HiOutlineGlobeAlt className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
            <p className="text-neutral-500">Önce yukarıdan en az bir dili aktifleştirin</p>
          </div>
        ) : filteredTranslations.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <p className="text-neutral-500">Çeviri bulunamadı</p>
          </div>
        ) : (
          filteredTranslations.map((item) => (
            <div
              key={item.key}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Key Header */}
              <div 
                onClick={() => setExpandedKey(expandedKey === item.key ? null : item.key)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
                      {item.key}
                    </code>
                    <span className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-500">
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 truncate mt-1">
                    {item.translations[defaultLanguage] || item.translations['tr'] || item.translations['en'] || '(boş)'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteKey(item.key);
                    }}
                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                    title="Sil"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                  <HiOutlinePencil className={`w-4 h-4 text-neutral-400 transition-transform ${expandedKey === item.key ? 'rotate-45' : ''}`} />
                </div>
              </div>
              
              {/* Expanded Edit Area */}
              <AnimatePresence>
                {expandedKey === item.key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-neutral-200 dark:border-neutral-800"
                  >
                    <div className="p-4 space-y-3 bg-neutral-50 dark:bg-neutral-800/30">
                      {activeLanguages.map(lang => (
                        <div key={lang.code} className="flex items-start gap-3">
                          <span className="text-2xl pt-1" title={lang.native_name}>{lang.flag}</span>
                          <div className="flex-1">
                            <label className="text-xs text-neutral-500 mb-1 block">
                              {lang.native_name}
                            </label>
                            <textarea
                              value={getTranslationValue(item.key, lang.code, item.translations[lang.code])}
                              onChange={(e) => handleTranslationChange(item.key, lang.code, e.target.value)}
                              rows={2}
                              className="input w-full resize-none"
                              placeholder={`${lang.native_name} çevirisi...`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </motion.div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">📖 Nasıl Kullanılır?</h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">1. Dilleri Aktifleştir</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Üstteki dil kartlarına tıklayarak aktif/pasif yapın. Sadece aktif diller sitede gösterilir.
                    Yıldız (★) ile varsayılan dili seçin - site ilk açıldığında bu dil gösterilir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">2. Çevirileri Düzenle</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Herhangi bir çeviri satırına tıklayarak genişletin. Her dil için ayrı ayrı metin girin.
                    "Kaydet" butonuna tıklamayı unutmayın!
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">3. Yeni Çeviri Ekle</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">
                    "+ Yeni Ekle" butonuyla özel metinler ekleyin. Örnek formatlar:
                  </p>
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 text-sm font-mono space-y-1">
                    <div><span className="text-emerald-600">profile.title</span> → Unvan/Meslek</div>
                    <div><span className="text-emerald-600">profile.bio</span> → Hakkımda metni</div>
                    <div><span className="text-emerald-600">custom.banner</span> → Özel yazı</div>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">💡 İpucu</h3>
                  <p className="text-emerald-700 dark:text-emerald-400 text-sm">
                    "Robotik & Görüntü İşleme Mühendisi" gibi profil bilgilerini çevirmek için
                    <code className="mx-1 px-1 bg-emerald-100 dark:bg-emerald-900 rounded">profile.title</code>
                    anahtarı ekleyin ve her dil için farklı çeviri girin.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-neutral-200 dark:border-neutral-800">
                <button onClick={() => setShowHelpModal(false)} className="btn-primary w-full">
                  Anladım
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Key Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Yeni Çeviri Ekle</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Quick Templates */}
                <div>
                  <label className="label">Hızlı Şablonlar</label>
                  <div className="flex flex-wrap gap-2">
                    {quickTemplates.map(t => (
                      <button
                        key={t.key}
                        onClick={() => setNewKey(prev => ({ ...prev, key: t.key, category: t.category }))}
                        className="text-xs px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        title={t.desc}
                      >
                        {t.key}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Anahtar *</label>
                    <input
                      type="text"
                      value={newKey.key}
                      onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                      className="input font-mono"
                      placeholder="section.key_name"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Örn: profile.title, custom.message</p>
                  </div>
                  <div>
                    <label className="label">Kategori</label>
                    <select
                      value={newKey.category}
                      onChange={(e) => setNewKey(prev => ({ ...prev, category: e.target.value }))}
                      className="input"
                    >
                      <option value="general">Genel</option>
                      <option value="profile">Profil İçerikleri</option>
                      <option value="nav">Navigasyon</option>
                      <option value="hero">Ana Bölüm</option>
                      <option value="about">Hakkımda</option>
                      <option value="skills">Yetenekler</option>
                      <option value="projects">Projeler</option>
                      <option value="contact">İletişim</option>
                      <option value="footer">Alt Bilgi</option>
                      <option value="custom">Özel</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="label">Çeviriler</label>
                  {activeLanguages.length === 0 ? (
                    <p className="text-neutral-500 text-sm">Önce yukarıdan en az bir dili aktifleştirin</p>
                  ) : (
                    activeLanguages.map(lang => (
                      <div key={lang.code} className="flex items-start gap-3">
                        <span className="text-2xl pt-2">{lang.flag}</span>
                        <div className="flex-1">
                          <label className="text-xs text-neutral-500 mb-1 block">{lang.native_name}</label>
                          <textarea
                            value={newKey.translations[lang.code] || ''}
                            onChange={(e) => setNewKey(prev => ({
                              ...prev,
                              translations: { ...prev.translations, [lang.code]: e.target.value }
                            }))}
                            rows={2}
                            className="input w-full resize-none"
                            placeholder={`${lang.native_name} çevirisi`}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewKey({ key: '', category: 'general', translations: {} });
                  }}
                  className="btn-secondary"
                >
                  <HiOutlineX className="w-5 h-5" />
                  İptal
                </button>
                <button
                  onClick={addNewKey}
                  disabled={!newKey.key || activeLanguages.length === 0}
                  className="btn-primary"
                >
                  <HiOutlineCheck className="w-5 h-5" />
                  Ekle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TranslationsManagement;
