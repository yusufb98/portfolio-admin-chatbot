import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSave,
  HiOutlineX,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineLink,
  HiOutlineEye,
  HiOutlineEyeOff
} from 'react-icons/hi';
import { experiencesAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Experience type icons and labels
const experienceTypes = {
  work: { icon: HiOutlineBriefcase, label: 'İş Deneyimi', color: 'blue' },
  education: { icon: HiOutlineAcademicCap, label: 'Eğitim', color: 'green' },
  project: { icon: HiOutlineBriefcase, label: 'Proje', color: 'purple' },
  certificate: { icon: HiOutlineAcademicCap, label: 'Sertifika', color: 'amber' },
  event: { icon: HiOutlineCalendar, label: 'Etkinlik', color: 'rose' },
  other: { icon: HiOutlineBriefcase, label: 'Diğer', color: 'neutral' }
};

const ExperiencesManagement = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    organization: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    type: 'work',
    image_url: '',
    link_url: '',
    is_current: false,
    is_visible: true
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await experiencesAPI.getAllAdmin();
      setExperiences(response.data);
    } catch (error) {
      toast.error('Deneyimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      organization: '',
      description: '',
      start_date: '',
      end_date: '',
      location: '',
      type: 'work',
      image_url: '',
      link_url: '',
      is_current: false,
      is_visible: true
    });
    setEditingId(null);
  };

  const openModal = (experience = null) => {
    if (experience) {
      setForm({
        title: experience.title || '',
        organization: experience.organization || '',
        description: experience.description || '',
        start_date: experience.start_date || '',
        end_date: experience.end_date || '',
        location: experience.location || '',
        type: experience.type || 'work',
        image_url: experience.image_url || '',
        link_url: experience.link_url || '',
        is_current: !!experience.is_current,
        is_visible: experience.is_visible !== 0
      });
      setEditingId(experience.id);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title) {
      toast.error('Başlık zorunludur');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await experiencesAPI.update(editingId, form);
        toast.success('Deneyim güncellendi!');
      } else {
        await experiencesAPI.create(form);
        toast.success('Deneyim eklendi!');
      }
      closeModal();
      fetchExperiences();
    } catch (error) {
      toast.error(editingId ? 'Güncellenemedi' : 'Eklenemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu deneyimi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await experiencesAPI.delete(id);
      toast.success('Deneyim silindi!');
      fetchExperiences();
    } catch (error) {
      toast.error('Silinemedi');
    }
  };

  const toggleVisibility = async (experience) => {
    try {
      await experiencesAPI.update(experience.id, { is_visible: !experience.is_visible });
      toast.success(experience.is_visible ? 'Gizlendi' : 'Görünür yapıldı');
      fetchExperiences();
    } catch (error) {
      toast.error('Güncellenemedi');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadAPI.upload(file, 'experiences');
      setForm(prev => ({ ...prev, image_url: response.data.url }));
      toast.success('Resim yüklendi!');
    } catch (error) {
      toast.error('Resim yüklenemedi');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
  };

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
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Deneyimler & Etkinlikler</h1>
          <p className="text-neutral-500 text-sm">İş, eğitim ve etkinlik deneyimlerinizi yönetin</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <HiOutlinePlus className="w-5 h-5" />
          Yeni Deneyim
        </button>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
        {experiences.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <HiOutlineBriefcase className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
            <p className="text-neutral-500">Henüz deneyim eklenmemiş</p>
            <button 
              onClick={() => openModal()}
              className="btn-secondary mt-4"
            >
              <HiOutlinePlus className="w-5 h-5" />
              İlk Deneyimi Ekle
            </button>
          </div>
        ) : (
          experiences.map((exp, index) => {
            const TypeIcon = experienceTypes[exp.type]?.icon || HiOutlineBriefcase;
            const typeColor = experienceTypes[exp.type]?.color || 'neutral';
            
            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 ${
                  !exp.is_visible ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div className={`p-3 rounded-lg bg-${typeColor}-100 dark:bg-${typeColor}-900/30`}>
                    <TypeIcon className={`w-6 h-6 text-${typeColor}-600 dark:text-${typeColor}-400`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {exp.title}
                          {exp.is_current && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                              Devam Ediyor
                            </span>
                          )}
                        </h3>
                        {exp.organization && (
                          <p className="text-neutral-600 dark:text-neutral-400">{exp.organization}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleVisibility(exp)}
                          className={`p-2 rounded-lg transition-colors ${
                            exp.is_visible
                              ? 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                              : 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                          }`}
                          title={exp.is_visible ? 'Gizle' : 'Görünür Yap'}
                        >
                          {exp.is_visible ? <HiOutlineEye className="w-5 h-5" /> : <HiOutlineEyeOff className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => openModal(exp)}
                          className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-neutral-500">
                      {(exp.start_date || exp.end_date) && (
                        <span className="flex items-center gap-1">
                          <HiOutlineCalendar className="w-4 h-4" />
                          {formatDate(exp.start_date)} - {exp.is_current ? 'Devam Ediyor' : formatDate(exp.end_date)}
                        </span>
                      )}
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <HiOutlineLocationMarker className="w-4 h-4" />
                          {exp.location}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full bg-${typeColor}-100 text-${typeColor}-700 dark:bg-${typeColor}-900/30 dark:text-${typeColor}-400`}>
                        {experienceTypes[exp.type]?.label || exp.type}
                      </span>
                    </div>
                    
                    {exp.description && (
                      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {exp.description}
                      </p>
                    )}
                    
                    {exp.link_url && (
                      <a 
                        href={exp.link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <HiOutlineLink className="w-4 h-4" />
                        Link
                      </a>
                    )}
                  </div>
                  
                  {/* Image */}
                  {exp.image_url && (
                    <img 
                      src={exp.image_url} 
                      alt={exp.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {editingId ? 'Deneyimi Düzenle' : 'Yeni Deneyim'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Başlık *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      className="input"
                      placeholder="Yazılım Mühendisi"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Kurum/Şirket
                    </label>
                    <input
                      type="text"
                      value={form.organization}
                      onChange={(e) => setForm(prev => ({ ...prev, organization: e.target.value }))}
                      className="input"
                      placeholder="ABC Teknoloji A.Ş."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="input min-h-[100px]"
                    placeholder="Bu pozisyonda yaptığınız işleri açıklayın..."
                  />
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Tür
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                      className="input"
                    >
                      {Object.entries(experienceTypes).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Başlangıç Tarihi
                    </label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                      className="input"
                      disabled={form.is_current}
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Konum
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                      className="input"
                      placeholder="İstanbul, Türkiye"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Link (URL)
                    </label>
                    <input
                      type="url"
                      value={form.link_url}
                      onChange={(e) => setForm(prev => ({ ...prev, link_url: e.target.value }))}
                      className="input"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Resim (URL veya Yükle)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={form.image_url}
                      onChange={(e) => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                      className="input flex-1"
                      placeholder="https://example.com/image.jpg"
                    />
                    <label className="btn-secondary cursor-pointer whitespace-nowrap">
                      📁 Yükle
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Harici URL yapıştırın veya dosya yükleyin
                  </p>
                  {form.image_url && (
                    <div className="mt-2 relative inline-block">
                      <img 
                        src={form.image_url} 
                        alt="Preview" 
                        className="w-32 h-20 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="80" viewBox="0 0 128 80"><rect fill="%23374151" width="128" height="80"/><text fill="%239CA3AF" font-size="10" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Resim yüklenemedi</text></svg>';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_current}
                      onChange={(e) => setForm(prev => ({ 
                        ...prev, 
                        is_current: e.target.checked,
                        end_date: e.target.checked ? '' : prev.end_date
                      }))}
                      className="w-4 h-4 rounded border-neutral-300"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Devam Ediyor</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_visible}
                      onChange={(e) => setForm(prev => ({ ...prev, is_visible: e.target.checked }))}
                      className="w-4 h-4 rounded border-neutral-300"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Sitede Görünür</span>
                  </label>
                </div>
              </form>
              
              <div className="flex justify-end gap-3 p-6 border-t border-neutral-200 dark:border-neutral-800">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  İptal
                </button>
                <button onClick={handleSubmit} disabled={saving} className="btn-primary">
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <HiOutlineSave className="w-5 h-5" />
                  )}
                  {editingId ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExperiencesManagement;
