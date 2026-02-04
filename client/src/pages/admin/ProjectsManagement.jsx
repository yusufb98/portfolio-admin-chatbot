import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlinePlus, 
  HiOutlinePencil, 
  HiOutlineTrash,
  HiOutlineStar,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiX
} from 'react-icons/hi';
import { projectsAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    image_url: '',
    live_url: '',
    github_url: '',
    technologies: '',
    category: 'Robotics',
    featured: false,
    is_visible: true
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAllAdmin();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Projeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadAPI.upload(file, 'projects');
      setFormData(prev => ({ ...prev, image_url: response.data.url }));
      toast.success('Resim yüklendi!');
    } catch (error) {
      toast.error('Resim yüklenemedi');
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description || '',
        short_description: project.short_description || '',
        image_url: project.image_url || '',
        live_url: project.live_url || '',
        github_url: project.github_url || '',
        technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || '',
        category: project.category || 'Robotics',
        featured: project.featured === 1,
        is_visible: project.is_visible === 1
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        short_description: '',
        image_url: '',
        live_url: '',
        github_url: '',
        technologies: '',
        category: 'Robotics',
        featured: false,
        is_visible: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const projectData = {
      ...formData,
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      if (editingProject) {
        await projectsAPI.update(editingProject.id, projectData);
        toast.success('Proje güncellendi!');
      } else {
        await projectsAPI.create(projectData);
        toast.success('Proje oluşturuldu!');
      }
      closeModal();
      fetchProjects();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return;

    try {
      await projectsAPI.delete(id);
      toast.success('Proje silindi!');
      fetchProjects();
    } catch (error) {
      toast.error('Proje silinemedi');
    }
  };

  const toggleFeatured = async (project) => {
    try {
      await projectsAPI.update(project.id, { featured: !project.featured });
      fetchProjects();
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const toggleVisibility = async (project) => {
    try {
      await projectsAPI.update(project.id, { is_visible: !project.is_visible });
      fetchProjects();
    } catch (error) {
      toast.error('Güncelleme başarısız');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Projeler</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Portfolyonuzdaki projeleri yönetin</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" />
          Yeni Proje
        </button>
      </div>

      {/* Projects grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white dark:bg-neutral-900 rounded-xl border overflow-hidden ${
              !project.is_visible ? 'opacity-60' : ''
            } ${project.featured ? 'border-emerald-500' : 'border-neutral-200 dark:border-neutral-800'}`}
          >
            {/* Image */}
            <div className="aspect-video relative overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img
                src={project.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect fill="%23e5e5e5" width="400" height="225"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23737373" font-family="sans-serif" font-size="16"%3EProje Görseli%3C/text%3E%3C/svg%3E'}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              {project.featured === 1 && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs rounded-full flex items-center gap-1">
                  <HiOutlineStar className="w-3 h-3" /> Öne Çıkan
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{project.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2">
                {project.short_description || project.description}
              </p>
              
              {/* Technologies */}
              <div className="flex flex-wrap gap-1 mb-4">
                {project.technologies?.slice(0, 3).map((tech, i) => (
                  <span key={i} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs rounded text-neutral-600 dark:text-neutral-400">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFeatured(project)}
                    className={`p-2 rounded-lg transition-colors ${
                      project.featured ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title={project.featured ? 'Öne çıkarmayı kaldır' : 'Öne çıkar'}
                  >
                    <HiOutlineStar className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleVisibility(project)}
                    className={`p-2 rounded-lg transition-colors ${
                      project.is_visible ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title={project.is_visible ? 'Gizle' : 'Göster'}
                  >
                    {project.is_visible ? <HiOutlineEye className="w-5 h-5" /> : <HiOutlineEyeOff className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(project)}
                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Düzenle"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Sil"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">Henüz proje eklenmemiş</p>
          <button onClick={() => openModal()} className="btn-primary">
            İlk Projeyi Ekle
          </button>
        </div>
      )}

      {/* Modal */}
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
              className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white dark:bg-neutral-900 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {editingProject ? 'Projeyi Düzenle' : 'Yeni Proje'}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <HiX className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Başlık</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Kısa Açıklama</label>
                  <input
                    type="text"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    className="input"
                    placeholder="Kartlarda görünecek kısa açıklama"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Detaylı Açıklama</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="input resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Proje Resmi</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      className="input flex-1"
                      placeholder="Resim URL veya yükleyin"
                    />
                    <label className="btn-secondary cursor-pointer">
                      Yükle
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Canlı URL</label>
                    <input
                      type="url"
                      name="live_url"
                      value={formData.live_url}
                      onChange={handleChange}
                      className="input"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">GitHub URL</label>
                    <input
                      type="url"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleChange}
                      className="input"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Teknolojiler</label>
                    <input
                      type="text"
                      name="technologies"
                      value={formData.technologies}
                      onChange={handleChange}
                      className="input"
                      placeholder="ROS, Gazebo, OpenCV"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Kategori</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="input">
                      <option value="Robotics">Robotics</option>
                      <option value="Computer Vision">Computer Vision</option>
                      <option value="Simulation">Simulation</option>
                      <option value="Autonomous Systems">Autonomous Systems</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Öne Çıkan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_visible"
                      checked={formData.is_visible}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Görünür</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button type="button" onClick={closeModal} className="btn-ghost">
                    İptal
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProject ? 'Güncelle' : 'Oluştur'}
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

export default ProjectsManagement;
