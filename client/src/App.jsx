import { Routes, Route } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useThemeStore, useLanguageStore } from './store';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./pages/admin/Layout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProfileManagement = lazy(() => import('./pages/admin/ProfileManagement'));
const ProjectsManagement = lazy(() => import('./pages/admin/ProjectsManagement'));
const SkillsManagement = lazy(() => import('./pages/admin/SkillsManagement'));
const ExperiencesManagement = lazy(() => import('./pages/admin/ExperiencesManagement'));
const ChatbotManagement = lazy(() => import('./pages/admin/ChatbotManagement'));
const MessagesManagement = lazy(() => import('./pages/admin/MessagesManagement'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const TranslationsManagement = lazy(() => import('./pages/admin/TranslationsManagement'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
      <p className="text-neutral-500 dark:text-neutral-400">Loading...</p>
    </div>
  </div>
);

function App() {
  const { initTheme } = useThemeStore();
  const { init: initLanguage } = useLanguageStore();

  useEffect(() => {
    initTheme();
    initLanguage();
    
    // Set CSS variables for toast
    document.documentElement.style.setProperty('--toast-bg', '#1e293b');
    document.documentElement.style.setProperty('--toast-color', '#f1f5f9');
  }, [initTheme, initLanguage]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfileManagement />} />
          <Route path="projects" element={<ProjectsManagement />} />
          <Route path="skills" element={<SkillsManagement />} />
          <Route path="experiences" element={<ExperiencesManagement />} />
          <Route path="chatbot" element={<ChatbotManagement />} />
          <Route path="messages" element={<MessagesManagement />} />
          <Route path="settings" element={<Settings />} />
          <Route path="translations" element={<TranslationsManagement />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
