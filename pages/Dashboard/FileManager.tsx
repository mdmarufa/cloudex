import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { FileCard } from '../../components/files/FileCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { 
  Folder, 
  ChevronRight, 
  Plus, 
  Search, 
  ArrowUpDown,
  Home,
  ChevronLeft,
  Grid,
  List,
  MoreVertical,
  FolderPlus,
  ArrowUp,
  Download,
  Trash2,
  HardDrive,
  FileText
} from 'lucide-react';
import { FileItem, FileType } from '../../types';

// --- Premium Folder Component ---
interface FolderProps {
  name: string;
  count: number;
  color?: string;
  onClick: () => void;
}

const PremiumFolder: React.FC<FolderProps> = ({ name, count, color = 'blue', onClick }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500', 
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500',
  };

  const bgColor = colorMap[color] || colorMap.blue;

  return (
    <div 
        onClick={onClick}
        className="group relative w-full aspect-[4/3] sm:aspect-[3/2] cursor-pointer perspective-1000 select-none animate-in zoom-in-95 duration-300"
    >
        {/* Hover Lift Effect Container */}
        <div className="relative w-full h-full transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.02]">
            
            {/* Folder Tab (Back) */}
            <div className={`absolute top-0 left-0 w-[40%] h-4 ${bgColor} rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity`}></div>
            
            {/* Folder Body (Main) */}
            <div className={`absolute top-3 inset-x-0 bottom-0 ${bgColor} rounded-b-xl rounded-tr-xl shadow-lg shadow-blue-900/5 group-hover:shadow-2xl group-hover:shadow-blue-500/20 transition-all overflow-hidden flex flex-col justify-between p-4`}>
                
                {/* Decorative gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

                {/* Content */}
                <div className="relative z-10 flex justify-between items-start text-white/90">
                     <Folder size={28} className="fill-white/20 text-white" />
                     <button className="opacity-0 group-hover:opacity-100 hover:bg-black/10 p-1 rounded-full transition-all">
                        <MoreVertical size={16} />
                     </button>
                </div>

                <div className="relative z-10">
                    <h3 className="font-bold text-white text-lg truncate tracking-wide drop-shadow-sm">{name}</h3>
                    <p className="text-white/70 text-xs font-medium mt-0.5 flex items-center gap-1">
                        {count} items
                    </p>
                </div>
            </div>

            {/* Folder "Lip" (Visual Depth) */}
            <div className="absolute top-[13px] inset-x-0 h-[1px] bg-white/30 z-20"></div>
        </div>
    </div>
  );
};

