import React, { useState, useRef, useEffect } from 'react';
import { FileItem, FileType } from '../../types';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Archive, 
  Folder, 
  MoreVertical, 
  Star, 
  Play,
  File,
  Share2,
  Music,
  Edit2,
  Trash2
} from 'lucide-react';
import { FORMAT_BYTES } from '../../constants';
import { useDispatch } from 'react-redux';
import { deleteFile, toggleStar } from '../../store/dashboardSlice';
import { useNavigate, useLocation } from 'react-router-dom';

interface Props {
  file: FileItem;
  onRename?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
}

export const FileCard: React.FC<Props> = ({ file, onRename, onDelete }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Helper: Get File Color Theme ---
  const getFileTheme = () => {
    switch (file.type) {
      case FileType.IMAGE: 
        return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', icon: ImageIcon };
      case FileType.VIDEO: 
        return { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600', icon: Video };
      case FileType.AUDIO: 
        return { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600', icon: Music };
      case FileType.ARCHIVE: 
        return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600', icon: Archive };
      case FileType.FOLDER: 
        return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600', icon: Folder };
      case FileType.DOCUMENT: 
        if (file.name.endsWith('.pdf')) return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', icon: FileText };
        if (file.name.match(/\.(xls|xlsx|csv)$/)) return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', icon: FileText };
        return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', icon: FileText };
      default: 
        return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500', icon: File };
    }
  };

  const theme = getFileTheme();
  const FileIcon = theme.icon;

  const handlePreview = (e: React.MouseEvent) => {
    // If menu is open, don't navigate
    if (showMenu) return;
    
    e.stopPropagation();
    const params = new URLSearchParams(location.search);
    params.set('modal', 'preview');
    params.set('fileId', file.id);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleStar(file.id));
  };

  const handleMenuAction = (e: React.MouseEvent, action: 'rename' | 'delete') => {
      e.stopPropagation();
      setShowMenu(false);
      
      if (action === 'rename') {
          if (onRename) onRename(file);
      } else if (action === 'delete') {
          if (onDelete) {
              onDelete(file);
          } else {
              if(window.confirm('Are you sure you want to delete this file?')) {
                  dispatch(deleteFile(file.id));
              }
          }
      }
  };

  const toggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowMenu(!showMenu);
  };

  // --- Render Preview Area ---
  const renderPreview = () => {
    if (file.type === FileType.IMAGE) {
      const imgSrc = file.url || `https://picsum.photos/seed/${file.id}/400/300`;
      return (
        <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700 ease-out">
          <img 
            src={imgSrc}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      );
    }

    if (file.type === FileType.VIDEO) {
       return (
        <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700 ease-out bg-slate-900">
           {/* If local video blob exists, use video tag to show first frame (metadata) */}
           {file.url ? (
               <video 
                   src={file.url} 
                   className="w-full h-full object-cover opacity-80"
                   preload="metadata"
               />
           ) : (
               <img 
                src={`https://picsum.photos/seed/${file.id}/400/300?grayscale`} 
                alt={file.name}
                className="w-full h-full object-cover opacity-80"
              />
           )}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform duration-300">
                <Play size={20} fill="white" className="text-white ml-1" />
             </div>
          </div>
        </div>
       );
    }

    return (
      <div className={`w-full h-full flex items-center justify-center ${theme.bg} group-hover:bg-opacity-80 transition-colors`}>
         <FileIcon size={64} className={`${theme.text} drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300`} strokeWidth={1.5} />
      </div>
    );
  };

  return (
    <div 
      className={`group relative flex flex-col w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.25,0.4,0.25,1)] cursor-pointer select-none ${showMenu ? 'z-50' : 'z-0'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePreview}
    >
      
      {/* Top: Preview Area - Overflow removed from parent, moved to inner wrapper */}
      <div className="relative w-full aspect-[4/3] bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800/50 rounded-t-2xl">
         
         {/* Inner Content Wrapper for Clipping */}
         <div className="absolute inset-0 rounded-t-2xl overflow-hidden">
            {renderPreview()}
         </div>

         {/* Selection / Star Overlay (Top Left) */}
         <div className="absolute top-3 left-3 z-10">
            {file.isStarred && (
               <div className="bg-yellow-400 text-white p-1.5 rounded-full shadow-sm animate-in fade-in zoom-in duration-200">
                  <Star size={12} fill="currentColor" />
               </div>
            )}
         </div>

         {/* Actions (Top Right) */}
         <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-200 ${isHovered || file.isStarred || showMenu ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} z-20`}>
             <button 
                onClick={handleToggleStar}
                className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400 transition-colors"
                title={file.isStarred ? "Unstar" : "Star"}
             >
                <Star size={16} fill={file.isStarred ? "currentColor" : "none"} />
             </button>
             
             {/* 3-Dot Menu Trigger */}
             <div className="relative" ref={menuRef}>
                 <button 
                    onClick={toggleMenu}
                    className={`p-2 rounded-full shadow-md transition-colors ${showMenu ? 'bg-blue-50 text-blue-600 dark:bg-slate-700 dark:text-blue-400' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'}`}
                    title="More Actions"
                 >
                    <MoreVertical size={16} />
                 </button>

                 {/* Dropdown Menu */}
                 {showMenu && (
                     <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-[100] animate-in fade-in zoom-in-95 origin-top-right overflow-hidden">
                         {onRename && (
                             <button 
                                onClick={(e) => handleMenuAction(e, 'rename')}
                                className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                             >
                                 <Edit2 size={12} /> Rename
                             </button>
                         )}
                         <button 
                            onClick={(e) => handleMenuAction(e, 'delete')}
                            className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                         >
                             <Trash2 size={12} /> Delete
                         </button>
                     </div>
                 )}
             </div>
         </div>

         {/* Shared Indicator */}
         {file.owner !== 'Me' && (
             <div className="absolute bottom-3 right-3 z-10">
                <div className="flex -space-x-2">
                   <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-white shadow-sm" title={`Shared by ${file.owner}`}>
                      {file.owner.charAt(0)}
                   </div>
                   <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-800 flex items-center justify-center text-slate-500 shadow-sm">
                      <Share2 size={10} />
                   </div>
                </div>
             </div>
         )}
      </div>

      {/* Bottom: Info Area */}
      <div className="p-3 flex flex-col justify-between flex-1 relative bg-white dark:bg-slate-900 min-h-[85px] rounded-b-2xl">
         <div className="flex items-start gap-2 mb-2">
             <div className={`p-1.5 rounded-lg shrink-0 ${theme.bg} ${theme.text}`}>
                 <FileIcon size={16} />
             </div>
             <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight flex-1" title={file.name}>
                 {file.name}
             </h3>
         </div>
         <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
               <span>{FORMAT_BYTES(file.size)}</span>
               <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
               <span>{new Date(file.modifiedAt).toLocaleDateString()}</span>
            </div>
         </div>
      </div>
    </div>
  );
};