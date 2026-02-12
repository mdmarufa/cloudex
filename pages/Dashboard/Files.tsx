import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { FileCard } from '../../components/files/FileCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { Filter, Grid, List } from 'lucide-react';

export const FilesPage: React.FC = () => {
  const { files, loading, searchQuery } = useSelector((state: RootState) => state.dashboard);

  // Filter logic
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Files</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your documents and assets</p>
        </div>
        
        <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Filter size={18} />
                <span>Filter</span>
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button className="p-1.5 bg-white dark:bg-slate-600 shadow-sm rounded text-slate-800 dark:text-white"><Grid size={18} /></button>
                <button className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><List size={18} /></button>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-48">
                <Skeleton className="h-12 w-12 mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
             </div>
          ))}
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-6">
          {filteredFiles.map(file => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4">
                <Grid size={32} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-white">No files found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or upload a new file.</p>
        </div>
      )}
    </div>
  );
};