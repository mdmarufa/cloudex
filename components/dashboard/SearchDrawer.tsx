import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { RootState } from '../../store/store';
import { 
  X, Search, Filter, FileText, Image as ImageIcon, Video, 
  Music, Archive, Calendar, User, ArrowRight, Clock, Folder,
  LayoutGrid, List as ListIcon, ChevronDown, ArrowUp, ArrowDown, Check
} from 'lucide-react';
import { FileItem, FileType } from '../../types';
import { FileCard } from '../files/FileCard';
import { FORMAT_BYTES } from '../../constants';
import { Skeleton } from '../ui/Skeleton';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type SortOption = 'date' | 'name' | 'size';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';
type DateRange = 'all' | '7days' | '30days' | 'year';

export const SearchDrawer: React.FC<SearchDrawerProps> = ({ isOpen, onClose }) => {
  const { files } = useSelector((state: RootState) => state.dashboard);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // --- Derived State from URL ---
  const urlQuery = searchParams.get('q') || '';
  const urlType = (searchParams.get('type') as FileType | 'ALL' | 'PDF' | 'DOC') || 'ALL';
  const urlDate = (searchParams.get('date') as DateRange) || 'all';
  const urlSort = (searchParams.get('sort') as SortOption) || 'date';
  const urlOrder = (searchParams.get('order') as SortDirection) || 'desc';
  const urlView = (searchParams.get('view') as ViewMode) || 'grid';

  // --- Local State ---
  // Local input state allows for immediate typing feedback before syncing to URL
  const [localSearchTerm, setLocalSearchTerm] = useState(urlQuery);
  const [isClosing, setIsClosing] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  // 1. Sync URL to Local State (Handle Back/Forward navigation)
  useEffect(() => {
    setLocalSearchTerm(urlQuery);
  }, [urlQuery]);

  // 2. Debounce Input & Sync Local State to URL
  useEffect(() => {
    if (localSearchTerm === urlQuery) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const handler = setTimeout(() => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (localSearchTerm) {
                newParams.set('q', localSearchTerm);
            } else {
                newParams.delete('q');
            }
            return newParams;
        }, { replace: true });
        setIsLoading(false);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [localSearchTerm, setSearchParams, urlQuery]);

  // 3. Focus & Scroll Lock
  useEffect(() => {
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // 4. Click Outside for Date Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
            setIsDateDropdownOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        setIsClosing(false);
        onClose();
    }, 300);
  };

  const updateParam = (key: string, value: string) => {
      setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          if (value && value !== 'all' && value !== 'ALL') {
              newParams.set(key, value);
          } else {
              newParams.delete(key);
          }
          return newParams;
      }, { replace: true });
  };

  const toggleSort = (key: SortOption) => {
      if (urlSort === key) {
          updateParam('order', urlOrder === 'asc' ? 'desc' : 'asc');
      } else {
          setSearchParams(prev => {
              const newParams = new URLSearchParams(prev);
              newParams.set('sort', key);
              newParams.set('order', 'desc'); // Reset to desc on new sort key
              return newParams;
          }, { replace: true });
      }
  };

  // --- Filtering Logic ---
  const filteredFiles = useMemo(() => {
      let result = files;

      // 1. Text Search (Use urlQuery for the actual filtered results)
      if (urlQuery) {
          result = result.filter(file => 
              file.name.toLowerCase().includes(urlQuery.toLowerCase())
          );
      }

      // 2. Type Filtering
      if (urlType !== 'ALL') {
          if (urlType === 'PDF') {
              result = result.filter(f => f.name.toLowerCase().endsWith('.pdf'));
          } else if (urlType === 'DOC') {
              result = result.filter(f => f.name.toLowerCase().match(/\.(doc|docx)$/));
          } else {
              result = result.filter(file => file.type === urlType);
          }
      }

      // 3. Date Filtering
      if (urlDate !== 'all') {
          const now = new Date();
          const fileDate = (dateStr: string) => new Date(dateStr);
          
          if (urlDate === '7days') {
             const limit = new Date(now.setDate(now.getDate() - 7));
             result = result.filter(f => fileDate(f.modifiedAt) >= limit);
          } else if (urlDate === '30days') {
             const limit = new Date(now.setDate(now.getDate() - 30));
             result = result.filter(f => fileDate(f.modifiedAt) >= limit);
          } else if (urlDate === 'year') {
             const startOfYear = new Date(new Date().getFullYear(), 0, 1);
             result = result.filter(f => fileDate(f.modifiedAt) >= startOfYear);
          }
      }

      // 4. Sorting
      result = [...result].sort((a, b) => {
          let valA: any = a[urlSort === 'date' ? 'modifiedAt' : urlSort];
          let valB: any = b[urlSort === 'date' ? 'modifiedAt' : urlSort];
          
          if (urlSort === 'name') {
              valA = a.name.toLowerCase();
              valB = b.name.toLowerCase();
          }

          if (valA < valB) return urlOrder === 'asc' ? -1 : 1;
          if (valA > valB) return urlOrder === 'asc' ? 1 : -1;
          return 0;
      });

      return result;
  }, [files, urlQuery, urlType, urlDate, urlSort, urlOrder]);

  const dateOptions: {value: DateRange, label: string}[] = [
    { value: 'all', label: 'Any Time' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: 'year', label: 'This Year' },
  ];
  
  const selectedDateLabel = dateOptions.find(d => d.value === urlDate)?.label;

  const handleClearFilters = () => {
      setLocalSearchTerm('');
      setSearchParams(new URLSearchParams(), { replace: true });
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-white dark:bg-slate-950 transition-opacity duration-300 flex flex-col ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Header Section */}
      <div className="flex-none flex flex-col border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm z-10">
        
        {/* Top Bar: Close */}
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 max-w-7xl mx-auto w-full">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="text-blue-600" size={20} />
                Global Search
            </h2>
            <button 
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
            >
                <X size={24} />
            </button>
        </div>

        {/* Main Input Area */}
        <div className="px-4 sm:px-6 pb-6 max-w-5xl mx-auto w-full">
            <div className="relative group mb-4">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLoading ? 'text-blue-500 animate-pulse' : 'text-slate-400 group-focus-within:text-blue-500'}`} size={24} />
                <input 
                    ref={inputRef}
                    type="text" 
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    placeholder="Search files by name, extension..."
                    className="w-full h-14 pl-14 pr-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-inner"
                />
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                
                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap flex-1">
                    <FilterChip 
                        label="All" 
                        active={urlType === 'ALL'} 
                        onClick={() => updateParam('type', 'ALL')} 
                    />
                    <FilterChip 
                        label="Images" 
                        icon={ImageIcon} 
                        active={urlType === FileType.IMAGE} 
                        onClick={() => updateParam('type', FileType.IMAGE)} 
                    />
                    <FilterChip 
                        label="Docs" 
                        icon={FileText} 
                        active={urlType === 'DOC'} 
                        onClick={() => updateParam('type', 'DOC')} 
                    />
                     <FilterChip 
                        label="PDF" 
                        icon={FileText} 
                        active={urlType === 'PDF'} 
                        onClick={() => updateParam('type', 'PDF')} 
                    />
                    <FilterChip 
                        label="Videos" 
                        icon={Video} 
                        active={urlType === FileType.VIDEO} 
                        onClick={() => updateParam('type', FileType.VIDEO)} 
                    />
                    <FilterChip 
                        label="Zip" 
                        icon={Archive} 
                        active={urlType === FileType.ARCHIVE} 
                        onClick={() => updateParam('type', FileType.ARCHIVE)} 
                    />
                </div>

                {/* Sort & View Actions */}
                <div className="flex items-center gap-2 sm:border-l sm:pl-4 border-slate-200 dark:border-slate-800">
                    
                    {/* Custom Date Dropdown */}
                    <div className="relative" ref={dateDropdownRef}>
                        <button 
                            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                urlDate !== 'all' 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Calendar size={14} />
                            <span>{selectedDateLabel}</span>
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isDateDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                {dateOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            updateParam('date', option.value);
                                            setIsDateDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                            urlDate === option.value
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <span>{option.label}</span>
                                        {urlDate === option.value && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                         <button 
                            onClick={() => toggleSort(urlSort)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                         >
                             <span>{urlSort === 'date' ? 'Date' : urlSort === 'name' ? 'Name' : 'Size'}</span>
                             {urlOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                         </button>
                    </div>

                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                    {/* View Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button 
                            onClick={() => updateParam('view', 'grid')}
                            className={`p-1.5 rounded transition-all ${urlView === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button 
                            onClick={() => updateParam('view', 'list')}
                            className={`p-1.5 rounded transition-all ${urlView === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            <ListIcon size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 bg-slate-50/50 dark:bg-black/20 custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full h-full">
            
            {/* Show Recent Searches only if empty query and "ALL" filters */}
            {!urlQuery && urlType === 'ALL' && urlDate === 'all' ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                             <Clock size={16} /> Recent Searches
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {['Q4 Financial Report', 'Project Alpha', 'Marketing Assets', 'Tax 2024'].map((s, i) => (
                                <button key={i} onClick={() => setLocalSearchTerm(s)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm text-slate-700 dark:text-slate-300 transition-all">
                                    <span>{s}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                             {isLoading ? (
                                 <span className="animate-pulse">Searching...</span>
                             ) : (
                                 <>
                                    Results <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400">{filteredFiles.length}</span>
                                 </>
                             )}
                         </h3>
                    </div>
                    
                    {isLoading ? (
                        /* Skeleton Loading State */
                        urlView === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                                {[1,2,3,4,5,6,7,8].map(i => (
                                    <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-48">
                                        <Skeleton className="h-12 w-12 mb-4 rounded-lg" />
                                        <Skeleton className="h-5 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="flex items-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                                        <Skeleton className="w-10 h-10 rounded-lg mr-4" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="w-1/3 h-4" />
                                            <Skeleton className="w-1/4 h-3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : filteredFiles.length > 0 ? (
                        urlView === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 pb-20 animate-in fade-in zoom-in-95 duration-300">
                                {filteredFiles.map(file => (
                                    <FileCard key={file.id} file={file} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 mb-2">
                                    <div className="col-span-6">Name</div>
                                    <div className="col-span-2">Size</div>
                                    <div className="col-span-2">Type</div>
                                    <div className="col-span-2 text-right">Modified</div>
                                </div>
                                {filteredFiles.map(file => (
                                    <FileListItem key={file.id} file={file} />
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Search size={40} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No results found</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
                                No files match "<span className="text-blue-500 font-medium">{urlQuery}</span>" with the current filters.
                            </p>
                            <button 
                                onClick={handleClearFilters}
                                className="mt-6 text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const FilterChip = ({ label, icon: Icon, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
            active 
            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
    >
        {Icon && <Icon size={14} />}
        <span>{label}</span>
    </button>
);

const FileListItem: React.FC<{ file: FileItem }> = ({ file }) => {
    const iconColor = 
        file.type === FileType.IMAGE ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' :
        file.type === FileType.VIDEO ? 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' :
        file.type === FileType.FOLDER ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
        'text-slate-500 bg-slate-50 dark:bg-slate-800';

    return (
        <div className="group flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all items-center shadow-sm">
            <div className="col-span-6 flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${iconColor}`}>
                    {file.type === FileType.IMAGE ? <ImageIcon size={18} /> : 
                     file.type === FileType.VIDEO ? <Video size={18} /> : 
                     file.type === FileType.FOLDER ? <Folder size={18} /> : 
                     <FileText size={18} />}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">{file.name}</p>
                    <p className="md:hidden text-xs text-slate-500">{FORMAT_BYTES(file.size)} • {new Date(file.modifiedAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="hidden md:block col-span-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                {FORMAT_BYTES(file.size)}
            </div>
             <div className="hidden md:block col-span-2">
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {file.type}
                 </span>
            </div>
            <div className="hidden md:block col-span-2 text-right text-sm text-slate-500 dark:text-slate-500">
                {new Date(file.modifiedAt).toLocaleDateString()}
            </div>
        </div>
    );
}