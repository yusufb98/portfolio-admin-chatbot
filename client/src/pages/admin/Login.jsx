import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineLockClosed, HiOutlineUser, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuthStore } from '../../store';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      login(response.data.token, response.data.admin);
      toast.success('Giriş başarılı!');
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg dark:shadow-2xl border border-neutral-200 dark:border-neutral-800 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-900 dark:bg-emerald-500 flex items-center justify-center shadow-lg">
              <span className="text-3xl text-white font-bold">Y</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Admin Panel</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Portfolyo yönetim paneline giriş yapın</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input input-icon-left"
                  placeholder="Kullanıcı adınızı girin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-icon-left input-icon-right"
                  placeholder="Şifrenizi girin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <HiOutlineLockClosed className="w-5 h-5" />
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          {/* Default credentials info */}
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 text-center">
              Varsayılan giriş bilgileri:<br />
              <span className="font-mono font-semibold">admin / admin123</span>
            </p>
          </div>

          {/* Back to site */}
          <div className="mt-6 text-center">
            <a href="/" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-sm font-medium transition-colors">
              ← Siteye Geri Dön
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
