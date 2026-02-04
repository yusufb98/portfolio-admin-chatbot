import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Experiences from '../components/Experiences';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot/Chatbot';
import MaintenanceMode from '../components/MaintenanceMode';
import { profileAPI, settingsAPI } from '../services/api';

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          profileAPI.get(),
          settingsAPI.get()
        ]);
        setProfile(profileRes.data);
        setSettings(settingsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dynamic page title from settings
  const pageTitle = settings?.tab_title || settings?.site_title || profile?.full_name || 'Portfolyo';
  const ogTitle = settings?.og_title || `${profile?.full_name || 'Portfolio'} | ${profile?.title || 'Developer'}`;
  const ogDescription = settings?.og_description || profile?.bio || 'Portfolyo web sitesi';
  const ogImage = settings?.og_image || profile?.avatar_url;
  const siteUrl = settings?.og_url || 'https://yusufbaykan.com';
  
  // Check for maintenance mode
  const isMaintenanceMode = settings?.maintenance_mode === true || settings?.maintenance_mode === 'true';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Show maintenance page if maintenance mode is enabled
  if (isMaintenanceMode) {
    return (
      <>
        <Helmet>
          <title>Bakım Modu | {pageTitle}</title>
        </Helmet>
        <MaintenanceMode />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={ogDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content={settings?.twitter_card_type || 'summary_large_image'} />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {settings?.twitter_handle && <meta name="twitter:creator" content={settings.twitter_handle} />}
        
        {/* Additional SEO */}
        {settings?.site_keywords && <meta name="keywords" content={settings.site_keywords} />}
        <link rel="canonical" href={siteUrl} />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300">
        {/* Navigation */}
        <Navbar profile={profile} settings={settings} />
        
        {/* Main content */}
        <main>
          <Hero profile={profile} settings={settings} />
          <About profile={profile} />
          <Skills />
          <Experiences />
          <Projects />
          <Contact profile={profile} />
        </main>
        
        {/* Footer */}
        <Footer profile={profile} settings={settings} />
        
        {/* Chatbot widget */}
        <Chatbot />
      </div>
    </>
  );
};

export default Home;
