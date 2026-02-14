import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { FileCard } from '../../components/files/FileCard';
import { FileType } from '../../types';
import { 
  Image as ImageIcon, 
  Video, 
  Music, 
  Layers, 
  LayoutGrid, 
  Settings2,
  Plus
} from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const { files } = useSelector((state: RootState) => state.dashboard);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'audio'>('all');

  // Filter Logic
  const assetFiles = files.filter(f => 
    [FileType.IMAGE, FileType.VIDEO, FileType.AUDIO].includes(f.type)
  );

  const filteredAssets = activeTab === 'all' 
    ? assetFiles 
    : assetFiles.filter(f => {
        if (activeTab === 'images') return f.type === FileType.IMAGE;
        if (activeTab === 'videos') return f.type === FileType.VIDEO;
        if (activeTab === 'audio') return f.type === FileType.AUDIO;
        return false;
    });

  const TabButton = ({ id, label, icon: Icon, count }: any) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
            activeTab === id 
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg shadow-slate-900/20' 
            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
          {Icon && <Icon size={14} />}
          <span>{label}</span>
          <span className={`ml-1 text-[10px] px-1.5 rounded-full ${activeTab === id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {count}
          </span>
      </button>
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
         <div>
             <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                 <Layers className="text-blue-500" />
                 Asset Library
             </h1>
             <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                 Centralized hub for all your creative media assets.
             </p>
         </div>
         <div className="flex items-center gap-3">
             <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                 <Settings2 size={20} />
             </button>
             <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all active:scale-95">
                 <Plus size={18} strokeWidth={2.5} />
                 <span>Add Asset</span>
             </button>
         </div>
      </div>

      {/* --- Filter Tabs --- */}
      <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <TabButton id="all" label="All Assets" icon={LayoutGrid} count={assetFiles.length} />
          <TabButton id="images" label="Images" icon={ImageIcon} count={assetFiles.filter(f => f.type === FileType.IMAGE).length} />
          <TabButton id="videos" label="Videos" icon={Video} count={assetFiles.filter(f => f.type === FileType.VIDEO).length} />
          <TabButton id="audio" label="Audio" icon={Music} count={assetFiles.filter(f => f.type === FileType.AUDIO).length} />
      </div>

      {/* --- Visual Grid --- */}
      <div>
          {filteredAssets.length > 0 ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredAssets.map(file => (
                    <div key={file.id} className="relative group">
                         <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                         <div className="relative transform transition-transform duration-300 hover:-translate-y-1">
                             <FileCard file={file} />
                         </div>
                    </div>
                ))}
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30">
                 <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6">
                     <Layers size={40} className="text-slate-300 dark:text-slate-600" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">No assets found</h3>
                 <p className="text-slate-500 dark:text-slate-400 mt-2">
                     Upload images, videos, or audio to populate your library.
                 </p>
             </div>
          )}
      </div>
    </div>
  );
};