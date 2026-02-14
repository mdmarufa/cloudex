import React, { Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useFileViewer } from './useFileViewer';
import { AlertTriangle, X } from 'lucide-react';
import { VideoViewer, AudioViewer, PDFViewer, TextViewer, UnsupportedViewer } from './ViewerComponents';

// Lazy Load the Image Viewer as it's heavy
const ImageViewer = React.lazy(() => import('./ImageViewer'));

export const FileViewer: React.FC = () => {
  const { isOpen, activeFile, fileCategory, fileNotFound, closeViewer, navigateToFile } = useFileViewer();

  if (!isOpen) return null;

  const renderContent = () => {
      if (!activeFile) return null;

      switch (fileCategory) {
          case 'image':
              return (
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
              );
          case 'video':
              return <VideoViewer file={activeFile} onClose={closeViewer} />;
          case 'audio':
              return <AudioViewer file={activeFile} onClose={closeViewer} />;
          case 'pdf':
              return <PDFViewer file={activeFile} onClose={closeViewer} />;
          case 'text':
          case 'code':
              return <TextViewer file={activeFile} onClose={closeViewer} />;
          default:
              return <UnsupportedViewer file={activeFile} onClose={closeViewer} category={fileCategory} />;
      }
  };

  return createPortal(
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden overscroll-none"
        onClick={closeViewer} 
        style={{ touchAction: 'none' }}
    >
        {/* Modal Content Wrapper */}
        <div 
            className="w-full h-full relative overflow-hidden flex flex-col" 
            onClick={(e) => e.stopPropagation()} 
        >
            {/* Error State */}
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
            ) : (
                /* Dynamic Content based on Category */
                renderContent()
            )}
        </div>
    </div>,
    document.body
  );
};