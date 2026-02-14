import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { deleteFile, createFolder, renameItem, addFiles } from '../../store/dashboardSlice';
import { FileCard } from '../../components/files/FileCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { 
  Folder, 
  ChevronRight, 
  Search, 
  Home,
  Grid,
  List,
  MoreVertical,
  FolderPlus,
  ArrowUp,
  Download,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Share2,
  Lock,
  Archive,
  Star,
  Edit2,
  Trash2,
  MoreHorizontal,
  HardDrive,
  X,
  AlertCircle,
  CornerDownLeft,
  Upload,
  CloudUpload
} from 'lucide-react';
import { FileItem, FileType } from '../../types';

// --- Types & Interfaces ---

interface FolderProps {
  folder: { name: string; count: number; id?: string };
  onClick: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

// --- Dynamic Folder Icon Logic ---
const getFolderTheme = (name: string) => {
    const n = name.toLowerCase();
    // 1. Media Types
    if (n.includes('image') || n.includes('photo') || n.includes('pic')) 
        return { color: 'bg-purple-500', icon: ImageIcon, gradient: 'from-purple-500 to-fuchsia-600' };
    if (n.includes('video') || n.includes('movie') || n.includes('film')) 
        return { color: 'bg-rose-500', icon: Video, gradient: 'from-rose-500 to-red-600' };
    if (n.includes('music') || n.includes('audio') || n.includes('song')) 
        return { color: 'bg-sky-500', icon: Music, gradient: 'from-sky-500 to-cyan-600' };
    // 2. Functional Types
    if (n.includes('doc') || n.includes('work') || n.includes('project')) 
        return { color: 'bg-blue-500', icon: FileText, gradient: 'from-blue-500 to-indigo-600' };
    if (n.includes('finance') || n.includes('bill') || n.includes('receipt')) 
        return { color: 'bg-emerald-500', icon: Lock, gradient: 'from-emerald-500 to-teal-600' };
    if (n.includes('share') || n.includes('public')) 
        return { color: 'bg-indigo-500', icon: Share2, gradient: 'from-indigo-500 to-violet-600' };
    if (n.includes('archive') || n.includes('backup')) 
        return { color: 'bg-orange-500', icon: Archive, gradient: 'from-orange-500 to-amber-600' };
    if (n.includes('star') || n.includes('fav')) 
        return { color: 'bg-yellow-500', icon: Star, gradient: 'from-yellow-400 to-orange-500' };
    // Default
    return { color: 'bg-slate-500', icon: Folder, gradient: 'from-slate-500 to-slate-600' };
};

// --- Premium Folder Component ---
const PremiumFolder: React.FC<FolderProps> = ({ folder, onClick, onRename, onDelete, index }) => {
  const { color, icon: Icon, gradient } = getFolderTheme(folder.name);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (e: React.MouseEvent, action: 'rename' | 'delete') => {
      e.stopPropagation();
      setShowMenu(false);
      if (folder.id) {
        if (action === 'rename') onRename(folder.id, folder.name);
        if (action === 'delete') onDelete(folder.id);
      }
  };

  return (
    <div 
        onClick={onClick}
        className={`group relative w-full aspect-[4/3] sm:aspect-[3/2] cursor-pointer perspective-1000 select-none animate-in zoom-in-95 duration-500 fill-mode-both ${showMenu ? 'z-50' : 'z-0'}`}
        style={{ animationDelay: `${index * 50}ms` }}
    >
        <div className="relative w-full h-full transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.02]">
            {/* Folder Tab */}
            <div className={`absolute top-0 left-0 w-[40%] h-4 ${color} rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity`}></div>
            
            {/* Folder Body */}
            <div className={`absolute top-3 inset-x-0 bottom-0 bg-gradient-to-br ${gradient} rounded-b-2xl rounded-tr-2xl shadow-lg shadow-blue-900/5 group-hover:shadow-2xl group-hover:shadow-blue-500/20 transition-all overflow-hidden flex flex-col justify-between p-4`}>
                
                {/* Decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10 flex justify-between items-start text-white/95">
                     <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm border border-white/10 shadow-inner">
                        <Icon size={20} className="text-white drop-shadow-sm" />
                     </div>
                </div>
                <div className="relative z-10">
                    <h3 className="font-bold text-white text-lg truncate tracking-tight drop-shadow-md">{folder.name}</h3>
                    <p className="text-white/80 text-xs font-medium mt-0.5 flex items-center gap-1">{folder.count} items</p>
                </div>
            </div>

            {/* Menu Container */}
            <div className="absolute top-7 right-4 z-30" ref={menuRef}>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className={`p-1.5 rounded-full transition-all text-white ${showMenu ? 'bg-black/20 opacity-100' : 'opacity-0 group-hover:opacity-100 hover:bg-black/20'}`}
                 >
                    <MoreVertical size={16} />
                 </button>
                 {showMenu && (
                     <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 origin-top-right overflow-hidden">
                         <button onClick={(e) => handleAction(e, 'rename')} className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"><Edit2 size={12} /> Rename</button>
                         <button onClick={(e) => handleAction(e, 'delete')} className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Trash2 size={12} /> Delete</button>
                     </div>
                 )}
            </div>

            {/* Lip Visual */}
            <div className="absolute top-[13px] inset-x-0 h-[1px] bg-white/30 z-20 pointer-events-none"></div>
        </div>
    </div>
  );
};

// --- List View Item Component ---
const FileRowItem: React.FC<{ 
    file: FileItem; 
    onRename: (id: string, name: string) => void; 
    onDelete: (id: string) => void;
    index: number;
}> = ({ file, onRename, onDelete, index }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (action: 'rename' | 'delete') => {
        setShowMenu(false);
        if (action === 'rename') onRename(file.id, file.name);
        if (action === 'delete') onDelete(file.id);
    };

    return (
        <div 
            className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors group animate-in slide-in-from-bottom-2 duration-300 fill-mode-both"
            style={{ animationDelay: `${index * 30}ms` }}
        >
            <div className="flex-1 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors`}>
                    <FileText size={18} /> 
                </div>
                <div>
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{file.name}</p>
                    <p className="text-xs text-slate-400 md:hidden">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            </div>
            <div className="hidden md:block w-32 text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            <div className="hidden md:block w-32 text-sm text-slate-500">{new Date(file.modifiedAt).toLocaleDateString()}</div>
            <div className="w-10 flex justify-end relative" ref={menuRef}>
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className={`p-1.5 rounded-lg transition-colors ${showMenu ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                    <MoreVertical size={16} />
                </button>
                {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 origin-top-right overflow-hidden">
                        <button onClick={() => handleAction('rename')} className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"><Edit2 size={12} /> Rename</button>
                        <button onClick={() => handleAction('delete')} className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Trash2 size={12} /> Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Page Component ---
export const FileManagerPage: React.FC = () => {
  const dispatch = useDispatch();
  const { files, loading } = useSelector((state: RootState) => state.dashboard);
  
  // Navigation & View State
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Path Editing State
  const [isPathEditing, setIsPathEditing] = useState(false);
  const [pathInput, setPathInput] = useState('');
  const pathInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [modalMode, setModalMode] = useState<'create' | 'rename' | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Virtual File System Logic
  const directoryContent = useMemo(() => {
    const filesInDir = files.filter(f => f.path === currentPath || f.path === (currentPath === '/' ? '/' : currentPath));
    const foldersMap = new Map<string, { count: number, id?: string }>();

    // 1. Existing Folder Items
    filesInDir.filter(f => f.type === FileType.FOLDER).forEach(f => {
        foldersMap.set(f.name, { count: 0, id: f.id });
    });

    // 2. Virtual Folders
    files.forEach(file => {
        const fileDir = file.path.startsWith('/') ? file.path : `/${file.path}`;
        if (fileDir.startsWith(currentPath) && fileDir !== currentPath) {
            const relativePath = currentPath === '/' ? fileDir.substring(1) : fileDir.substring(currentPath.length + 1);
            const segments = relativePath.split('/');
            const folderName = segments[0];
            if (folderName) {
                const currentData = foldersMap.get(folderName) || { count: 0 };
                if (file.type !== FileType.FOLDER || segments.length > 1) {
                     foldersMap.set(folderName, { ...currentData, count: currentData.count + 1 });
                }
            }
        }
    });

    const folders: { name: string; count: number; id?: string }[] = Array.from(foldersMap.entries()).map(([name, data]) => ({ name, ...data }));
    const displayFiles = filesInDir.filter(f => f.type !== FileType.FOLDER);

    if (searchQuery.trim()) {
        const lowerQ = searchQuery.toLowerCase();
        return {
            folders: folders.filter(f => f.name.toLowerCase().includes(lowerQ)),
            files: displayFiles.filter(f => f.name.toLowerCase().includes(lowerQ))
        };
    }

    return { folders, files: displayFiles };
  }, [files, currentPath, searchQuery]);

  // --- Path Bar Handlers ---
  const handlePathClick = () => {
    setPathInput(currentPath);
    setIsPathEditing(true);
    setTimeout(() => pathInputRef.current?.focus(), 10);
  };

  const handlePathSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    let rawPath = pathInput.trim().replace(/\\/g, '/');

    // Handle "root" alias
    if (rawPath.toLowerCase().startsWith('/root')) {
        rawPath = rawPath.substring(5); // remove '/root'
        if (!rawPath.startsWith('/')) rawPath = '/' + rawPath;
        if (rawPath === '') rawPath = '/';
    }

    // Normalize logic
    if (!rawPath || rawPath === '.' || rawPath === './') {
        setIsPathEditing(false);
        return;
    }
    if (rawPath === '/') {
        setCurrentPath('/');
        setIsPathEditing(false);
        return;
    }
    if (!rawPath.startsWith('/')) rawPath = '/' + rawPath;
    if (rawPath.length > 1 && rawPath.endsWith('/')) rawPath = rawPath.slice(0, -1);

    // --- Intelligent Path Resolution (Case Insensitive & Virtual Aware) ---
    // We walk the path segments and verify if they exist in the file system (explicit or virtual)
    // If they exist, we use the correct casing from the system. If not, we use user's casing.
    const segments = rawPath.split('/').filter(Boolean);
    let resolvedPath = '/';

    // Helper: Get folder names at a specific path
    const getFoldersInPath = (parentPath: string) => {
        const folderNames = new Set<string>();
        // 1. Explicit Folder Items
        files.forEach(f => {
            if (f.path === parentPath && f.type === FileType.FOLDER) {
                folderNames.add(f.name);
            }
        });
        // 2. Virtual Folders from File Paths
        // If a file is at /Design/Assets/logo.png, then 'Assets' is a folder in '/Design'
        files.forEach(f => {
            const p = f.path;
            const prefix = parentPath === '/' ? '/' : parentPath + '/';
            if (p.startsWith(prefix)) {
                const relative = p.substring(prefix.length);
                const firstSegment = relative.split('/')[0];
                if (firstSegment) folderNames.add(firstSegment);
            }
        });
        return Array.from(folderNames);
    };

    let currentWalkPath = '/';
    
    for (const segment of segments) {
        const potentialFolders = getFoldersInPath(currentWalkPath);
        // Find a case-insensitive match
        const match = potentialFolders.find(f => f.toLowerCase() === segment.toLowerCase());
        
        if (match) {
            // Use existing folder name casing
            currentWalkPath = currentWalkPath === '/' ? `/${match}` : `${currentWalkPath}/${match}`;
        } else {
            // No match found - append user typed segment (new/empty folder path)
            currentWalkPath = currentWalkPath === '/' ? `/${segment}` : `${currentWalkPath}/${segment}`;
        }
    }

    setCurrentPath(currentWalkPath);
    setIsPathEditing(false);
  };

  const handlePathBlur = (e: React.FocusEvent) => {
    // Only close if we didn't click the submit button (handled by onMouseDown preventing focus loss)
    setIsPathEditing(false);
  };

  const handleNavigateUp = () => {
      if (currentPath === '/') return;
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
      setCurrentPath(parentPath);
  };

  const handleNavigateFolder = (folderName: string) => {
      const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
      setCurrentPath(newPath);
  };

  // --- Upload Logic ---
  const handleFileUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: FileItem[] = Array.from(fileList).map(file => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        let type = FileType.DOCUMENT;
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) type = FileType.IMAGE;
        else if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) type = FileType.VIDEO;
        else if (['mp3', 'wav', 'ogg'].includes(ext)) type = FileType.AUDIO;
        else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) type = FileType.ARCHIVE;

        return {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type,
            size: file.size,
            modifiedAt: new Date().toISOString(),
            owner: 'Me',
            isStarred: false,
            path: currentPath
        };
    });

    dispatch(addFiles(newFiles));
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Drag & Drop Handlers ---
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only set false if we are actually leaving the container (relatedTarget check)
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragging(false);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileUpload(e.dataTransfer.files);
      }
  };

  // Generic Item Handlers (Files + Folders)
  const openRenameModal = (id: string, currentName: string) => {
      setModalMode('rename');
      setActiveItemId(id);
      setInputValue(currentName);
  };

  const handleDeleteItem = (id: string) => {
      if (confirm('Are you sure you want to delete this item?')) {
          dispatch(deleteFile(id));
      }
  };

  const handleSubmitModal = () => {
      if (!inputValue.trim()) return;

      if (modalMode === 'create') {
          dispatch(createFolder({ name: inputValue.trim(), path: currentPath }));
      } else if (modalMode === 'rename' && activeItemId) {
          dispatch(renameItem({ id: activeItemId, newName: inputValue.trim() }));
      }

      setModalMode(null);
      setInputValue('');
      setActiveItemId(null);
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <div 
        className="space-y-6 pb-12 h-full flex flex-col relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      
      {/* --- Hidden File Input --- */}
      <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          className="hidden" 
          onChange={(e) => handleFileUpload(e.target.files)} 
      />

      {/* --- Drag Overlay --- */}
      {isDragging && (
          <div className="absolute inset-0 z-[60] bg-blue-500/10 backdrop-blur-sm border-4 border-dashed border-blue-500 rounded-3xl flex flex-col items-center justify-center animate-in fade-in duration-200 pointer-events-none">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-full shadow-2xl mb-4 animate-bounce">
                <CloudUpload size={48} className="text-blue-500" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Drop files to upload</h2>
             <p className="text-slate-600 dark:text-slate-300 font-medium mt-2">Add to {currentPath}</p>
          </div>
      )}

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
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-blue-500' : 'text-slate-400'}`} size={18} />
                      <input 
                          type="text" 
                          placeholder="Search current folder..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${searchQuery ? 'ring-2 ring-blue-500/20 bg-white dark:bg-slate-900' : ''}`}
                      />
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                      <Upload size={18} />
                      <span className="hidden sm:inline">Upload</span>
                  </button>
                  <button 
                    onClick={() => { setModalMode('create'); setInputValue(''); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                      <FolderPlus size={18} />
                      <span className="hidden sm:inline">New Folder</span>
                  </button>
              </div>
          </div>

          {/* Navigation Bar (Editable Path) */}
          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 h-14">
              <button onClick={handleNavigateUp} disabled={currentPath === '/'} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0">
                  <ArrowUp size={18} />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 flex-shrink-0"></div>
              
              <div 
                className="flex-1 overflow-hidden h-full px-2 mx-1 rounded-lg transition-all cursor-text hover:bg-white dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center"
                onClick={handlePathClick}
              >
                  {isPathEditing ? (
                      <form onSubmit={handlePathSubmit} className="w-full h-full flex items-center">
                          <input 
                            ref={pathInputRef}
                            type="text" 
                            value={pathInput}
                            onChange={(e) => setPathInput(e.target.value)}
                            onBlur={handlePathBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setIsPathEditing(false);
                                    setPathInput(currentPath);
                                }
                            }}
                            className="w-full h-full bg-transparent border-none outline-none text-sm font-mono text-slate-700 dark:text-slate-200 placeholder-slate-400 min-w-0"
                            autoComplete="off"
                            spellCheck={false}
                          />
                          <button 
                            type="submit" 
                            onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                            className="p-1.5 ml-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex-shrink-0"
                          >
                              <CornerDownLeft size={16} />
                          </button>
                      </form>
                  ) : (
                    <div className="flex items-center flex-wrap gap-1 w-full h-full overflow-hidden whitespace-nowrap mask-linear-fade">
                        <button onClick={(e) => { e.stopPropagation(); setCurrentPath('/'); }} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-bold transition-colors ${currentPath === '/' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                            <Home size={14} /><span>Root</span>
                        </button>
                        {breadcrumbs.map((crumb, idx) => {
                            const path = '/' + breadcrumbs.slice(0, idx + 1).join('/');
                            return (
                                <React.Fragment key={path}>
                                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setCurrentPath(path); }} 
                                        className={`px-2 py-1.5 rounded-lg text-sm font-bold transition-colors ${path === currentPath ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                    >
                                        {crumb}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>
                  )}
              </div>

              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex-shrink-0">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}><Grid size={16} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}><List size={16} /></button>
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
            // Key added here triggers animation when path changes
            <div key={currentPath + viewMode} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Folders Section */}
                {directoryContent.folders.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Folders</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                            {directoryContent.folders.map((folder, index) => (
                                <PremiumFolder 
                                    key={folder.name} 
                                    folder={folder}
                                    index={index}
                                    onClick={() => handleNavigateFolder(folder.name)}
                                    onRename={openRenameModal}
                                    onDelete={handleDeleteItem}
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
                                {directoryContent.files.map((file, index) => (
                                    <div 
                                        key={file.id} 
                                        className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <FileCard 
                                            file={file} 
                                            onRename={(f) => openRenameModal(f.id, f.name)}
                                            onDelete={(f) => handleDeleteItem(f.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                {directoryContent.files.map((file, index) => (
                                    <FileRowItem 
                                        key={file.id} 
                                        file={file} 
                                        index={index}
                                        onRename={openRenameModal}
                                        onDelete={handleDeleteItem}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        directoryContent.folders.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/20 animate-in fade-in zoom-in-95 duration-500">
                                {currentPath !== '/' && directoryContent.folders.length === 0 && directoryContent.files.length === 0 ? (
                                    <>
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                            <AlertCircle size={32} className="text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Folder not found or empty</h3>
                                        <p className="text-slate-500 text-sm mt-1 mb-6 text-center max-w-xs">
                                            The path <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">{currentPath}</span> does not contain any items.
                                        </p>
                                        <button onClick={() => setCurrentPath('/')} className="px-5 py-2.5 bg-blue-600 text-white border border-blue-600 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors">
                                            Go to Root
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                            <Folder size={32} className="text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">This folder is empty</h3>
                                        <p className="text-slate-500 text-sm mt-1 mb-6">Drag files here or create a new folder</p>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                                        >
                                            Upload Files
                                        </button>
                                    </>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>
          )}
      </div>

      {/* --- Create/Rename Modal --- */}
      <Modal 
        isOpen={modalMode !== null} 
        onClose={() => setModalMode(null)} 
        title={modalMode === 'create' ? 'Create New Folder' : 'Rename Item'}
      >
          <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                  {modalMode === 'create' ? 'Enter a name for the new folder.' : 'Enter a new name for this item.'}
              </p>
              <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Name"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitModal()}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white font-medium"
              />
              <div className="flex gap-3 pt-2">
                  <button onClick={() => setModalMode(null)} className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                  <button onClick={handleSubmitModal} disabled={!inputValue.trim()} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all">
                      {modalMode === 'create' ? 'Create' : 'Save Changes'}
                  </button>
              </div>
          </div>
      </Modal>

    </div>
  );
};