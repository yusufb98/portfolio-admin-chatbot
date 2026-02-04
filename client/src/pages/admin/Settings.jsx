import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineSave,
  HiOutlineKey,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCog,
  HiOutlineInformationCircle,
  HiOutlineShare,
  HiOutlineGlobeAlt
} from 'react-icons/hi';
import { authAPI, settingsAPI, translationsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('password');
  const [siteSettings, setSiteSettings] = useState({});
  const [languages, setLanguages] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState('tr');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [settingsRes, langsRes, defaultLangRes] = await Promise.all([
        settingsAPI.get(),
        translationsAPI.getAllLanguages(),
        translationsAPI.getDefaultLanguage()
      ]);
      setSiteSettings(settingsRes.data || {});
      setLanguages(langsRes.data || []);
      setDefaultLanguage(defaultLangRes.data?.code || 'tr');
    } catch (error) {
      console.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDefaultLanguageChange = async (code) => {
    try {
      await translationsAPI.setDefaultLanguage(code);
      setDefaultLanguage(code);
      toast.success('Varsayılan dil güncellendi!');
    } catch (error) {
      toast.error('Dil güncellenemedi');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalı!');
      return;
    }

    setSaving(true);
    try {
      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Şifre başarıyla değiştirildi!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Şifre değiştirilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSiteSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(siteSettings);
      toast.success('Ayarlar kaydedildi!');
    } catch (error) {
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-800 dark:text-white">Ayarlar</h1>
        <p className="text-neutral-500 text-sm">Hesap ve site ayarlarını yönetin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'password'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          <HiOutlineKey className="w-5 h-5 inline mr-2" />
          Şifre Değiştir
        </button>
        <button
          onClick={() => setActiveTab('site')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'site'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          <HiOutlineCog className="w-5 h-5 inline mr-2" />
          Site Ayarları
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'seo'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          <HiOutlineShare className="w-5 h-5 inline mr-2" />
          SEO & Meta Tags
        </button>
      </div>

      {/* Password Tab */}
      {activeTab === 'password' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <HiOutlineInformationCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Güvenli bir şifre için en az 6 karakter, büyük/küçük harf ve rakam kullanın.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Mevcut Şifre
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPasswords.current ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="input pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPasswords.new ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="input pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPasswords.confirm ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <HiOutlineKey className="w-5 h-5" />
                )}
                Şifreyi Değiştir
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Site Settings Tab */}
      {activeTab === 'site' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Site Başlığı
                </label>
                <input
                  type="text"
                  value={siteSettings.site_title || ''}
                  onChange={(e) => handleSettingChange('site_title', e.target.value)}
                  className="input"
                  placeholder="Portfolyo - İsim Soyisim"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Site Açıklaması (SEO)
                </label>
                <input
                  type="text"
                  value={siteSettings.site_description || ''}
                  onChange={(e) => handleSettingChange('site_description', e.target.value)}
                  className="input"
                  placeholder="Kısa site açıklaması"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Anahtar Kelimeler (SEO)
                </label>
                <input
                  type="text"
                  value={siteSettings.site_keywords || ''}
                  onChange={(e) => handleSettingChange('site_keywords', e.target.value)}
                  className="input"
                  placeholder="portfolyo, web geliştirici, react"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={siteSettings.google_analytics || ''}
                  onChange={(e) => handleSettingChange('google_analytics', e.target.value)}
                  className="input"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-neutral-800 dark:text-white">Görünüm Ayarları</h3>
              
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <div>
                  <h4 className="font-medium text-neutral-700 dark:text-neutral-300">Varsayılan Dil</h4>
                  <p className="text-sm text-neutral-500">Site ilk açıldığında hangi dil kullanılsın</p>
                </div>
                <select
                  value={defaultLanguage}
                  onChange={(e) => handleDefaultLanguageChange(e.target.value)}
                  className="input w-auto"
                >
                  {languages.filter(l => l.is_active).map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.native_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <div>
                  <h4 className="font-medium text-neutral-700 dark:text-neutral-300">Varsayılan Tema</h4>
                  <p className="text-sm text-neutral-500">Site ilk açıldığında hangi tema kullanılsın</p>
                </div>
                <select
                  value={siteSettings.default_theme || 'system'}
                  onChange={(e) => handleSettingChange('default_theme', e.target.value)}
                  className="input w-auto"
                >
                  <option value="system">Sistem</option>
                  <option value="light">Açık</option>
                  <option value="dark">Koyu</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <div>
                  <h4 className="font-medium text-neutral-700 dark:text-neutral-300">Bakım Modu</h4>
                  <p className="text-sm text-neutral-500">Siteyi geçici olarak kapatır</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteSettings.maintenance_mode || false}
                    onChange={(e) => handleSettingChange('maintenance_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 dark:peer-focus:ring-white rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-700 peer-checked:bg-neutral-900 dark:peer-checked:bg-white"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button onClick={saveSettings} disabled={saving} className="btn-primary flex items-center gap-2">
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

      {/* SEO & Meta Tags Tab */}
      {activeTab === 'seo' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Browser Tab Settings */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h3 className="font-semibold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
              <HiOutlineGlobeAlt className="w-5 h-5" />
              Tarayıcı Sekmesi Ayarları
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              Tarayıcı sekmesinde görünecek başlık ve favicon ayarları
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Sekme Başlığı (Tab Title)
                </label>
                <input
                  type="text"
                  value={siteSettings.tab_title || ''}
                  onChange={(e) => handleSettingChange('tab_title', e.target.value)}
                  className="input"
                  placeholder="Yusuf Baykan | Robotik & CV Mühendisi"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Tarayıcı sekmesinde görünecek başlık
                </p>
              </div>
            </div>
          </div>

          {/* Open Graph Meta Tags */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h3 className="font-semibold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
              <HiOutlineShare className="w-5 h-5" />
              Open Graph (Link Paylaşım Önizleme)
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              Sosyal medyada link paylaşıldığında görünecek bilgiler (WhatsApp, Twitter, LinkedIn vb.)
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  OG Başlık
                </label>
                <input
                  type="text"
                  value={siteSettings.og_title || ''}
                  onChange={(e) => handleSettingChange('og_title', e.target.value)}
                  className="input"
                  placeholder="Yusuf Baykan - Robotik & Bilgisayarlı Görü Mühendisi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  OG Açıklama
                </label>
                <textarea
                  value={siteSettings.og_description || ''}
                  onChange={(e) => handleSettingChange('og_description', e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Robotik ve bilgisayarlı görü alanında uzmanlaşmış bir mühendis. ROS2, otonom sistemler ve yapay zeka projelerim."
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Link paylaşıldığında görünecek açıklama (max 160 karakter önerilir)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  OG Resim URL
                </label>
                <input
                  type="url"
                  value={siteSettings.og_image || ''}
                  onChange={(e) => handleSettingChange('og_image', e.target.value)}
                  className="input"
                  placeholder="https://yusufbaykan.com/og-image.jpg"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Önerilen boyut: 1200x630 piksel. Tam URL olmalı.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Site URL
                </label>
                <input
                  type="url"
                  value={siteSettings.og_url || ''}
                  onChange={(e) => handleSettingChange('og_url', e.target.value)}
                  className="input"
                  placeholder="https://yusufbaykan.com"
                />
              </div>
            </div>

            {/* Preview Card */}
            <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
                📱 Önizleme (Link Paylaşım Görünümü)
              </p>
              <div className="max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden shadow-sm">
                {siteSettings.og_image && (
                  <img 
                    src={siteSettings.og_image} 
                    alt="OG Preview" 
                    className="w-full h-32 object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="p-3">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                    {siteSettings.og_url?.replace('https://', '').replace('http://', '') || 'yusufbaykan.com'}
                  </p>
                  <p className="font-semibold text-neutral-800 dark:text-white text-sm line-clamp-2">
                    {siteSettings.og_title || 'OG Başlık girilmedi'}
                  </p>
                  <p className="text-sm text-neutral-500 line-clamp-2 mt-1">
                    {siteSettings.og_description || 'OG Açıklama girilmedi'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Twitter Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">
              🐦 Twitter Card
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Twitter Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={siteSettings.twitter_handle || ''}
                  onChange={(e) => handleSettingChange('twitter_handle', e.target.value)}
                  className="input"
                  placeholder="@yusufbaykan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Twitter Card Tipi
                </label>
                <select
                  value={siteSettings.twitter_card_type || 'summary_large_image'}
                  onChange={(e) => handleSettingChange('twitter_card_type', e.target.value)}
                  className="input"
                >
                  <option value="summary">Özet (Küçük Resim)</option>
                  <option value="summary_large_image">Büyük Resim</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={saveSettings} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <HiOutlineSave className="w-5 h-5" />
              )}
              Kaydet
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Settings;
