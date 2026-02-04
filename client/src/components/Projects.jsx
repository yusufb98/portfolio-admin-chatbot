import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiOutlineExternalLink, HiOutlineCode, HiX, HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';
import { projectsAPI } from '../services/api';
import { useTranslation } from '../store';

// Helper function to parse technologies
const parseTechnologies = (tech) => {
  if (!tech) return [];
  if (Array.isArray(tech)) return tech;
  if (typeof tech === 'string') return tech.split(',').map(t => t.trim()).filter(Boolean);
  return [];
};

const Projects = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsAPI.getAll();
        setProjects(response.data);
      } catch (error) {
        console.error('Projects fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const categories = ['all', ...new Set(projects.map(p => p.category).filter(Boolean))];
  
  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  const currentIndex = selectedProject ? filteredProjects.findIndex(p => p.id === selectedProject.id) : -1;

  const navigateProject = (direction) => {
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedProject(filteredProjects[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < filteredProjects.length - 1) {
      setSelectedProject(filteredProjects[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <section className="section bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container-custom">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section bg-neutral-50 dark:bg-neutral-900/50">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-overline text-accent mb-4 block">{t('projects.title', 'Projects')}</span>
          <h2 className="heading-lg text-neutral-900 dark:text-white mb-4">
            {t('projects.subtitle', 'My Recent Work')}
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            {t('projects.description', 'My work in robotics, autonomous systems and image processing')}
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {category === 'all' ? 'Tümü' : category}
              </button>
            ))}
          </div>
        )}

        {/* Projects Grid */}
        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="card-hover overflow-hidden">
                {/* Image */}
                <div className="aspect-video overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HiOutlineCode className="w-12 h-12 text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category */}
                  {project.category && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2 block">
                      {project.category}
                    </span>
                  )}
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {project.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
                    {project.short_description || project.description}
                  </p>

                  {/* Technologies */}
                  {project.technologies && parseTechnologies(project.technologies).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {parseTechnologies(project.technologies).slice(0, 3).map((tech, i) => (
                        <span key={i} className="tag">
                          {tech}
                        </span>
                      ))}
                      {parseTechnologies(project.technologies).length > 3 && (
                        <span className="tag">+{parseTechnologies(project.technologies).length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500">{t('projects.no_projects', 'No projects found in this category.')}</p>
          </div>
        )}
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 btn-icon bg-white/90 dark:bg-neutral-800/90"
              >
                <HiX className="w-5 h-5" />
              </button>

              {/* Navigation buttons */}
              {currentIndex > 0 && (
                <button
                  onClick={() => navigateProject('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 btn-icon bg-white/90 dark:bg-neutral-800/90"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
              )}
              {currentIndex < filteredProjects.length - 1 && (
                <button
                  onClick={() => navigateProject('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 btn-icon bg-white/90 dark:bg-neutral-800/90"
                >
                  <HiArrowRight className="w-5 h-5" />
                </button>
              )}

              {/* Image */}
              <div className="aspect-video bg-neutral-200 dark:bg-neutral-800">
                {selectedProject.image_url ? (
                  <img
                    src={selectedProject.image_url}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiOutlineCode className="w-16 h-16 text-neutral-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8">
                {selectedProject.category && (
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2 block">
                    {selectedProject.category}
                  </span>
                )}
                
                <h2 className="heading-md text-neutral-900 dark:text-white mb-4">
                  {selectedProject.title}
                </h2>
                
                <p className="text-body mb-6">
                  {selectedProject.description}
                </p>

                {/* Technologies */}
                {selectedProject.technologies && parseTechnologies(selectedProject.technologies).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                      {t('projects.technologies', 'Technologies')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {parseTechnologies(selectedProject.technologies).map((tech, i) => (
                        <span key={i} className="tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-3">
                  {selectedProject.live_url && (
                    <a
                      href={selectedProject.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      <HiOutlineExternalLink className="w-5 h-5" />
                      {t('projects.live_demo', 'Live Demo')}
                    </a>
                  )}
                  {selectedProject.github_url && (
                    <a
                      href={selectedProject.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                    >
                      <FaGithub className="w-5 h-5" />
                      {t('projects.source_code', 'Source Code')}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;
