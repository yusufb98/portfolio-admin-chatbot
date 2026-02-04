import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { HiArrowUp } from 'react-icons/hi';
import { useTranslation } from '../store';

const Footer = ({ profile, settings }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: t('nav.home', 'Home'), href: '#hero' },
    { label: t('nav.about', 'About'), href: '#about' },
    { label: t('nav.skills', 'Skills'), href: '#skills' },
    { label: t('nav.projects', 'Projects'), href: '#projects' },
    { label: t('nav.contact', 'Contact'), href: '#contact' },
  ];

  const socialLinks = [
    { icon: FaGithub, href: profile?.github_url, label: 'GitHub' },
    { icon: FaLinkedin, href: profile?.linkedin_url, label: 'LinkedIn' },
    { icon: FaTwitter, href: profile?.twitter_url, label: 'Twitter' },
  ].filter(link => link.href);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="container-custom py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <a href="#hero" className="text-xl font-bold text-neutral-900 dark:text-white mb-4 block">
              {settings?.site_title || profile?.full_name || 'Portfolio'}
            </a>
            <p className="text-body mb-6">
              {profile?.title || 'Robotik ve Bilgisayarlı Görü Mühendisi'}
            </p>
            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-all duration-200"
                    aria-label={link.label}
                  >
                    <link.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-6">
              {t('footer.quick_links', 'Quick Links')}
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-6">
              {t('contact.title', 'Contact')}
            </h4>
            <ul className="space-y-3 text-neutral-600 dark:text-neutral-400">
              {profile?.email && (
                <li>
                  <a 
                    href={`mailto:${profile.email}`}
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {profile.email}
                  </a>
                </li>
              )}
              {profile?.phone && (
                <li>
                  <a 
                    href={`tel:${profile.phone}`}
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {profile.phone}
                  </a>
                </li>
              )}
              {profile?.location && (
                <li>{profile.location}</li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {currentYear} {profile?.full_name || 'Portfolio'}. {t('footer.rights', 'All rights reserved.')}
          </p>

          {/* Back to top */}
          <motion.button
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            whileHover={{ y: -2 }}
          >
            {t('footer.back_to_top', 'Back to top')}
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
              <HiArrowUp className="w-4 h-4" />
            </div>
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
