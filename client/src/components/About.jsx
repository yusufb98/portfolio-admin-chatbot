import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlineDocumentDownload } from 'react-icons/hi';
import { useTranslation } from '../store';

// Get full image URL helper
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // For local uploads, use relative path from API
  return url;
};

const About = ({ profile }) => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const avatarUrl = getImageUrl(profile?.avatar_url);

  return (
    <section id="about" className="section bg-neutral-50 dark:bg-neutral-900/50">
      <div className="container-custom">
        <div ref={ref} className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile?.full_name || 'Profile'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-full h-full items-center justify-center text-neutral-400 ${avatarUrl ? 'hidden' : 'flex'}`}
              >
                <span className="text-8xl font-bold">
                  {profile?.full_name?.charAt(0) || 'Y'}
                </span>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-neutral-900 dark:border-white rounded-2xl -z-10" />
          </motion.div>

          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-overline text-accent mb-4 block">{t('about.title', 'About Me')}</span>
            <h2 className="heading-lg text-neutral-900 dark:text-white mb-6">
              {t('hero.greeting', 'Hello, I am')} {profile?.full_name?.split(' ')[0] || 'Yusuf'}
            </h2>
            
            <div className="text-body space-y-4 mb-8">
              <p>{profile?.bio || 'Robotik ve görüntü işleme alanında uzman bir mühendisim.'}</p>
            </div>

            {/* Info items */}
            <div className="space-y-4 mb-8">
              {profile?.location && (
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                  <HiOutlineLocationMarker className="w-5 h-5 text-neutral-400" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.email && (
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                  <HiOutlineMail className="w-5 h-5 text-neutral-400" />
                  <a href={`mailto:${profile.email}`} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                    {profile.email}
                  </a>
                </div>
              )}
            </div>

            {/* CTA */}
            {profile?.cv_url && (
              <a 
                href={profile.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <HiOutlineDocumentDownload className="w-5 h-5" />
                {t('nav.download_cv', 'Download CV')}
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
