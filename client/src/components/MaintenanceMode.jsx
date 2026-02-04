import { motion } from 'framer-motion';
import { HiOutlineCog } from 'react-icons/hi';
import { useTranslation } from '../store';

const MaintenanceMode = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Animated gear icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="inline-block mb-8"
        >
          <HiOutlineCog className="w-24 h-24 text-neutral-400 dark:text-neutral-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
          {t('maintenance.title', 'Maintenance Mode')}
        </h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
          {t('maintenance.message', 'The site is currently under maintenance. We will be back soon. Thank you for your understanding.')}
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          {t('maintenance.working', 'We are working on it...')}
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenanceMode;
