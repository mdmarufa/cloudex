import React from 'react';
import { FileItem, FileType } from '../../types';
import { FileText, Image, Video, Archive, Folder, MoreVertical, Star, Download, Trash2 } from 'lucide-react';
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

  const getIcon = () => {
    switch (file.type) {
      case FileType.IMAGE: return <Image className="text-blue-600 dark:text-blue-500" size={32} />;
      case FileType.VIDEO: return <Video className="text-purple-600 dark:text-purple-500" size={32} />;
      case FileType.ARCHIVE: return <Archive className="text-orange-600 dark:text-orange-500" size={32} />;
      case FileType.FOLDER: return <Folder className="text-yellow-500 dark:text-yellow-400" size={32} />;
      default: return <FileText className="text-slate-600 dark:text-slate-400" size={32} />;
    }
  };

  const handlePreview = () => {
    const params = new URLSearchParams(location.search);
    params.set('modal', 'preview');
    params.set('fileId', file.id);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all p-4 flex flex-col relative">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors cursor-pointer" onClick={handlePreview}>
          {getIcon()}
        </div>
        <div className="relative">
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-500">
            <MoreVertical size={16} />
          </button>
          
          {/* Quick Actions overlay on hover */}
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-100 dark:border-slate-600 p-1 flex space-x-1 z-10">
             <button onClick={() => dispatch(toggleStar(file.id))} className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${file.isStarred ? 'text-yellow-500 fill-current' : 'text-slate-600 dark:text-slate-400'}`}>
               <Star size={14} fill={file.isStarred ? "currentColor" : "none"} />
             </button>
             <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
               <Download size={14} />
             </button>
             <button onClick={() => dispatch(deleteFile(file.id))} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600">
               <Trash2 size={14} />
             </button>
          </div>
        </div>
      </div>
      
      <div className="mt-auto cursor-pointer" onClick={handlePreview}>
        <h3 className="font-semibold text-slate-900 dark:text-slate-200 truncate" title={file.name}>{file.name}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{FORMAT_BYTES(file.size)} • {new Date(file.modifiedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};