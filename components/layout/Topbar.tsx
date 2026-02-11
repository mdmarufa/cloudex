import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Search, Bell, User as UserIcon, Moon, Sun, Monitor, Check, ChevronDown, LucideIcon, Command } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme, Theme } from '../../context/ThemeContext';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: LucideIcon;
}

interface TopbarProps {
  onOpenSearch: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenSearch }) => {
  const { user, notifications } = useSelector((state: RootState) => state.dashboard);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    const params = new URLSearchParams(location.search);
    params.set('modal', 'notifications');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleProfileClick = () => {
    const params = new URLSearchParams(location.search);
    params.set('modal', 'profile');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOptions: ThemeOption[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentOption = themeOptions.find(t => t.value === theme) || themeOptions[2];
  const CurrentThemeIcon = currentOption.icon;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors shadow-sm">
      {/* Search Trigger */}
      <div className="flex-1 max-w-xl">
        <div 
          className="relative group cursor-pointer"
          onClick={onOpenSearch}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={18} />
          <div className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-between text-slate-500 dark:text-slate-400 transition-all hover:bg-white dark:hover:bg-slate-700 hover:ring-2 hover:ring-blue-100 dark:hover:ring-blue-900/30">
              <span className="text-sm">Search files, folders...</span>
              <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500">
                  <Command size={10} />
                  <span>K</span>
              </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 sm:space-x-4 pl-2">
        
        {/* Premium Theme Dropdown */}
        <div className="relative hidden sm:block" ref={themeMenuRef}>
          <button 
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className={`flex items-center space-x-2 p-2 rounded-full transition-all duration-200 border ${isThemeMenuOpen ? 'bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-slate-600 text-blue-600 dark:text-blue-400' : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <CurrentThemeIcon size={20} />
            <ChevronDown size={14} className={`transition-transform duration-200 ${isThemeMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          <div className={`absolute right-0 mt-2 w-48 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl transform transition-all duration-200 origin-top-right ${isThemeMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
            <div className="p-1 space-y-0.5">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTheme(option.value);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      theme === option.value 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={18} />
                      <span>{option.label}</span>
                    </div>
                    {theme === option.value && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

        <button 
          onClick={handleNotificationClick}
          title="Notifications (Alt + N)"
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white dark:border-slate-900 animate-pulse"></span>
          )}
        </button>

        <div 
          onClick={handleProfileClick}
          className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          {user ? (
             <img src={user.avatar} alt="Profile" className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-slate-200 dark:group-hover:ring-slate-700 transition-all" />
          ) : (
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <UserIcon size={16} className="text-slate-500 dark:text-slate-400" />
            </div>
          )}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">{user?.name || 'Loading...'}</span>
        </div>
      </div>
    </header>
  );
};