export const FileManagerPage: React.FC = () => {
  const { files, loading } = useSelector((state: RootState) => state.dashboard);
  
  // Navigation State
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- Virtual File System Logic ---
  
  // 1. Get derived folders and files for the current path
  const directoryContent = useMemo(() => {
    // Determine which files belong strictly to this directory
    const filesInDir = files.filter(f => f.path === currentPath || f.path === (currentPath === '/' ? '/' : currentPath));

    // Determine virtual folders based on paths of ALL files
    // E.g. if currentPath is '/' and we have file at '/Images/Vacation', we need to show 'Images' folder.
    const foldersMap = new Map<string, number>(); // Name -> Item Count

    files.forEach(file => {
        // Normalize path
        const fileDir = file.path.startsWith('/') ? file.path : `/${file.path}`;
        
        // If file is deeper than current path, find the immediate child folder
        if (fileDir.startsWith(currentPath) && fileDir !== currentPath) {
            // Remove current path prefix
            const relativePath = currentPath === '/' ? fileDir.substring(1) : fileDir.substring(currentPath.length + 1);
            
            // Get the first segment (immediate folder name)
            const folderName = relativePath.split('/')[0];
            
            if (folderName) {
                foldersMap.set(folderName, (foldersMap.get(folderName) || 0) + 1);
            }
        }
    });

    const folders = Array.from(foldersMap.entries()).map(([name, count]) => ({ name, count }));

    // Local Search Filtering
    if (searchQuery.trim()) {
        const lowerQ = searchQuery.toLowerCase();
        return {
            folders: folders.filter(f => f.name.toLowerCase().includes(lowerQ)),
            files: filesInDir.filter(f => f.name.toLowerCase().includes(lowerQ))
        };
    }

    return { folders, files: filesInDir };
  }, [files, currentPath, searchQuery]);

  // Navigation Handlers
  const handleNavigateUp = () => {
      if (currentPath === '/') return;
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
      setCurrentPath(parentPath);
  };

  const handleNavigateFolder = (folderName: string) => {
      const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
      setCurrentPath(newPath);
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  // Folder Color Logic (Mock)
  const getFolderColor = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes('image') || n.includes('photo')) return 'purple';
      if (n.includes('doc') || n.includes('work')) return 'blue';
      if (n.includes('finance') || n.includes('budget')) return 'emerald';
      if (n.includes('video')) return 'rose';
      if (n.includes('archive')) return 'orange';
      return 'slate';
  };

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-3">
                   <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 text-white">
                       <HardDrive size={24} />
                   </div>
                   <div>
                       <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">File Manager</h1>
                       <p className="text-slate-500 text-sm">Browse and manage your file system</p>
                   </div>
              </div>
              
              <div className="flex items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                          type="text" 
                          placeholder="Search current folder..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                      <FolderPlus size={18} />
                      <span className="hidden sm:inline">New Folder</span>
                  </button>
              </div>
          </div>

          {/* Breadcrumb Navigation Bar */}
          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={handleNavigateUp}
                disabled={currentPath === '/'}
                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                  <ArrowUp size={18} />
              </button>
              
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <div className="flex items-center flex-wrap gap-1 flex-1 overflow-hidden">
                  <button 
                    onClick={() => setCurrentPath('/')}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-bold transition-colors ${currentPath === '/' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                      <Home size={14} />
                      <span>Root</span>
                  </button>
                  
                  {breadcrumbs.map((crumb, idx) => {
                      const path = '/' + breadcrumbs.slice(0, idx + 1).join('/');
                      return (
                        <React.Fragment key={path}>
                            <ChevronRight size={14} className="text-slate-300" />
                            <button 
                                onClick={() => setCurrentPath(path)}
                                className={`px-2 py-1.5 rounded-lg text-sm font-bold transition-colors ${path === currentPath ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                            >
                                {crumb}
                            </button>
                        </React.Fragment>
                      );
                  })}
              </div>

              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Grid size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <List size={16} />
                    </button>
               </div>
          </div>
      </div>

      {/* --- Content Area --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {loading ? (
             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                 {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
             </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Folders Section */}
                {directoryContent.folders.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Folders</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                            {directoryContent.folders.map(folder => (
                                <PremiumFolder 
                                    key={folder.name} 
                                    name={folder.name} 
                                    count={folder.count} 
                                    color={getFolderColor(folder.name)}
                                    onClick={() => handleNavigateFolder(folder.name)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Files Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Files</h2>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                            {directoryContent.files.length} items
                        </span>
                    </div>

                    {directoryContent.files.length > 0 ? (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                                {directoryContent.files.map(file => (
                                    <FileCard key={file.id} file={file} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                {directoryContent.files.map((file, idx) => (
                                    <div key={file.id} className={`flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors group`}>
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors`}>
                                                {/* Simple Icon Logic */}
                                                <FileText size={18} /> 
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{file.name}</p>
                                                <p className="text-xs text-slate-400 md:hidden">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <div className="hidden md:block w-32 text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                        <div className="hidden md:block w-32 text-sm text-slate-500">{new Date(file.modifiedAt).toLocaleDateString()}</div>
                                        <div className="w-10 flex justify-end">
                                            <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        directoryContent.folders.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/20">
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <Folder size={32} className="text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">This folder is empty</h3>
                                <p className="text-slate-500 text-sm mt-1 mb-6">Drag files here or create a new folder</p>
                                <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                    Upload Files
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
          )}
      </div>

      {/* --- Visual Drop Zone Hint --- */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 transition-opacity">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold">
             <Download size={20} />
             <span>Drop files to upload to {currentPath === '/' ? 'Root' : currentPath.split('/').pop()}</span>
          </div>
      </div>

    </div>
  );
};