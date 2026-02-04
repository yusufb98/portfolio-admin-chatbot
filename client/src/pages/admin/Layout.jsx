import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineCollection,
  HiOutlineLightningBolt,
  HiOutlineChatAlt2,
  HiOutlineMailOpen,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineExternalLink,
  HiOutlineGlobeAlt
} from 'react-icons/hi';
import { useAuthStore, useThemeStore } from '../../store';
import { authAPI } from '../../services/api';

const menuItems = [
  { path: '/admin', icon: HiOutlineHome, label: 'Dashboard', exact: true },
  { path: '/admin/profile', icon: HiOutlineUser, label: 'Profil' },
  { path: '/admin/projects', icon: HiOutlineCollection, label: 'Projeler' },
  { path: '/admin/skills', icon: HiOutlineLightningBolt, label: 'Yetenekler' },
  { path: '/admin/chatbot', icon: HiOutlineChatAlt2, label: 'Chatbot' },
  { path: '/admin/messages', icon: HiOutlineMailOpen, label: 'Mesajlar' },
  { path: '/admin/translations', icon: HiOutlineGlobeAlt, label: 'Diller & Çeviri' },
  { path: '/admin/settings', icon: HiOutlineCog, label: 'Ayarlar' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, admin, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  // Verify auth on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        navigate('/admin/login');
        return;
      }

      try {
        await authAPI.verify();
      } catch (error) {
        logout();
        navigate('/admin/login');
      }
    };

    verifyAuth();
  }, [isAuthenticated, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center">
              <span className="text-xl text-white dark:text-neutral-900 font-bold">Y</span>
            </div>
            <div>
              <h1 className="font-bold text-neutral-800 dark:text-white">Admin Panel</h1>
              <p className="text-xs text-neutral-500">Portfolyo Yönetimi</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path, item.exact)
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 dark:border-neutral-800">
          {/* View site button */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors mb-2"
          >
            <HiOutlineExternalLink className="w-5 h-5" />
            <span className="font-medium">Siteyi Görüntüle</span>
          </a>
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <HiOutlineLogout className="w-5 h-5" />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {sidebarOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>

            {/* Page title */}
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-white hidden lg:block">
              {menuItems.find(item => isActive(item.path, item.exact))?.label || 'Dashboard'}
            </h2>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
              </button>

              {/* Admin info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center">
                  <span className="text-white dark:text-neutral-900 font-medium text-sm">
                    {admin?.username?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="hidden md:block font-medium text-neutral-800 dark:text-white">
                  {admin?.username || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
