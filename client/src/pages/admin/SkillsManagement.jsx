import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlinePlus, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiX, 
  HiOutlineFolder,
  HiOutlineColorSwatch
} from 'react-icons/hi';
import { skillsAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Default categories (used if no custom categories exist)
const defaultCategories = [
  'ROS & Robotik',
  'Görüntü İşleme', 
  'Programlama',
  'Araçlar',
  'Diğer'
];

const SkillsManagement = () => {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    proficiency: 80,
    icon: '',
    color: '#10b981'
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '',
    color: '#6366f1'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [skillsRes, categoriesRes] = await Promise.all([
        skillsAPI.getAll(),
        skillsAPI.getCategories()
      ]);
      setSkills(skillsRes.data);
      
      // Use custom categories if exist, otherwise use default
      const cats = categoriesRes.data?.length > 0 
        ? categoriesRes.data.map(c => c.name) 
        : defaultCategories;
      setCategories(cats);
      
      // Set default category in form
      if (cats.length > 0) {
        setFormData(prev => ({ ...prev, category: cats[0] }));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setCategories(defaultCategories);
      setFormData(prev => ({ ...prev, category: defaultCategories[0] }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (skill = null) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name,
        category: skill.category,
        proficiency: skill.proficiency,
        icon: skill.icon || '',
        color: skill.color || '#10b981'
      });
    } else {
      setEditingSkill(null);
      setFormData({
        name: '',
        category: categories[0] || 'Diğer',
        proficiency: 80,
        icon: '',
        color: '#10b981'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSkill(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSkill) {
        await skillsAPI.update(editingSkill.id, formData);
        toast.success('Yetenek güncellendi!');
      } else {
        await skillsAPI.create(formData);
        toast.success('Yetenek eklendi!');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu yeteneği silmek istediğinizden emin misiniz?')) return;

    try {
      await skillsAPI.delete(id);
      toast.success('Yetenek silindi!');
      fetchData();
    } catch (error) {
      toast.error('Yetenek silinemedi');
    }
  };

  // Category management
  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        icon: category.icon || '',
        color: category.color || '#6366f1'
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        icon: '',
        color: '#6366f1'
      });
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await skillsAPI.updateCategory(editingCategory.id, categoryForm);
        toast.success('Kategori güncellendi!');
      } else {
        await skillsAPI.createCategory(categoryForm);
        toast.success('Kategori eklendi!');
      }
      closeCategoryModal();
      fetchData();
    } catch (error) {
      if (error.response?.data?.error === 'Category already exists') {
        toast.error('Bu kategori zaten mevcut');
      } else {
        toast.error('İşlem başarısız');
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategorideki yetenekler "Diğer" kategorisine taşınacak.')) return;

    try {
      await skillsAPI.deleteCategory(id);
      toast.success('Kategori silindi!');
      fetchData();
    } catch (error) {
      toast.error('Kategori silinemedi');
    }
  };

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

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
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Yetenekler</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Teknik yeteneklerinizi yönetin</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openCategoryModal()} className="btn-secondary flex items-center gap-2">
            <HiOutlineFolder className="w-5 h-5" />
            Kategori Ekle
          </button>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <HiOutlinePlus className="w-5 h-5" />
            Yeni Yetenek
          </button>
        </div>
      </div>

      {/* Skills by category */}
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <div key={category} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="font-semibold text-neutral-900 dark:text-white">{category}</h2>
          </div>
          <div className="p-4 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categorySkills.map((skill) => (
              <motion.div
                key={skill.id}
                layout
                className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: skill.color || '#10b981' }}
                    >
                      {skill.name.charAt(0)}
                    </div>
                    <span className="font-medium text-neutral-900 dark:text-white">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(skill)}
                      className="p-1 rounded text-neutral-400 hover:text-blue-500 transition-colors"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="p-1 rounded text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="relative h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ 
                      width: `${skill.proficiency}%`,
                      backgroundColor: skill.color || '#10b981'
                    }}
                  />
                </div>
                <div className="mt-1 text-right text-xs text-neutral-500">{skill.proficiency}%</div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {skills.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">Henüz yetenek eklenmemiş</p>
          <button onClick={() => openModal()} className="btn-primary">
            İlk Yeteneği Ekle
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
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {editingSkill ? 'Yeteneği Düzenle' : 'Yeni Yetenek'}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <HiX className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">İsim</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="ROS, OpenCV, Python vb."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Kategori</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="input">
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Seviye: {formData.proficiency}%
                  </label>
                  <input
                    type="range"
                    name="proficiency"
                    value={formData.proficiency}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Icon Key</label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon}
                      onChange={handleChange}
                      className="input"
                      placeholder="ros, opencv, python vb."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Renk</label>
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="input h-10 p-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-ghost">İptal</button>
                  <button type="submit" className="btn-primary">
                    {editingSkill ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={closeCategoryModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
                </h2>
                <button onClick={closeCategoryModal} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <HiX className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Kategori Adı</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Örn: Yapay Zeka, Web Geliştirme"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Icon (opsiyonel)</label>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                      className="input"
                      placeholder="ai, web, robot"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Renk</label>
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                      className="input h-10 p-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={closeCategoryModal} className="btn-ghost">İptal</button>
                  <button type="submit" className="btn-primary">
                    {editingCategory ? 'Güncelle' : 'Ekle'}
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

export default SkillsManagement;
