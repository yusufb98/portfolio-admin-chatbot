import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineBriefcase, 
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineExternalLink
} from 'react-icons/hi';
import { experiencesAPI } from '../services/api';
import { useTranslation } from '../store';

// Helper function to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // For relative URLs, they should work as-is since nginx serves /uploads
  return url;
};

// Experience type icons and colors
const experienceTypes = {
  work: { icon: HiOutlineBriefcase, label: 'İş', bgColor: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-900/30' },
  education: { icon: HiOutlineAcademicCap, label: 'Eğitim', bgColor: 'bg-green-500', lightBg: 'bg-green-50 dark:bg-green-900/30' },
  project: { icon: HiOutlineBriefcase, label: 'Proje', bgColor: 'bg-purple-500', lightBg: 'bg-purple-50 dark:bg-purple-900/30' },
  certificate: { icon: HiOutlineAcademicCap, label: 'Sertifika', bgColor: 'bg-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-900/30' },
  event: { icon: HiOutlineCalendar, label: 'Etkinlik', bgColor: 'bg-rose-500', lightBg: 'bg-rose-50 dark:bg-rose-900/30' },
  other: { icon: HiOutlineBriefcase, label: 'Diğer', bgColor: 'bg-neutral-500', lightBg: 'bg-neutral-50 dark:bg-neutral-800/50' }
};

const Experiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { t } = useTranslation();

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await experiencesAPI.getAll();
      setExperiences(response.data);
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
  };

  // Get unique types from experiences
  const types = ['all', ...new Set(experiences.map(exp => exp.type))];
  
  const filteredExperiences = filter === 'all' 
    ? experiences 
    : experiences.filter(exp => exp.type === filter);

  if (loading) {
    return (
      <section id="experiences" className="py-20 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (experiences.length === 0) {
    return null;
  }

  return (
    <section id="experiences" className="py-20 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            {t('experiences.title', 'Deneyimler')}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {t('experiences.subtitle', 'İş deneyimlerim, eğitimlerim ve katıldığım etkinlikler')}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        {types.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {types.map((type) => {
              const typeInfo = type === 'all' ? { label: t('common.all', 'Tümü') } : experienceTypes[type];
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    filter === type
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  {typeInfo?.label || type}
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800 transform md:-translate-x-1/2"></div>

            {filteredExperiences.map((exp, index) => {
              const TypeIcon = experienceTypes[exp.type]?.icon || HiOutlineBriefcase;
              const bgColor = experienceTypes[exp.type]?.bgColor || 'bg-neutral-500';
              const lightBg = experienceTypes[exp.type]?.lightBg || 'bg-neutral-50';
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative mb-8 md:mb-12 ${
                    isLeft ? 'md:pr-[50%] md:text-right' : 'md:pl-[50%] md:text-left'
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 md:left-1/2 top-0 w-4 h-4 rounded-full ${bgColor} transform md:-translate-x-1/2 z-10 ring-4 ring-white dark:ring-neutral-950`}></div>

                  {/* Content Card */}
                  <div className={`ml-8 md:ml-0 ${isLeft ? 'md:mr-8' : 'md:ml-8'}`}>
                    <div className={`${lightBg} rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800 hover:shadow-md transition-shadow`}>
                      {/* Header */}
                      <div className={`flex items-start gap-4 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                        <div className={`p-3 rounded-xl ${bgColor} text-white flex-shrink-0`}>
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        <div className={`flex-1 ${isLeft ? 'md:text-right' : ''}`}>
                          <h3 className="font-bold text-neutral-900 dark:text-white text-lg">
                            {exp.title}
                            {exp.is_current && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                                {t('experiences.current', 'Devam Ediyor')}
                              </span>
                            )}
                          </h3>
                          {exp.organization && (
                            <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                              {exp.organization}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className={`flex flex-wrap items-center gap-4 mt-4 text-sm text-neutral-500 ${isLeft ? 'md:justify-end' : ''}`}>
                        {(exp.start_date || exp.end_date) && (
                          <span className="flex items-center gap-1">
                            <HiOutlineCalendar className="w-4 h-4" />
                            {formatDate(exp.start_date)}
                            {(exp.end_date || exp.is_current) && ' - '}
                            {exp.is_current ? t('experiences.present', 'Günümüz') : formatDate(exp.end_date)}
                          </span>
                        )}
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <HiOutlineLocationMarker className="w-4 h-4" />
                            {exp.location}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {exp.description && (
                        <p className={`mt-4 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed ${isLeft ? 'md:text-right' : ''}`}>
                          {exp.description}
                        </p>
                      )}

                      {/* Link */}
                      {exp.link_url && (
                        <div className={`mt-4 ${isLeft ? 'md:text-right' : ''}`}>
                          <a
                            href={exp.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <HiOutlineExternalLink className="w-4 h-4" />
                            {t('common.more', 'Daha fazla')}
                          </a>
                        </div>
                      )}

                      {/* Image */}
                      {exp.image_url && (
                        <div className="mt-4">
                          <img
                            src={getImageUrl(exp.image_url)}
                            alt={exp.title}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              // Hide broken image
                              e.target.parentElement.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experiences;
