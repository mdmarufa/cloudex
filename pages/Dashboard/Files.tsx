import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { FileCard } from '../../components/files/FileCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { 
  Filter, 
  Grid, 
  List, 
  Folder, 
  ChevronRight, 
  Plus, 
  Search, 
  ArrowUpDown,
  FileText,
  MoreHorizontal,
  X,
  Calendar,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Check,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { FileType } from '../../types';
import { FORMAT_BYTES } from '../../constants';

export const FilesPage: React.FC = () => {
  const { files, loading } = useSelector((state: RootState) => state.dashboard);
  
  // View State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FileType | 'ALL'>('ALL');
  const [filterDate, setFilterDate] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');
  
  // Sort State
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'size' | 'modifiedAt'; direction: 'asc' | 'desc' }>({ 
    key: 'modifiedAt', 
    direction: 'desc' 
  });

  // --- Filtering Logic ---
  const processedFiles = useMemo(() => {
    let result = [...files];

    // 1. Search Term
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(lowerTerm));
    }

    // 2. Type Filter
    if (filterType !== 'ALL') {
      result = result.filter(f => f.type === filterType);
    }

    // 3. Date Filter
    if (filterDate !== 'ALL') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      result = result.filter(f => {
        const fileDate = new Date(f.modifiedAt);
        switch (filterDate) {
          case 'TODAY': 
            return fileDate >= todayStart;
          case 'WEEK': 
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return fileDate >= weekAgo;
          case 'MONTH':
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            return fileDate >= monthAgo;
          case 'YEAR':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return fileDate >= yearStart;
          default:
            return true;
        }
      });
    }

    // 4. Sorting
    result.sort((a, b) => {
      let valA: any = a[sortConfig.key];
      let valB: any = b[sortConfig.key];

      if (sortConfig.key === 'name') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      } else if (sortConfig.key === 'modifiedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [files, searchTerm, filterType, filterDate, sortConfig]);

  // --- Handlers ---
  const handleSort = (key: 'name' | 'size' | 'modifiedAt') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
    setIsSortOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setFilterDate('ALL');
  };

  const hasActiveFilters = filterType !== 'ALL' || filterDate !== 'ALL';

  // Quick Access Folders
  const folders = [
      { id: 'f_docs', name: 'Documents', count: 12, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      { id: 'f_fin', name: 'Finance', count: 5, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
      { id: 'f_work', name: 'Work Projects', count: 8, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
      { id: 'f_pers', name: 'Personal', count: 3, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* --- Premium Header Section --- */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">
                  <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
                  <ChevronRight size={14} />
                  <span className="text-slate-900 dark:text-white font-bold">My Files</span>
               </div>
               <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">All Files</h1>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-95 transition-all">
                    <Plus size={18} strokeWidth={2.5} />
                    <span>Upload</span>
                </button>
            </div>
        </div>

        {/* --- Quick Access Folders --- */}
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pl-1">Quick Access</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {folders.map(folder => (
                    <div 
                        key={folder.id}
                        className="group p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md cursor-pointer transition-all duration-200"
                    >
                        <div className="flex justify-between items-start mb-2">
                             <Folder size={24} className={`${folder.color} fill-current opacity-80 group-hover:scale-110 transition-transform duration-300`} />
                             <button className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400">
                                 <MoreHorizontal size={16} />
                             </button>
                        </div>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{folder.name}</h4>
                        <p className="text-xs text-slate-400 font-medium mt-1">{folder.count} items</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* --- Main File Area --- */}
      <div className="space-y-4">
          
          {/* Toolbar */}
          <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-10 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
             
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 {/* Left: Search/Filter */}
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                     <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter current view..." 
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={14} />
                            </button>
                        )}
                     </div>
                     <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`p-2 rounded-lg transition-all border ${isFilterOpen || hasActiveFilters ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-transparent'}`}
                        title="Advanced Filters"
                     >
                         <Filter size={18} />
                     </button>
                 </div>

                 {/* Right: Sort & Layout */}
                 <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                     
                     {/* Sort Dropdown */}
                     <div className="relative">
                         <button 
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                         >
                             <span>
                                 {sortConfig.key === 'modifiedAt' ? 'Date Modified' : sortConfig.key === 'name' ? 'Name' : 'Size'}
                             </span>
                             <ArrowUpDown size={12} />
                         </button>
                         
                         {isSortOpen && (
                             <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1 z-20 overflow-hidden animate-in fade-in zoom-in-95">
                                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort By</div>
                                    {[
                                        { label: 'Name', key: 'name' },
                                        { label: 'Date Modified', key: 'modifiedAt' },
                                        { label: 'Size', key: 'size' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.key}
                                            onClick={() => handleSort(opt.key as any)}
                                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${sortConfig.key === opt.key ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            <span>{opt.label}</span>
                                            {sortConfig.key === opt.key && (
                                                sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                             </>
                         )}
                     </div>

                     <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                     
                     <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                     </div>
                 </div>
             </div>

             {/* Advanced Filter Panel */}
             {(isFilterOpen || hasActiveFilters) && (
                 <div className={`
                    border-t border-slate-100 dark:border-slate-800 pt-4 px-2
                    grid grid-cols-1 md:grid-cols-2 gap-6
                    animate-in slide-in-from-top-2 fade-in duration-200
                 `}>
                     {/* File Type Filter */}
                     <div>
                         <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">File Type</label>
                         <div className="flex flex-wrap gap-2">
                             {[
                                 { label: 'All', value: 'ALL', icon: null },
                                 { label: 'Docs', value: FileType.DOCUMENT, icon: FileText },
                                 { label: 'Images', value: FileType.IMAGE, icon: ImageIcon },
                                 { label: 'Videos', value: FileType.VIDEO, icon: Video },
                                 { label: 'Audio', value: FileType.AUDIO, icon: Music },
                                 { label: 'Archives', value: FileType.ARCHIVE, icon: Archive },
                             ].map(opt => (
                                 <button
                                     key={opt.value}
                                     onClick={() => setFilterType(opt.value as any)}
                                     className={`
                                         flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                         ${filterType === opt.value 
                                            ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white shadow-md' 
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                                     `}
                                 >
                                     {opt.icon && <opt.icon size={12} />}
                                     <span>{opt.label}</span>
                                 </button>
                             ))}
                         </div>
                     </div>

                     {/* Date Filter */}
                     <div>
                         <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Last Modified</label>
                         <div className="flex flex-wrap gap-2">
                             {[
                                 { label: 'Any Time', value: 'ALL' },
                                 { label: 'Today', value: 'TODAY' },
                                 { label: 'Last 7 Days', value: 'WEEK' },
                                 { label: 'Last 30 Days', value: 'MONTH' },
                                 { label: 'This Year', value: 'YEAR' },
                             ].map(opt => (
                                 <button
                                     key={opt.value}
                                     onClick={() => setFilterDate(opt.value as any)}
                                     className={`
                                         px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                         ${filterDate === opt.value 
                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                                     `}
                                 >
                                     {opt.label}
                                 </button>
                             ))}
                         </div>
                     </div>

                     {hasActiveFilters && (
                         <div className="md:col-span-2 flex justify-end">
                             <button 
                                onClick={clearFilters}
                                className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                             >
                                 <X size={12} />
                                 Clear Filters
                             </button>
                         </div>
                     )}
                 </div>
             )}
          </div>

          {/* Active Filter Chips (Summary) */}
          {!isFilterOpen && hasActiveFilters && (
              <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Filtered by:</span>
                  {filterType !== 'ALL' && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1">
                          {filterType}
                          <button onClick={() => setFilterType('ALL')}><X size={10} /></button>
                      </span>
                  )}
                  {filterDate !== 'ALL' && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1">
                          Date: {filterDate.toLowerCase()}
                          <button onClick={() => setFilterDate('ALL')}><X size={10} /></button>
                      </span>
                  )}
                  <button onClick={clearFilters} className="text-xs text-slate-500 underline ml-2">Clear all</button>
              </div>
          )}

          {/* Content Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                 <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-48">
                    <Skeleton className="h-12 w-12 mb-4" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                 </div>
              ))}
            </div>
          ) : processedFiles.length > 0 ? (
            viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                {processedFiles.map(file => (
                    <FileCard key={file.id} file={file} />
                ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <th 
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Name
                                        {sortConfig.key === 'name' && (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-4">Owner</th>
                                <th 
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                                    onClick={() => handleSort('size')}
                                >
                                    <div className="flex items-center gap-1">
                                        Size
                                        {sortConfig.key === 'size' && (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-4">Type</th>
                                <th 
                                    className="px-6 py-4 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                                    onClick={() => handleSort('modifiedAt')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Modified
                                        {sortConfig.key === 'modifiedAt' && (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {processedFiles.map(file => (
                                <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{file.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                {file.owner.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{file.owner}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-sm font-mono text-slate-500">
                                        {FORMAT_BYTES(file.size)}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                                            {file.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right text-sm text-slate-500">
                                        {new Date(file.modifiedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4">
                    <Grid size={32} className="text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">No files found</h3>
                <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
                <button 
                    onClick={clearFilters}
                    className="mt-4 text-blue-600 hover:text-blue-500 text-sm font-bold hover:underline"
                >
                    Clear all filters
                </button>
            </div>
          )}
      </div>
    </div>
  );
};