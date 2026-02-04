import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { skillsAPI } from '../services/api';
import { useTranslation } from '../store';

const Skills = () => {
  const { t } = useTranslation();
  const [groupedSkills, setGroupedSkills] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await skillsAPI.getGrouped();
        setGroupedSkills(response.data);
      } catch (error) {
        console.error('Skills fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const categories = ['all', ...Object.keys(groupedSkills)];
  
  const getFilteredSkills = () => {
    if (activeCategory === 'all') {
      return Object.values(groupedSkills).flat();
    }
    return groupedSkills[activeCategory] || [];
  };

  const filteredSkills = getFilteredSkills();

  if (loading) {
    return (
      <section className="section">
        <div className="container-custom">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-overline text-accent mb-4 block">{t('skills.title', 'Skills')}</span>
          <h2 className="heading-lg text-neutral-900 dark:text-white mb-4">
            {t('skills.subtitle', 'My Technical Skills')}
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            {t('skills.description', 'Technologies I use in robotics, autonomous systems and image processing')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              {category === 'all' ? t('projects.all', 'All') : category}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300"
            >
              {/* Skill name and percentage */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {skill.name}
                </h3>
                <span className="text-sm text-neutral-500">{skill.proficiency}%</span>
              </div>

              {/* Progress bar */}
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${skill.proficiency}%` } : { width: 0 }}
                  transition={{ duration: 1, delay: index * 0.05 + 0.3, ease: 'easeOut' }}
                  style={{ backgroundColor: skill.color || undefined }}
                />
              </div>

              {/* Category tag */}
              <div className="mt-4">
                <span className="text-xs text-neutral-400">{skill.category}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
