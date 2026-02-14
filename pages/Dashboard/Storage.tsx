// ... (imports remain the same)
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { FORMAT_BYTES } from '../../constants';
import { FileType } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { 
  PieChart as PieChartIcon, 
  Trash2, 
  Database, 
  HardDrive, 
  AlertTriangle, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Archive,
  MoreVertical,
  ArrowUpRight,
  Zap,
  CheckCircle,
  File,
  Users,
  History,
  TrendingUp,
  Clock,
  CloudLightning,
  ShieldAlert,
  DownloadCloud
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';

export const StoragePage: React.FC = () => {
  const { user, storageStats, files, loading } = useSelector((state: RootState) => state.dashboard);

  // --- Calculations ---
  
  // 1. User Quota
  const storageUsed = user?.storageUsed || 0;
  const storageLimit = user?.storageLimit || 1;
  const percentUsed = (storageUsed / storageLimit) * 100;
  const freeSpace = storageLimit - storageUsed;

  // 2. Shared Data (Files I have access to, but don't own - doesn't count towards MY quota usually, but good to know)
  const sharedFiles = useMemo(() => files.filter(f => f.owner !== 'Me'), [files]);
  const sharedSize = useMemo(() => sharedFiles.reduce((acc, f) => acc + f.size, 0), [sharedFiles]);

  // 3. Mocked "System" Data (Trash, Versions, Cache) - usually hidden overhead
  const trashSize = 1024 * 1024 * 1250; // 1.25 GB
  const versionsSize = 1024 * 1024 * 450; // 450 MB
  const cacheSize = 1024 * 1024 * 120; // 120 MB

  // --- Chart Data Preparation ---

  // Mock Trend Data (Forecast)
  const trendData = [
    { name: 'Jan', used: 45, limit: 100 },
    { name: 'Feb', used: 52, limit: 100 },
    { name: 'Mar', used: 48, limit: 100 },
    { name: 'Apr', used: 61, limit: 100 },
    { name: 'May', used: 58, limit: 100 },
    { name: 'Jun', used: 75, limit: 100 }, 
  ];

  // Shared Data Contributors (Who shares the most with me?)
  const contributorsData = [
    { name: 'Sarah', size: 2500000000 }, // 2.5GB
    { name: 'Marketing', size: 4200000000 }, // 4.2GB
    { name: 'Finance', size: 1500000000 }, // 1.5GB
    { name: 'Dev Team', size: 8500000000 }, // 8.5GB
  ];

  // Calculate specific file type counts based on existing stats
  const detailedStats = useMemo(() => {
    return storageStats.map(stat => {
        let typeFilter: FileType | undefined;
        let icon = File;
        
        switch(stat.name) {
            case 'Images': typeFilter = FileType.IMAGE; icon = ImageIcon; break;
            case 'Videos': typeFilter = FileType.VIDEO; icon = Video; break;
            case 'Documents': typeFilter = FileType.DOCUMENT; icon = FileText; break;
            case 'Audio': typeFilter = FileType.AUDIO; icon = Music; break;
            case 'Others': typeFilter = FileType.ARCHIVE; icon = Archive; break;
            default: icon = File;
        }

        const count = typeFilter 
            ? files.filter(f => f.type === typeFilter).length + Math.floor(Math.random() * 50) 
            : Math.floor(Math.random() * 100);

        return { ...stat, count, icon };
    });
  }, [storageStats, files]);

  // Find largest files (Cold Storage Candidates)
  const largestFiles = [...files]
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="w-1/3 h-8 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
            </div>
            <Skeleton className="h-64 rounded-3xl" />
        </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Database className="text-blue-600" />
                Storage Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
                Comprehensive breakdown of your cloud footprint and shared resources.
            </p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <DownloadCloud size={16} />
                <span>Export Report</span>
            </button>
        </div>
      </div>

      {/* --- Section 1: Key Metrics Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* My Storage (Quota) */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-500/20">
              <div className="absolute top-0 right-0 p-4 opacity-10"><HardDrive size={80} /></div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">My Storage</p>
              <h2 className="text-3xl font-extrabold mb-1">{FORMAT_BYTES(storageUsed)}</h2>
              <p className="text-blue-100 text-sm opacity-90 mb-4">of {FORMAT_BYTES(storageLimit)} used</p>
              <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-white/90 rounded-full" style={{ width: `${percentUsed}%` }}></div>
              </div>
          </div>

          {/* Shared Storage (External) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className={`
                absolute -right-12 -top-12 w-48 h-48 rounded-full 
                bg-gradient-to-tr from-purple-500 to-violet-600
                opacity-20 dark:opacity-25
                blur-0
                group-hover:scale-[2.5] group-hover:blur-2xl group-hover:opacity-15
                transition-all duration-1000 ease-[cubic-bezier(0.25,0.4,0.25,1)]
              `}></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-sm"><Users size={20} /></div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Shared with Me</p>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{FORMAT_BYTES(sharedSize)}</h2>
                <p className="text-slate-500 text-xs">Access to {sharedFiles.length} external files</p>
              </div>
          </div>

          {/* Trash / Recoverable */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className={`
                absolute -right-12 -top-12 w-48 h-48 rounded-full 
                bg-gradient-to-tr from-orange-500 to-amber-600
                opacity-20 dark:opacity-25
                blur-0
                group-hover:scale-[2.5] group-hover:blur-2xl group-hover:opacity-15
                transition-all duration-1000 ease-[cubic-bezier(0.25,0.4,0.25,1)]
              `}></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-sm"><Trash2 size={20} /></div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">In Trash</p>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{FORMAT_BYTES(trashSize)}</h2>
                <p className="text-slate-500 text-xs">Auto-delete in 30 days</p>
              </div>
          </div>

          {/* Versions / System */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className={`
                absolute -right-12 -top-12 w-48 h-48 rounded-full 
                bg-gradient-to-tr from-slate-400 to-gray-500
                opacity-20 dark:opacity-25
                blur-0
                group-hover:scale-[2.5] group-hover:blur-2xl group-hover:opacity-15
                transition-all duration-1000 ease-[cubic-bezier(0.25,0.4,0.25,1)]
              `}></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-sm"><History size={20} /></div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">File Versions</p>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{FORMAT_BYTES(versionsSize)}</h2>
                <p className="text-slate-500 text-xs">Hidden history usage</p>
              </div>
          </div>
      </div>

      {/* --- Section 2: Quota Breakdown & Trend --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main Usage Breakdown */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                 <h3 className="font-bold text-lg text-slate-900 dark:text-white">Storage Breakdown</h3>
                 <div className="flex items-center gap-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600 dark:text-slate-300">{FORMAT_BYTES(freeSpace)} free</span>
                 </div>
             </div>

             {/* Detailed Progress Bar */}
             <div className="relative h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex mb-8 border border-slate-100 dark:border-slate-700">
                 {storageStats.map((stat, idx) => {
                     const width = (stat.value / storageLimit) * 100;
                     return (
                         <div 
                            key={idx}
                            style={{ width: `${width}%`, backgroundColor: stat.color }}
                            className="h-full border-r border-white/10 last:border-0 hover:brightness-110 transition-all relative group flex items-center justify-center"
                         >
                            {width > 8 && (
                                <span className="text-[10px] font-bold text-white/90 drop-shadow-md truncate px-1">
                                    {Math.round(width)}%
                                </span>
                            )}
                         </div>
                     );
                 })}
             </div>

             {/* Categories Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {detailedStats.map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                          <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                      <Icon size={18} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{stat.name}</h4>
                                      <p className="text-[10px] text-slate-500">{stat.count} files</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="font-bold text-slate-900 dark:text-white text-xs">{FORMAT_BYTES(stat.value)}</p>
                              </div>
                          </div>
                      );
                  })}
             </div>
          </div>

          {/* Forecasting / Trend */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
             <div className="mb-6">
                 <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                     <TrendingUp size={18} className="text-blue-500" />
                     Growth Forecast
                 </h3>
                 <p className="text-xs text-slate-500 mt-1">Projected storage usage over time</p>
             </div>
             
             <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                            tickFormatter={(val) => `${val}GB`}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(val: number) => [`${val} GB`, 'Used']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="used" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorUsed)" 
                            animationDuration={1500}
                        />
                        {/* Threshold Line */}
                        <Area 
                             type="monotone"
                             dataKey="limit"
                             stroke="#94a3b8"
                             strokeDasharray="4 4"
                             fill="transparent"
                             strokeWidth={1}
                        />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
             
             <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex gap-3 items-start">
                 <CloudLightning size={16} className="text-blue-600 mt-0.5 shrink-0" />
                 <div>
                     <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Prediction</p>
                     <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-tight">
                         At current rate, you will reach <span className="font-bold">90% capacity</span> by October 2024.
                     </p>
                 </div>
             </div>
          </div>
      </div>

      {/* --- Section 3: Shared Storage Analytics --- */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-1 space-y-6">
                  <div>
                      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                          <Users className="text-purple-400" />
                          Shared Data
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                          This data is shared <strong>with you</strong> by other users. It does not count towards your personal storage quota, but managing it helps keep your workspace clean.
                      </p>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-sm font-medium text-slate-300">Total Shared Volume</span>
                          <span className="text-xl font-bold text-white">{FORMAT_BYTES(sharedSize)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-sm font-medium text-slate-300">External Contributors</span>
                          <span className="text-xl font-bold text-white">{contributorsData.length}</span>
                      </div>
                  </div>
              </div>

              {/* Contributors Chart */}
              <div className="lg:col-span-2 h-[250px] bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Top Contributors by Size</h4>
                  <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={contributorsData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} 
                            width={80}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                             cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                             contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                             formatter={(val: number) => FORMAT_BYTES(val)}
                          />
                          <Bar dataKey="size" radius={[0, 4, 4, 0]} barSize={20}>
                                {contributorsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'][index % 4]} />
                                ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>

          </div>
      </div>

      {/* --- Section 4: Deep Cleaning & Cold Storage --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cold Storage / Large Files */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="text-slate-400" size={20} />
                        Cold Storage Candidates
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Large files not accessed recently</p>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors">
                      Review All
                  </button>
              </div>
              
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                              <th className="pb-3 pl-2">File Name</th>
                              <th className="pb-3">Type</th>
                              <th className="pb-3">Last Modified</th>
                              <th className="pb-3 text-right">Size</th>
                              <th className="pb-3 text-right pr-2">Action</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm">
                          {largestFiles.map((file) => (
                              <tr key={file.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="py-3 pl-2 max-w-[180px]">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                                              {file.type === FileType.IMAGE ? <ImageIcon size={16} /> : <FileText size={16} />}
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-slate-700 dark:text-slate-200 truncate" title={file.name}>{file.name}</span>
                                            <span className="text-[10px] text-slate-400">{file.path}</span>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="py-3 text-slate-500">
                                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold tracking-wide uppercase">{file.type}</span>
                                  </td>
                                  <td className="py-3 text-slate-500 text-xs">
                                      {new Date(file.modifiedAt).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 text-right font-bold text-slate-700 dark:text-slate-300">
                                      {FORMAT_BYTES(file.size)}
                                  </td>
                                  <td className="py-3 text-right pr-2">
                                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                                          <Trash2 size={16} />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Granular Optimization Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <ShieldAlert className="text-emerald-500" size={20} />
                  Quick Cleanup
              </h3>
              
              <div className="grid grid-cols-1 gap-3 flex-1">
                  
                  {/* Action 1: Trash */}
                  <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg"><Trash2 size={18} /></div>
                          <span className="text-xs font-bold text-orange-700 dark:text-orange-300">{FORMAT_BYTES(trashSize)}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Empty Trash Bin</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Permanently delete items older than 30 days.</p>
                  </div>

                  {/* Action 2: Versions */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                          <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"><History size={18} /></div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{FORMAT_BYTES(versionsSize)}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Prune Old Versions</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Keep only last 3 versions of documents.</p>
                  </div>

                  {/* Action 3: Cache */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                          <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"><Zap size={18} /></div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{FORMAT_BYTES(cacheSize)}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Clear App Cache</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Remove temporary thumbnails and previews.</p>
                  </div>

              </div>
          </div>
      </div>

    </div>
  );
};