import React, { useState } from 'react';
import { FileItem, FileType } from '../../types';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Archive, 
  Folder, 
  MoreVertical, 
  Star, 
  Download, 
  Trash2, 
  Play,
  File,
  Share2,
  Music,
  Eye
} from 'lucide-react';
import { FORMAT_BYTES } from '../../constants';
import { useDispatch } from 'react-redux';
import { deleteFile, toggleStar } from '../../store/dashboardSlice';
import { useNavigate, useLocation } from 'react-router-dom';

interface Props {
  file: FileItem;
}

export const FileCard: React.FC<Props> = ({ file }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

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
        // Quick check for PDF vs Word based on name for extra detail (optional)
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this file?')) {
        dispatch(deleteFile(file.id));
    }
  };

  // --- Render Preview Area ---
  const renderPreview = () => {
    // 1. Image Preview
    if (file.type === FileType.IMAGE) {
      return (
        <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700 ease-out">
          <img 
            src={`https://picsum.photos/seed/${file.id}/400/300`} 
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      );
    }

    // 2. Video Preview
    if (file.type === FileType.VIDEO) {
       return (
        <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700 ease-out bg-slate-900">
           {/* Simulate Video Thumbnail */}
           <img 
            src={`https://picsum.photos/seed/${file.id}/400/300?grayscale`} 
            alt={file.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform duration-300">
                <Play size={20} fill="white" className="text-white ml-1" />
             </div>
          </div>
        </div>
       );
    }

    // 3. Generic Icon Preview (Docs, Folders, etc)
    return (
      <div className={`w-full h-full flex items-center justify-center ${theme.bg} group-hover:bg-opacity-80 transition-colors`}>
         <FileIcon size={64} className={`${theme.text} drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300`} strokeWidth={1.5} />
      </div>
    );
  };

  return (
    <div 
      className="group relative flex flex-col w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.25,0.4,0.25,1)] cursor-pointer overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePreview}
    >
      
      {/* Top: Preview Area (Fixed Aspect Ratio 16:10 approx) */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800/50">
         {renderPreview()}

         {/* Selection / Star Overlay (Top Left) */}
         <div className="absolute top-3 left-3 z-10">
            {file.isStarred && (
               <div className="bg-yellow-400 text-white p-1.5 rounded-full shadow-sm animate-in fade-in zoom-in duration-200">
                  <Star size={12} fill="currentColor" />
               </div>
            )}
         </div>

         {/* Hover Overlay Actions (Top Right) */}
         <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-200 ${isHovered || file.isStarred ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
             <button 
                onClick={handleToggleStar}
                className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400 transition-colors"
                title={file.isStarred ? "Unstar" : "Star"}
             >
                <Star size={16} fill={file.isStarred ? "currentColor" : "none"} />
             </button>
             <button 
                className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                title="More Actions"
             >
                <MoreVertical size={16} />
             </button>
         </div>

         {/* Shared Indicator (Bottom Right of preview) */}
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
      <div className="p-4 flex flex-col gap-1.5 flex-1 relative bg-white dark:bg-slate-900">
         
         {/* File Name & Icon Row */}
         <div className="flex items-center gap-2.5 mb-1">
             <div className={`p-1.5 rounded-lg ${theme.bg} ${theme.text}`}>
                 <FileIcon size={16} />
             </div>
             <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate flex-1" title={file.name}>
                 {file.name}
             </h3>
         </div>

         {/* Metadata Row */}
         <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium pl-1">
            <div className="flex items-center gap-2">
               <span>{FORMAT_BYTES(file.size)}</span>
               <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
               <span>{new Date(file.modifiedAt).toLocaleDateString()}</span>
            </div>
         </div>
         
         {/* Hidden Hover Action Bar (Slide up from bottom) */}
         <div className={`absolute inset-x-0 bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around transform transition-transform duration-200 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
             <button onClick={handlePreview} className="flex flex-col items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 transition-colors">
                <Eye size={16} />
                <span>Preview</span>
             </button>
             <button className="flex flex-col items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 transition-colors">
                <Download size={16} />
                <span>Save</span>
             </button>
             <button onClick={handleDelete} className="flex flex-col items-center gap-1 text-[10px] text-slate-500 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
                <span>Delete</span>
             </button>
         </div>

      </div>
    </div>
  );
};