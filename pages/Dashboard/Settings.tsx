import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Monitor, User, Shield, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useSelector((state: RootState) => state.dashboard);

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and workspace settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                section.id === 'appearance' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <section.icon size={18} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Theme Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Interface Theme</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Customize your workspace appearance. Select "Auto" to match your system preferences.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => setTheme('light')}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  theme === 'light' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="w-full aspect-video bg-slate-100 rounded-lg mb-3 border border-slate-200 flex items-center justify-center">
                    <Sun className="text-slate-400" size={24} />
                </div>
                <span className={`font-medium ${theme === 'light' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>Light</span>
              </button>

              <button 
                onClick={() => setTheme('dark')}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="w-full aspect-video bg-slate-800 rounded-lg mb-3 border border-slate-700 flex items-center justify-center">
                    <Moon className="text-slate-400" size={24} />
                </div>
                <span className={`font-medium ${theme === 'dark' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>Dark</span>
              </button>

              <button 
                onClick={() => setTheme('system')}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  theme === 'system' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="w-full aspect-video bg-gradient-to-br from-slate-100 to-slate-800 rounded-lg mb-3 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <Monitor className="text-slate-400 mix-blend-difference" size={24} />
                </div>
                <span className={`font-medium ${theme === 'system' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>Auto</span>
              </button>
            </div>
          </div>

          {/* Profile Read-only Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
             <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Profile Information</h3>
             <div className="flex items-center space-x-4 mb-6">
                <img src={user?.avatar} alt="Profile" className="w-16 h-16 rounded-full" />
                <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{user?.name}</h4>
                    <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                     <input type="text" value={user?.name || ''} disabled className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                     <input type="email" value={user?.email || ''} disabled className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                 </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
