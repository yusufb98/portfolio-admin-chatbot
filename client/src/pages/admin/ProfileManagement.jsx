import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSave, HiOutlineUpload, HiOutlineLink, HiOutlinePhotograph } from 'react-icons/hi';
import { profileAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProfileManagement = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    title: '',
    bio: '',
    avatar_url: '',
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    email: '',
    phone: '',
    location: '',
    cv_url: '',
    hero_subtitle: '',
    years_experience: 0,
    projects_completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarMode, setAvatarMode] = useState('upload'); // 'upload' or 'url'
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileAPI.get();
        setProfile(response.data);
        // Set initial avatar URL input if exists
        if (response.data.avatar_url && !response.data.avatar_url.startsWith('/uploads')) {
          setAvatarUrlInput(response.data.avatar_url);
          setAvatarMode('url');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Profil yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await profileAPI.update(profile);
      toast.success('Profil başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Profil güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadAPI.upload(file, type);
      const uploadedUrl = response.data.url;
      setProfile(prev => ({
        ...prev,
        [type === 'avatar' ? 'avatar_url' : 'cv_url']: uploadedUrl
      }));
      if (type === 'avatar') {
        setAvatarUrlInput('');
      }
      toast.success('Dosya yüklendi!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Dosya yüklenemedi');
    }
  };

  const handleAvatarUrlSubmit = () => {
    if (!avatarUrlInput.trim()) {
      toast.error('Lütfen bir URL girin');
      return;
    }
    // Basic URL validation
    try {
      new URL(avatarUrlInput);
      setProfile(prev => ({ ...prev, avatar_url: avatarUrlInput.trim() }));
      toast.success('Resim URL\'si eklendi!');
    } catch {
      toast.error('Geçerli bir URL girin');
    }
  };

  // Get full image URL
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // For local uploads, prepend the API base URL
    const baseUrl = import.meta.env.VITE_API_URL || '';
    return `${baseUrl}${url}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-neutral-900 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Profil Bilgileri</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Portfolyonuzda görünecek kişisel bilgilerinizi düzenleyin</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar and basic info */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar upload/URL */}
            <div className="flex flex-col items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative">
                {profile.avatar_url ? (
                  <img
                    src={getImageUrl(profile.avatar_url)}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-neutral-200 dark:border-neutral-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect fill="%23374151" width="150" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="12"%3EResim Yüklenemedi%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center border-4 border-neutral-200 dark:border-neutral-700">
                    <HiOutlinePhotograph className="w-10 h-10 text-neutral-400" />
                  </div>
                )}
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setAvatarMode('upload')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    avatarMode === 'upload'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  <HiOutlineUpload className="w-4 h-4 inline mr-1" />
                  Yükle
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('url')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    avatarMode === 'url'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  <HiOutlineLink className="w-4 h-4 inline mr-1" />
                  URL
                </button>
              </div>

              {/* Upload or URL Input */}
              {avatarMode === 'upload' ? (
                <label className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                  <HiOutlineUpload className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Dosya Seç</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'avatar')}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex gap-2 w-full max-w-xs">
                  <input
                    type="text"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="input text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAvatarUrlSubmit}
                    className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <HiOutlineLink className="w-5 h-5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {avatarMode === 'upload' ? 'JPG, PNG - Max 5MB' : 'Direkt resim URL\'si girin'}
              </p>
            </div>

            {/* Name and title */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  İsim Soyisim
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Unvan / Başlık
                </label>
                <input
                  type="text"
                  name="title"
                  value={profile.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="Robotik & Bilgisayar Görüşü Mühendisi"
                />
              </div>
            </div>
          </div>

          {/* Hero subtitle */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Hero Alt Başlık
            </label>
            <input
              type="text"
              name="hero_subtitle"
              value={profile.hero_subtitle}
              onChange={handleChange}
              className="input"
              placeholder="ROS, Gazebo ve bilgisayar görüşü teknolojileri ile robotik sistemler geliştiriyorum"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Hakkımda
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              className="input resize-none"
              placeholder="Kendinizi tanıtan bir metin yazın..."
            />
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Deneyim (Yıl)
              </label>
              <input
                type="number"
                name="years_experience"
                value={profile.years_experience}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Tamamlanan Proje
              </label>
              <input
                type="number"
                name="projects_completed"
                value={profile.projects_completed}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>
          </div>

          {/* Contact info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="input"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone || ''}
                onChange={handleChange}
                className="input"
                placeholder="+90 xxx xxx xx xx"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Konum
            </label>
            <input
              type="text"
              name="location"
              value={profile.location}
              onChange={handleChange}
              className="input"
              placeholder="İstanbul, Türkiye"
            />
          </div>

          {/* Social links */}
          <div className="space-y-4">
            <h3 className="font-medium text-neutral-900 dark:text-white">Sosyal Medya Linkleri</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  GitHub
                </label>
                <input
                  type="url"
                  name="github_url"
                  value={profile.github_url || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={profile.linkedin_url || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  name="twitter_url"
                  value={profile.twitter_url || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              CV (PDF)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                name="cv_url"
                value={profile.cv_url || ''}
                onChange={handleChange}
                className="input flex-1"
                placeholder="CV URL veya dosya yükleyin"
              />
              <label className="btn-secondary cursor-pointer flex items-center gap-2">
                <HiOutlineUpload className="w-5 h-5" />
                Yükle
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, 'cv')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <HiOutlineSave className="w-5 h-5" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProfileManagement;
