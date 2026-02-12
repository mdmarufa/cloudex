import React, { Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useFileViewer } from './useFileViewer';
import { FileIcon, AlertTriangle, X } from 'lucide-react';

// Lazy Load the Image Viewer
const ImageViewer = React.lazy(() => import('./ImageViewer'));

export const FileViewer: React.FC = () => {
  const { isOpen, activeFile, isSupportedImage, fileNotFound, closeViewer, navigateToFile } = useFileViewer();

  if (!isOpen) return null;

  return createPortal(
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeViewer} // Overlay click closes
    >
        {/* Modal Content */}
        <div 
            className="w-full h-full relative" 
            onClick={(e) => e.stopPropagation()} // Stop propagation for controls
        >
            
            {/* 1. File Not Found Error State */}
            {fileNotFound ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-red-500/20">
                        <AlertTriangle size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">File Not Found</h2>
                    <p className="text-slate-400 max-w-md mb-8">
                        The requested file ID is invalid or the file has been deleted.
                    </p>
                    <button 
                        onClick={closeViewer}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-700"
                    >
                        Close Preview
                    </button>
                </div>
            ) : activeFile && isSupportedImage ? (
                /* 2. Supported Image Viewer */
                <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                }>
                    <ImageViewer 
                        file={activeFile} 
                        onClose={closeViewer} 
                        onNavigate={navigateToFile} 
                    />
                </Suspense>
            ) : activeFile ? (
                /* 3. Fallback UI for unsupported types */
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95">
                    <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-slate-700">
                        <FileIcon size={48} className="text-slate-400" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">Preview not available</h2>
                    <p className="text-slate-400 max-w-md mb-8">
                        The file <span className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">{activeFile.name}</span> cannot be previewed in this viewer yet.
                    </p>

                    <div className="flex gap-4">
                        <button 
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Download File
                        </button>
                        <button 
                            onClick={closeViewer}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-700"
                        >
                            Close Preview
                        </button>
                    </div>

                    {/* Close Button Top Right for Fallback */}
                    <button 
                        onClick={closeViewer}
                        className="absolute top-6 right-6 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            ) : null}
        </div>
    </div>,
    document.body
  );
};