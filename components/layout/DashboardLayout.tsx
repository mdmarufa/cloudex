import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchDashboardData, markNotificationRead } from '../../store/dashboardSlice';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Modal } from '../ui/Modal';
import { SearchDrawer } from '../dashboard/SearchDrawer';
import { FileViewer } from '../../modules/viewer/FileViewer';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Bell, Check, FileText, Moon, Sun, Monitor, Menu, X, ArrowLeft, Calendar, Info, AlertTriangle, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { AppDispatch } from '../../store/store';
import { useTheme } from '../../context/ThemeContext';
import { FileItem, Notification } from '../../types';
import { useShortcut } from '../../hooks/useShortcut';

export const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, user, files } = useSelector((state: RootState) => state.dashboard);
  const { theme, setTheme } = useTheme();

  // Modal State
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  
  // Notification Detail State
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // URL Query Param Listener for Modals
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modalType = params.get('modal');

    setActiveModal(modalType);
    
    // Reset notification detail view when drawer closes
    if (modalType !== 'notifications') {
        setTimeout(() => setSelectedNotification(null), 300);
    }
  }, [location.search]);

  // --- SHORTCUTS ---

  // 1. Global Search (Cmd+K / Ctrl+K)
  useShortcut('Meta+K', () => setIsSearchDrawerOpen(prev => !prev));
  useShortcut('Ctrl+K', () => setIsSearchDrawerOpen(prev => !prev));

  // 2. Notifications (Alt+N)
  useShortcut('Alt+N', () => {
      if (activeModal === 'notifications') {
          closeModal();
      } else {
          const params = new URLSearchParams(location.search);
          params.set('modal', 'notifications');
          navigate(`${location.pathname}?${params.toString()}`);
      }
  });

  // Close Mobile Menu on route change automatically
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close Modal Handler (removes query param)
  const closeModal = () => {
    const params = new URLSearchParams(location.search);
    params.delete('modal');
    params.delete('fileId');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Computed state for Notification Drawer
  const isNotificationsOpen = activeModal === 'notifications';

  // Helper for notification styling
  const getNotificationStyle = (type: string) => {
      switch (type) {
          case 'success': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800' };
          case 'warning': return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800' };
          case 'error': return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800' };
          default: return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' };
      }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 transition-colors overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- Mobile Sidebar Overlay --- */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* --- Sidebar Container --- */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] shadow-2xl md:shadow-none`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Topbar Wrapper with Mobile Toggle */}
        <div className="w-full z-20">
           <div className="w-full">
               {/* Mobile Header Bar */}
               <div className="flex items-center justify-between md:hidden h-16 px-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 border-b border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-3">
                       <button 
                         onClick={() => setIsMobileMenuOpen(true)}
                         className="p-2 -ml-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
                       >
                         <Menu size={24} />
                       </button>
                       <span className="font-bold text-lg text-slate-900 dark:text-white">CloudVault</span>
                   </div>
                   {/* Mobile Profile Avatar */}
                   {user && <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" alt="User" />}
               </div>
               
               <div className="hidden md:block">
                  <Topbar onOpenSearch={() => setIsSearchDrawerOpen(true)} />
               </div>
           </div>
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="w-full px-4 md:px-8 pb-10 pt-4 max-w-[1920px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* --- Global Overlays --- */}

      {/* New File Preview System */}
      <FileViewer />

      {/* Search Drawer */}
      <SearchDrawer isOpen={isSearchDrawerOpen} onClose={() => setIsSearchDrawerOpen(false)} />

      {/* --- Notification Drawer (Right Side) --- */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[60] transition-opacity duration-300 ${isNotificationsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeModal}
      />
      
      {/* Slide-in Panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-slate-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-slate-200 dark:border-slate-800 overflow-hidden`}>
         
         {/* Sliding Container (200% width) */}
         <div 
            className="flex w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ transform: selectedNotification ? 'translateX(-50%)' : 'translateX(0)' }}
         >
             {/* PANEL 1: LIST VIEW (50% width) */}
             <div className="w-1/2 h-full flex flex-col border-r border-slate-100 dark:border-slate-800">
                <div className="flex-none flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
                        <span className="text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">Alt+N</span>
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-extrabold">
                                {notifications.filter(n => !n.read).length} NEW
                            </span>
                        )}
                    </div>
                    <button onClick={closeModal} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/30">
                    {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 pb-20">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Bell size={24} className="text-slate-400" />
                        </div>
                        <p className="font-medium">No notifications yet</p>
                    </div>
                    ) : (
                    notifications.map(n => {
                        const style = getNotificationStyle(n.type);
                        const Icon = style.icon;
                        return (
                            <div 
                                key={n.id} 
                                onClick={() => setSelectedNotification(n)}
                                className={`group relative p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${n.read ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 shadow-sm'}`}
                            >
                                {!n.read && <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-blue-500"></div>}
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 p-2.5 rounded-xl flex-shrink-0 ${style.bg} ${style.color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider opacity-70 ${style.color}`}>{n.type}</span>
                                        </div>
                                        <h4 className={`text-sm font-bold mb-1.5 ${n.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>{n.title}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">{n.message}</p>
                                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 font-medium">
                                            <Calendar size={12} />
                                            <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                         <div className="p-2 text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-full">
                                             <ArrowLeft size={16} className="rotate-180" />
                                         </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                    )}
                </div>
             </div>

             {/* PANEL 2: DETAIL VIEW (50% width) */}
             <div className="w-1/2 h-full flex flex-col bg-white dark:bg-slate-900">
                {selectedNotification ? (
                    <>
                        <div className="flex-none flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                            <button 
                                onClick={() => setSelectedNotification(null)}
                                className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Details</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className={`px-8 py-10 ${getNotificationStyle(selectedNotification.type).bg} flex flex-col items-center justify-center text-center border-b ${getNotificationStyle(selectedNotification.type).border}`}>
                                 <div className={`p-4 bg-white dark:bg-slate-900 rounded-full shadow-sm mb-4 ${getNotificationStyle(selectedNotification.type).color}`}>
                                    {React.createElement(getNotificationStyle(selectedNotification.type).icon, { size: 40 })}
                                 </div>
                                 <span className={`text-xs font-bold uppercase tracking-widest mb-2 ${getNotificationStyle(selectedNotification.type).color}`}>
                                     {selectedNotification.type} Notification
                                 </span>
                                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                     {selectedNotification.title}
                                 </h2>
                                 <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                                     {new Date(selectedNotification.timestamp).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
                                 </p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</label>
                                    <p className="text-slate-700 dark:text-slate-300 text-base leading-7">
                                        {selectedNotification.message}
                                    </p>
                                </div>
                                {selectedNotification.link && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors" onClick={() => navigate(selectedNotification.link!)}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-blue-600 dark:text-blue-400">
                                                <ExternalLink size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">Related Resource</p>
                                                <p className="text-xs text-slate-500">Click to view details</p>
                                            </div>
                                        </div>
                                        <ArrowLeft size={16} className="rotate-180 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                )}
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Actions</label>
                                    <div className="flex gap-3">
                                        {!selectedNotification.read && (
                                            <button 
                                                onClick={() => {
                                                    dispatch(markNotificationRead(selectedNotification.id));
                                                    setSelectedNotification({...selectedNotification, read: true});
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-slate-900/10"
                                            >
                                                <Check size={18} />
                                                <span>Mark as Read</span>
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setSelectedNotification(null)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Close Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
                    </div>
                )}
             </div>

         </div>
      </div>

      {/* 2. User Profile Modal */}
      <Modal isOpen={activeModal === 'profile'} onClose={closeModal} title="User Profile">
         {user && (
             <div className="flex flex-col items-center py-6">
                 <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full mb-4 border-4 border-white dark:border-slate-700 shadow-xl" />
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                 <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">{user.email}</p>
                 
                 <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 mb-6">
                     <div className="flex justify-between items-center mb-3">
                         <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Current Plan</span>
                         <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs px-3 py-1 rounded-full font-bold uppercase shadow-sm shadow-blue-500/30">{user.plan}</span>
                     </div>
                     <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Role</span>
                         <span className="text-sm font-bold text-slate-900 dark:text-slate-200">Administrator</span>
                     </div>
                 </div>

                 <div className="w-full mb-6">
                   <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider">Appearance</h4>
                   <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                      >
                        <Sun size={16} />
                        <span>Light</span>
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                      >
                        <Moon size={16} />
                        <span>Dark</span>
                      </button>
                      <button 
                        onClick={() => setTheme('system')}
                        className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                      >
                        <Monitor size={16} />
                        <span>Auto</span>
                      </button>
                   </div>
                 </div>
                 
                 <button onClick={closeModal} className="w-full bg-slate-900 dark:bg-slate-700 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-lg shadow-slate-900/20">
                     Close
                 </button>
             </div>
         )}
      </Modal>
    </div>
  );
};
