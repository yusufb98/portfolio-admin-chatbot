import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlinePhone, HiArrowRight } from 'react-icons/hi';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { contactAPI } from '../services/api';
import { useTranslation } from '../store';
import toast from 'react-hot-toast';

const Contact = ({ profile }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactAPI.submit(formData);
      toast.success(t('contact.success', 'Message sent successfully!'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(t('contact.error', 'Failed to send message. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    { icon: FaGithub, href: profile?.github_url, label: 'GitHub' },
    { icon: FaLinkedin, href: profile?.linkedin_url, label: 'LinkedIn' },
    { icon: FaTwitter, href: profile?.twitter_url, label: 'Twitter' },
  ].filter(link => link.href);

  return (
    <section id="contact" className="section">
      <div className="container-custom">
        <div ref={ref} className="grid lg:grid-cols-2 gap-16">
          {/* Left side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-overline text-accent mb-4 block">{t('contact.title', 'Contact')}</span>
            <h2 className="heading-lg text-neutral-900 dark:text-white mb-6">
              {t('contact.subtitle', 'Get In Touch')}
            </h2>
            <p className="text-body mb-10">
              {t('contact.description', 'Feel free to contact me for new projects, collaborations, or just to say hello.')}
            </p>

            {/* Contact info */}
            <div className="space-y-6 mb-10">
              {profile?.email && (
                <a 
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                    <HiOutlineMail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500">{t('contact.email', 'Email')}</div>
                    <div className="font-medium">{profile.email}</div>
                  </div>
                </a>
              )}

              {profile?.phone && (
                <a 
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                    <HiOutlinePhone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500">{t('contact.phone', 'Phone')}</div>
                    <div className="font-medium">{profile.phone}</div>
                  </div>
                </a>
              )}

              {profile?.location && (
                <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <HiOutlineLocationMarker className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500">{t('contact.location', 'Location')}</div>
                    <div className="font-medium">{profile.location}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div>
                <div className="text-sm text-neutral-500 mb-4">{t('contact.social_media', 'Social Media')}</div>
                <div className="flex gap-3">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-all duration-200"
                      aria-label={link.label}
                    >
                      <link.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="label">{t('contact.name', 'Your Name')}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder={t('contact.name_placeholder', 'Your name')}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">{t('contact.email', 'Email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder={t('contact.email_placeholder', 'example@email.com')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="label">{t('contact.subject', 'Subject')}</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input"
                  placeholder={t('contact.subject_placeholder', 'Subject of your message')}
                />
              </div>

              <div>
                <label htmlFor="message" className="label">{t('contact.message', 'Message')}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="input resize-none"
                  placeholder={t('contact.message_placeholder', 'Write your message...')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {t('contact.send', 'Send')}
                    <HiArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
