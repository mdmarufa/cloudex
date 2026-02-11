import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../../store/store';
import { Skeleton } from '../../components/ui/Skeleton';
import { StorageChart } from '../../components/dashboard/StorageChart';
import { FileCard } from '../../components/files/FileCard';
import { FORMAT_BYTES } from '../../constants';
import { FileType } from '../../types';
import { 
  FileText, 
  Folder,
  Users, 
  Share2, 
  UploadCloud, 
  FilePlus, 
  QrCode, 
  Plus, 
  Clock,
  Trash2,
  Move,
  Edit2,
  MoreHorizontal,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

// --- Local Components ---

interface FabActionProps {
  isOpen: boolean;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  delay?: number;
  color?: string;
}

const FabAction: React.FC<FabActionProps> = ({ isOpen, label, icon: Icon, onClick, delay = 0, color = "text-slate-600 dark:text-slate-300" }) => {
  return (
    <div 
        className={`flex items-center gap-4 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isOpen 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-10 scale-50 pointer-events-none'
        }`}
        style={{ transitionDelay: `${isOpen ? delay : 0}ms` }}
    >
        <span className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold shadow-md border border-slate-100 dark:border-slate-700">
            {label}
        </span>
        <button 
            onClick={onClick}
            className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
        >
            <Icon size={20} className={`${color} group-hover:scale-110 transition-transform`} />
        </button>
    </div>
  );
};

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { user, files, storageStats, recentActivity, loading } = useSelector((state: RootState) => state.dashboard);
  const [isFabOpen, setIsFabOpen] = useState(false);

  // --- Stats Logic ---
  const folderCount = files.filter(f => f.type === FileType.FOLDER).length;
  const fileCount = files.filter(f => f.type !== FileType.FOLDER).length;
  const sharedWithMeCount = files.filter(f => f.owner !== 'Me').length;
  const totalSharedCount = sharedWithMeCount + 8; 

  // Storage Logic
  const storageUsed = user ? user.storageUsed : 0;
  const storageLimit = user ? user.storageLimit : 1;
  const storagePercent = (storageUsed / storageLimit) * 100;
  
  // Mock Data for UI
  const recentShares = [
      { id: 'rs1', name: 'Project Alpha.pdf', sharedBy: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?u=1', time: '5m ago' },
      { id: 'rs2', name: 'Marketing Assets', sharedBy: 'Mike Ross', avatar: 'https://i.pravatar.cc/150?u=2', time: '1h ago' },
      { id: 'rs3', name: 'Q4 Financials', sharedBy: 'Jessica P.', avatar: 'https://i.pravatar.cc/150?u=3', time: '3h ago' },
  ];

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'upload': return { icon: UploadCloud, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' };
      case 'delete': return { icon: Trash2, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' };
      case 'move': return { icon: Move, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' };
      case 'rename': return { icon: Edit2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' };
      case 'share': return { icon: Share2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
      default: return { icon: Activity, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800' };
    }
  };

  // --- Premium Stat Card Component ---
  const StatCard = ({ title, value, subValue, icon: Icon, gradient, shadowColor, link, trend }: any) => (
    <div
      onClick={() => navigate(link)}
      className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
    >
      {/* 
          Background Circle Effect:
          - Initial: Larger size (w-48), distinct solid shape (blur-0), positioned in corner.
          - Hover: Smoother expansion (duration-1000), less blur (blur-2xl) to keep it visible/colorful.
      */}
      <div className={`
        absolute -right-12 -top-12 w-48 h-48 rounded-full 
        ${gradient} 
        opacity-20 dark:opacity-25
        blur-0
        group-hover:scale-[2.5] group-hover:blur-2xl group-hover:opacity-15
        transition-all duration-1000 ease-[cubic-bezier(0.25,0.4,0.25,1)]
      `}></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
           <div className="flex items-center justify-between mb-5">
              {/* Icon Container with specific shadow color matching the card theme */}
              <div className={`p-3.5 rounded-2xl ${gradient} text-white shadow-lg ${shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}>
                 <Icon size={22} strokeWidth={2.5} />
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                      <ChevronRight size={18} strokeWidth={2.5} />
                  </div>
              </div>
           </div>
           
           <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-2">{title}</h3>
           
           {loading ? (
             <Skeleton className="h-10 w-24 mb-1" />
           ) : (
             <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                   {value}
                 </span>
             </div>
           )}
        </div>
        
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
             <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
                 <ArrowUpRight size={12} strokeWidth={3} />
                 <span>{trend}</span>
             </div>
             <span className="text-xs font-bold text-slate-400 truncate group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors">{subValue}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-24 relative max-w-full">
      
      {/* Header / Hero */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="hidden sm:block">
            <button className="flex items-center space-x-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95">
                <Clock size={16} />
                <span>View Activity Log</span>
            </button>
          </div>
      </div>

      {/* --- Premium Stats Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Files" 
          value={fileCount} 
          trend="12%"
          subValue="vs last week"
          icon={FileText}
          gradient="bg-gradient-to-tr from-blue-500 to-indigo-600"
          shadowColor="shadow-blue-500/30"
          link="/dashboard/files"
        />
        <StatCard 
          title="Folders" 
          value={folderCount} 
          trend="4%"
          subValue="New directories"
          icon={Folder}
          gradient="bg-gradient-to-tr from-amber-400 to-orange-500"
          shadowColor="shadow-orange-500/30"
          link="/dashboard/files"
        />
        <StatCard 
          title="Shared" 
          value={sharedWithMeCount} 
          trend="8%"
          subValue="Incoming files"
          icon={Users}
          gradient="bg-gradient-to-tr from-violet-500 to-purple-600"
          shadowColor="shadow-purple-500/30"
          link="/dashboard/files"
        />
        <StatCard 
          title="Active Links" 
          value={totalSharedCount} 
          trend="24%"
          subValue="High engagement"
          icon={TrendingUp}
          gradient="bg-gradient-to-tr from-emerald-400 to-teal-500"
          shadowColor="shadow-emerald-500/30"
          link="/dashboard/files"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (2/3) */}
        <div className="xl:col-span-2 space-y-8 min-w-0">
          
          {/* Recent Shares Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 p-8">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                          <Share2 size={20} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Shares</h3>
                          <p className="text-xs text-slate-500 font-medium">Files shared with you recently</p>
                      </div>
                  </div>
                  <Link to="/dashboard/files" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group">
                      View All <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentShares.map((share) => (
                      <div key={share.id} className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5">
                          <div className="relative">
                             <img src={share.avatar} alt={share.sharedBy} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
                             <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5">
                                 <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                             </div>
                          </div>
                          <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{share.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-medium text-slate-500">{share.sharedBy}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                <span className="text-xs text-slate-400">{share.time}</span>
                              </div>
                          </div>
                          <button className="p-2 rounded-xl text-slate-300 group-hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                              <ArrowUpRight size={18} />
                          </button>
                      </div>
                  ))}
                  {/* Add New Share Button */}
                  <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 group">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                         <Plus size={20} />
                      </div>
                      <span className="text-sm font-bold">Share New File</span>
                  </div>
              </div>
          </div>

          {/* Recent Files Section */}
          <section className="min-w-0">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Files</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1,2].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {files.slice(0, 4).map(file => <FileCard key={file.id} file={file} />)}
              </div>
            )}
          </section>

        </div>

        {/* Right Column (1/3) */}
        <div className="xl:col-span-1 space-y-8 min-w-0">
           
           {/* Dynamic Storage Donut Chart */}
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 flex flex-col items-center relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
               {/* Decorative background glow */}
               <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
               
              <div className="w-full flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Storage</h3>
                  <button className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                      Upgrade
                  </button>
              </div>
              
              {/* Chart Container */}
              <div className="h-64 w-full relative flex items-center justify-center my-2">
                  <StorageChart data={storageStats} loading={loading} />
                  {/* Center Text for Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{storagePercent.toFixed(0)}%</span>
                       <span className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Used</span>
                  </div>
              </div>

              {/* Dynamic Storage Bar & Info */}
              <div className="w-full mt-6 space-y-5">
                 <div className="space-y-2">
                     <div className="flex justify-between text-sm font-medium">
                         <span className="text-slate-900 dark:text-white font-bold">{FORMAT_BYTES(storageUsed)}</span>
                         <span className="text-slate-500">{FORMAT_BYTES(storageLimit)} total</span>
                     </div>
                     <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-[2px]">
                         <div 
                             className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full relative shadow-sm"
                             style={{ width: `${storagePercent}%` }}
                         ></div>
                     </div>
                 </div>

                 <div className="pt-5 border-t border-slate-50 dark:border-slate-800 space-y-3">
                     {storageStats.slice(0, 3).map((stat, idx) => (
                         <div key={idx} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors -mx-2">
                            <div className="flex items-center gap-3">
                               <div className="w-3 h-3 rounded-md shadow-sm ring-2 ring-white dark:ring-slate-800" style={{ backgroundColor: stat.color }}></div>
                               <span className="text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{stat.name}</span>
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{FORMAT_BYTES(stat.value)}</span>
                         </div>
                     ))}
                 </div>
              </div>
           </div>

           {/* Re-designed Recent Activity */}
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[500px] hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-white/5 backdrop-blur-sm rounded-t-3xl">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity size={18} className="text-orange-500" />
                      Activity Log
                  </h3>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                      <MoreHorizontal size={20} />
                  </button>
              </div>
              
              <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1">
                  {loading ? (
                       [1, 2, 3, 4].map(i => (
                          <div key={i} className="flex gap-4 p-3">
                              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                  <Skeleton className="w-3/4 h-4" />
                                  <Skeleton className="w-1/2 h-3" />
                              </div>
                          </div>
                      ))
                  ) : (
                      recentActivity.map((activity, index) => {
                          const style = getActionStyle(activity.action);
                          const Icon = style.icon;
                          const isLast = index === recentActivity.length - 1;
                          return (
                              <div key={activity.id} className="relative pl-6 pb-6 last:pb-0">
                                  {/* Timeline Line */}
                                  {!isLast && (
                                      <div className="absolute left-[35px] top-10 bottom-0 w-px bg-slate-100 dark:bg-slate-800"></div>
                                  )}
                                  
                                  <div className="flex items-start gap-4 group">
                                      <div className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors ${style.bg} ${style.color}`}>
                                          <Icon size={18} />
                                      </div>
                                      <div className="flex-1 min-w-0 pt-1">
                                           <div className="flex justify-between items-start mb-1">
                                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                                                  {activity.itemName}
                                              </p>
                                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider">{new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                           </div>
                                           <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                              <span className="capitalize text-slate-700 dark:text-slate-300 font-bold">{activity.action}</span> by {activity.user === 'You' ? 'You' : activity.user}
                                           </p>
                                      </div>
                                  </div>
                              </div>
                          );
                      })
                  )}
              </div>
              <div className="p-4 border-t border-slate-50 dark:border-slate-800 mt-auto">
                  <button className="w-full py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center gap-2">
                      <span>View Full History</span>
                      <ChevronRight size={16} />
                  </button>
              </div>
           </div>

        </div>

      </div>

      {/* --- Redesigned Speed Dial FAB --- */}
      {createPortal(
        <div className="relative z-[100]">
            
            <div 
                className={`fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isFabOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsFabOpen(false)}
            />

            <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4 pointer-events-none">
                
                <div className="flex flex-col items-end gap-4 mb-2 pointer-events-auto">
                    
                    <FabAction 
                        isOpen={isFabOpen} 
                        label="Scan Document" 
                        icon={QrCode} 
                        onClick={() => console.log('Scan')} 
                        delay={100} 
                        color="text-indigo-600 dark:text-indigo-400"
                    />
                    
                    <FabAction 
                        isOpen={isFabOpen} 
                        label="New Document" 
                        icon={FilePlus} 
                        onClick={() => console.log('New Doc')} 
                        delay={50} 
                        color="text-blue-600 dark:text-blue-400"
                    />
                    
                    <FabAction 
                        isOpen={isFabOpen} 
                        label="Upload File" 
                        icon={UploadCloud} 
                        onClick={() => console.log('Upload')} 
                        delay={0} 
                        color="text-emerald-600 dark:text-emerald-400"
                    />

                </div>

                <button 
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={`
                        pointer-events-auto relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl shadow-blue-600/30
                        transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform
                        ${isFabOpen 
                            ? 'bg-slate-900 dark:bg-white rotate-[135deg] scale-90 text-white dark:text-black' 
                            : 'bg-blue-600 hover:bg-blue-500 hover:scale-110 text-white'}
                    `}
                >
                    <Plus size={32} strokeWidth={2.5} />
                </button>
            </div>
        </div>,
        document.body
      )}

    </div>
  );
};