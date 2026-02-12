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
  Activity,
  Download,
  ArrowRight,
  Zap,
  PlayCircle,
  File as FileIcon
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
  const [activeStorageIndex, setActiveStorageIndex] = useState<number | undefined>(undefined);

  // --- Stats Logic ---
  const folderCount = files.filter(f => f.type === FileType.FOLDER).length;
  const fileCount = files.filter(f => f.type !== FileType.FOLDER).length;
  const sharedWithMeCount = files.filter(f => f.owner !== 'Me').length;
  const totalSharedCount = sharedWithMeCount + 8; 

  // Storage Logic
  const storageUsed = user ? user.storageUsed : 0;
  const storageLimit = user ? user.storageLimit : 1;
  const storagePercent = (storageUsed / storageLimit) * 100;
  
  // Get currently active storage item for display
  const activeStorageItem = activeStorageIndex !== undefined ? storageStats[activeStorageIndex] : null;

  // --- Mock Data for Shared With You (10 Items) ---
  const recentShares = [
      { id: 'rs1', name: 'Project Alpha.pdf', sharedBy: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?u=10', time: '5m ago', type: 'PDF' },
      { id: 'rs2', name: 'Q3 Financials.xlsx', sharedBy: 'Mike Ross', avatar: 'https://i.pravatar.cc/150?u=12', time: '15m ago', type: 'XLS' },
      { id: 'rs3', name: 'Logo_Final.png', sharedBy: 'Jessica Pearson', avatar: 'https://i.pravatar.cc/150?u=15', time: '1h ago', type: 'IMG' },
      { id: 'rs4', name: 'Meeting_Notes.docx', sharedBy: 'Harvey Specter', avatar: 'https://i.pravatar.cc/150?u=20', time: '2h ago', type: 'DOC' },
      { id: 'rs5', name: 'Team_Photo.jpg', sharedBy: 'Louis Litt', avatar: 'https://i.pravatar.cc/150?u=25', time: '3h ago', type: 'IMG' },
      { id: 'rs6', name: 'Budget_2024.pdf', sharedBy: 'Donna Paulsen', avatar: 'https://i.pravatar.cc/150?u=30', time: '5h ago', type: 'PDF' },
      { id: 'rs7', name: 'Campaign_Video.mp4', sharedBy: 'Rachel Zane', avatar: 'https://i.pravatar.cc/150?u=35', time: '1d ago', type: 'VID' },
      { id: 'rs8', name: 'Website_Mockup.fig', sharedBy: 'Alex Williams', avatar: 'https://i.pravatar.cc/150?u=40', time: '1d ago', type: 'FIG' },
      { id: 'rs9', name: 'Contract_v2.pdf', sharedBy: 'Katrina Bennett', avatar: 'https://i.pravatar.cc/150?u=45', time: '2d ago', type: 'PDF' },
      { id: 'rs10', name: 'Presentation.pptx', sharedBy: 'Robert Zane', avatar: 'https://i.pravatar.cc/150?u=50', time: '3d ago', type: 'PPT' },
  ];

  // Colors for unique user backgrounds
  const avatarColors = [
    'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 ring-indigo-200 dark:ring-indigo-800',
    'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 ring-rose-200 dark:ring-rose-800',
    'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 ring-amber-200 dark:ring-amber-800',
    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800',
    'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300 ring-cyan-200 dark:ring-cyan-800',
    'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 ring-violet-200 dark:ring-violet-800',
    'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-300 ring-fuchsia-200 dark:ring-fuchsia-800',
    'bg-lime-100 dark:bg-lime-900/40 text-lime-600 dark:text-lime-300 ring-lime-200 dark:ring-lime-800',
    'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300 ring-sky-200 dark:ring-sky-800',
    'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 ring-orange-200 dark:ring-orange-800',
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
          
          {/* Recent Shares Widget - UPDATED: Fixed Grid Layout & Subtle Hover */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 relative overflow-hidden group/widget">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity duration-500 group-hover/widget:opacity-100 opacity-50"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-100 dark:ring-blue-500/20">
                          <Share2 size={24} />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Shared with You</h3>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                              </span>
                              <p className="text-sm text-slate-500 font-medium">10 new files available</p>
                          </div>
                      </div>
                  </div>
                  <Link to="/dashboard/files" className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white dark:text-slate-400 dark:hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-blue-600 dark:hover:bg-blue-600 bg-slate-50 dark:bg-slate-800/50 sm:bg-transparent w-full sm:w-auto justify-center sm:justify-start">
                      <span>View All</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
              </div>
              
              {/* Grid Container */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 relative z-10">
                  {recentShares.map((share, index) => {
                      const colorStyle = avatarColors[index % avatarColors.length];
                      
                      return (
                      <div key={share.id} 
                           className="group relative flex flex-col p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer h-full"
                      >
                          {/* Header Content */}
                          <div className="flex justify-between items-start mb-3">
                              <div className={`relative p-1 rounded-2xl ${colorStyle.split(' ')[0]}`}>
                                 <div className={`w-10 h-10 rounded-xl p-0.5 bg-white/50 dark:bg-black/20 backdrop-blur-sm transition-colors overflow-hidden ring-1 ${colorStyle.split(' ring-')[1]}`}>
                                    <img 
                                        src={share.avatar} 
                                        alt={share.sharedBy} 
                                        className="w-full h-full rounded-[8px] object-cover" 
                                    />
                                 </div>
                              </div>
                              <div className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400 transition-colors">
                                  {share.type === 'VID' ? <PlayCircle size={14} /> : <FileIcon size={14} />}
                              </div>
                          </div>

                          <div className="space-y-0.5 mb-2 flex-1">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={share.name}>
                                {share.name}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  by <span className={`font-bold ${colorStyle.split(' ')[2]}`}>{share.sharedBy}</span>
                              </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/50 mt-auto">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {share.time}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Download size={12} className="text-slate-400 hover:text-blue-600" />
                              </div>
                          </div>
                      </div>
                  )})}
              </div>
          </div>

          {/* Recent Files Section */}
          <section className="min-w-0">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Files</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({length: 10}).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden h-60">
                     <Skeleton className="w-full h-32" />
                     <div className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-1/4" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {files.slice(0, 10).map(file => <FileCard key={file.id} file={file} />)}
              </div>
            )}
          </section>

        </div>

        {/* Right Column (1/3) */}
        <div className="xl:col-span-1 space-y-8 min-w-0">
           
           {/* Dynamic Storage Donut Chart - UPDATED INTERACTIVITY */}
           <div className="group/card bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 flex flex-col items-center relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
               {/* Decorative background glow that reacts to hover */}
               <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent group-hover/card:via-blue-500/50 transition-all duration-500"></div>
               <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-gradient-to-t from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
               
              <div className="w-full flex items-center justify-between mb-6 relative z-10">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Storage</h3>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 pl-2 pr-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-sm hover:shadow-blue-500/20 active:scale-95 group/btn">
                      <Zap size={12} className="fill-current" />
                      <span>Upgrade</span>
                  </button>
              </div>
              
              {/* Chart Container */}
              <div className="h-64 w-full relative flex items-center justify-center my-2 z-10">
                  <StorageChart 
                    data={storageStats} 
                    loading={loading} 
                    activeIndex={activeStorageIndex}
                    onHover={setActiveStorageIndex}
                  />
                  
                  {/* Interactive Center Text for Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
                       {activeStorageItem ? (
                           <div className="text-center animate-in fade-in zoom-in-95 duration-200">
                               <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex flex-col leading-none">
                                   {FORMAT_BYTES(activeStorageItem.value).split(' ')[0]}
                                   <span className="text-sm font-bold text-slate-400 mt-0.5">{FORMAT_BYTES(activeStorageItem.value).split(' ')[1]}</span>
                               </span>
                               <span 
                                    className="block text-xs font-bold uppercase tracking-widest mt-2 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                                    style={{ color: activeStorageItem.color, borderColor: `${activeStorageItem.color}30` }}
                               >
                                   {activeStorageItem.name}
                               </span>
                           </div>
                       ) : (
                           <div className="text-center transition-opacity duration-300">
                               <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
                                   {storagePercent.toFixed(0)}%
                               </span>
                               <span className="block text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Used</span>
                           </div>
                       )}
                  </div>
              </div>

              {/* Dynamic Storage Bar & Info */}
              <div className="w-full mt-6 space-y-6 relative z-10">
                 <div className="space-y-2">
                     <div className="flex justify-between text-sm font-medium">
                         <span className="text-slate-900 dark:text-white font-bold">{FORMAT_BYTES(storageUsed)}</span>
                         <span className="text-slate-500">{FORMAT_BYTES(storageLimit)} total</span>
                     </div>
                     {/* Segmented Progress Bar Look */}
                     <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-[2px] flex items-center">
                         <div 
                             className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full relative shadow-sm transition-all duration-700 ease-out"
                             style={{ width: `${storagePercent}%` }}
                         >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
                         </div>
                     </div>
                 </div>

                 <div className="pt-6 border-t border-slate-50 dark:border-slate-800 grid grid-cols-1 gap-1">
                     {storageStats.map((stat, idx) => (
                         <div 
                            key={idx} 
                            onMouseEnter={() => setActiveStorageIndex(idx)}
                            onMouseLeave={() => setActiveStorageIndex(undefined)}
                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
                                activeStorageIndex === idx 
                                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 scale-[1.02] shadow-sm' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                               <div 
                                    className={`w-3 h-3 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900 transition-all duration-300 ${activeStorageIndex === idx ? 'scale-125' : ''}`} 
                                    style={{ backgroundColor: stat.color }}
                               ></div>
                               <span className={`text-sm font-medium transition-colors ${activeStorageIndex === idx ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                   {stat.name}
                               </span>
                            </div>
                            <span className={`text-sm font-bold transition-colors ${activeStorageIndex === idx ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500'}`}>
                                {FORMAT_BYTES(stat.value)}
                            </span>
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