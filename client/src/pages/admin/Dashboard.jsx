import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCollection,
  HiOutlineLightningBolt,
  HiOutlineChatAlt2,
  HiOutlineMailOpen,
  HiOutlineCalendar,
  HiOutlineTrendingUp
} from 'react-icons/hi';
import { projectsAPI, skillsAPI, chatbotAPI, contactAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    chatStats: null,
    messages: 0,
    recentMessages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, skillsRes, chatRes, messagesRes] = await Promise.all([
          projectsAPI.getAll().catch(() => ({ data: [] })),
          skillsAPI.getAll().catch(() => ({ data: [] })),
          chatbotAPI.getStats().catch(() => ({ data: { total_questions: 0, top_questions: [] } })),
          contactAPI.getAll().catch(() => ({ data: { messages: [], total: 0 } }))
        ]);

        const messages = messagesRes.data?.messages || [];
        
        setStats({
          projects: projectsRes.data?.length || 0,
          skills: skillsRes.data?.length || 0,
          chatStats: chatRes.data || { total_questions: 0, top_questions: [] },
          messages: messagesRes.data?.total || messages.length || 0,
          recentMessages: messages.slice(0, 5)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Projeler',
      value: stats.projects,
      icon: HiOutlineCollection,
      color: 'bg-emerald-500'
    },
    {
      label: 'Yetenekler',
      value: stats.skills,
      icon: HiOutlineLightningBolt,
      color: 'bg-blue-500'
    },
    {
      label: 'Chatbot Sorguları',
      value: stats.chatStats?.total_questions || 0,
      icon: HiOutlineChatAlt2,
      color: 'bg-amber-500'
    },
    {
      label: 'Mesajlar',
      value: stats.messages,
      icon: HiOutlineMailOpen,
      color: 'bg-rose-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-neutral-900 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Hoş Geldiniz! 👋
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Portfolyo yönetim panelinize hoş geldiniz. Buradan tüm içeriklerinizi yönetebilirsiniz.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                {stat.value}
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Son Mesajlar</h2>
            <HiOutlineCalendar className="w-5 h-5 text-neutral-500" />
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {stats.recentMessages.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                Henüz mesaj yok
              </div>
            ) : (
              stats.recentMessages.map((msg) => (
                <div key={msg.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-neutral-900 dark:text-white">{msg.name}</span>
                    <span className="text-xs text-neutral-500">
                      {new Date(msg.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Top chatbot questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900 dark:text-white">En Çok Sorulan</h2>
            <HiOutlineTrendingUp className="w-5 h-5 text-neutral-500" />
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {stats.chatStats?.top_questions?.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                Henüz soru yok
              </div>
            ) : (
              stats.chatStats?.top_questions?.map((qa, index) => (
                <div key={index} className="p-4 flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-900 dark:text-white truncate">{qa.question}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{qa.hit_count} kez soruldu</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">Hızlı İşlemler</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/projects"
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-center"
          >
            <HiOutlineCollection className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Yeni Proje Ekle</span>
          </a>
          <a
            href="/admin/chatbot"
            className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center"
          >
            <HiOutlineChatAlt2 className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Chatbot Ayarları</span>
          </a>
          <a
            href="/admin/profile"
            className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-center"
          >
            <HiOutlineCalendar className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Profili Düzenle</span>
          </a>
          <a
            href="/admin/messages"
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors text-center"
          >
            <HiOutlineMailOpen className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Mesajları Gör</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
