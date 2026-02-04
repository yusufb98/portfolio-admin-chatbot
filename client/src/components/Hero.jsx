import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiArrowDown, HiOutlineDocumentDownload } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { useTranslation } from '../store';

const Hero = ({ profile, settings }) => {
  const { t } = useTranslation();
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = profile?.hero_subtitle || 'Otonom sistemler ve yapay zeka ile geleceği şekillendiriyorum';

  useEffect(() => {
    if (!isTyping) return;
    
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [fullText, isTyping]);

  const scrollToAbout = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: FaGithub, href: profile?.github_url, label: 'GitHub' },
    { icon: FaLinkedin, href: profile?.linkedin_url, label: 'LinkedIn' },
  ].filter(link => link.href);

  return (
    <section id="hero" className="relative min-h-screen flex items-center">
      {/* Subtle grid background */}
      <div className="absolute inset-0 grid-pattern" />
      
      {/* Gradient accents */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-emerald-50 dark:from-emerald-950/20 to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-neutral-100 dark:from-neutral-900 to-transparent" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="badge-accent">
              <span className="dot-indicator" />
              {t('hero.open_to_work', 'Open to new projects')}
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="heading-xl text-neutral-900 dark:text-white mb-4"
          >
            {profile?.full_name || 'Yusuf'}
          </motion.h1>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="heading-md text-neutral-500 dark:text-neutral-400 mb-6"
          >
            {profile?.title || 'Robotik & Görüntü İşleme Mühendisi'}
          </motion.h2>

          {/* Typed subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-body max-w-2xl mb-10 min-h-[60px]"
          >
            {displayText}
            {isTyping && <span className="cursor-blink text-emerald-500">|</span>}
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex gap-12 mb-10"
          >
            <div>
              <div className="text-4xl font-bold text-neutral-900 dark:text-white">
                {profile?.years_experience || 3}+
              </div>
              <div className="text-caption">{t('about.years_exp', 'Years Experience')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-neutral-900 dark:text-white">
                {profile?.projects_completed || 12}+
              </div>
              <div className="text-caption">{t('about.projects_done', 'Projects Completed')}</div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center gap-4"
          >
            <a href="#projects" className="btn-primary">
              {t('hero.view_projects', 'View Projects')}
            </a>
            {profile?.cv_url && (
              <a 
                href={profile.cv_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <HiOutlineDocumentDownload className="w-5 h-5" />
                {t('nav.download_cv', 'Download CV')}
              </a>
            )}
            
            {/* Social links */}
            <div className="flex items-center gap-2 ml-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-icon"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 btn-icon"
        aria-label={t('hero.scroll_down', 'Scroll down')}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <HiArrowDown className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default Hero;
