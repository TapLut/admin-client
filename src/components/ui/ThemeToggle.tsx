'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-9 rounded-full bg-slate-200 dark:bg-slate-700 p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#B364FF] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sliding circle */}
      <motion.div
        className="absolute top-1 w-7 h-7 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center"
        initial={false}
        animate={{
          left: isDark ? 'calc(100% - 32px)' : '4px',
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 360 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-[#B364FF]" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </motion.div>
      </motion.div>

      {/* Background icons */}
      <div className="flex items-center justify-between px-1.5 h-full">
        <Sun className="w-3.5 h-3.5 text-amber-500/50" />
        <Moon className="w-3.5 h-3.5 text-slate-400/50" />
      </div>
    </button>
  );
}
