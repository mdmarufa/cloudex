import React from 'react';
import { FileItem } from '../../types';
import { FORMAT_BYTES } from '../../constants';
import { 
  X, Download, ExternalLink, FileText, Music, Video, 
  FileCode, AlertCircle, PlayCircle, FileArchive, HardDrive 
} from 'lucide-react';

// --- Shared Layout ---
interface ViewerLayoutProps {
  file: FileItem;
  onClose: () => void;
  children: React.ReactNode;
  icon: React.ElementType;
}

export const ViewerLayout: React.FC<ViewerLayoutProps> = ({ file, onClose, children, icon: Icon }) => {
  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950/95 backdrop-blur-xl">
      {/* Top Header */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
             <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex-shrink-0 flex items-center justify-center border border-white/10 shadow-lg">
                <Icon className="text-blue-400" size={20} />
             </div>
             <div className="flex flex-col text-white drop-shadow-md">
                <h3 className="text-sm sm:text-base font-bold truncate leading-tight max-w-[200px] sm:max-w-md">{file.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium mt-0.5">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{FORMAT_BYTES(file.size)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{new Date(file.modifiedAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
             <button onClick={() => {}} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white border border-transparent hover:border-white/10 transition-all hidden sm:flex items-center justify-center">
                <Download size={20} />
             </button>
             <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-red-500/20 text-white hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all flex items-center justify-center">
                <X size={20} />
             </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative z-10">
          {children}
      </div>
    </div>
  );
};

// --- Specific Viewers ---

export const VideoViewer: React.FC<{ file: FileItem; onClose: () => void }> = ({ file, onClose }) => {
  const videoSrc = file.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  
  return (
    <ViewerLayout file={file} onClose={onClose} icon={Video}>
        <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
            <video 
                className="w-full h-full object-contain" 
                controls 
                autoPlay 
                src={videoSrc}
            />
        </div>
    </ViewerLayout>
  );
};

export const AudioViewer: React.FC<{ file: FileItem; onClose: () => void }> = ({ file, onClose }) => {
  const audioSrc = file.url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  return (
    <ViewerLayout file={file} onClose={onClose} icon={Music}>
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl flex flex-col items-center shadow-2xl">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg animate-pulse-slow">
                <Music size={48} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1 text-center">{file.name}</h3>
            <p className="text-slate-400 text-sm mb-8">Unknown Artist</p>
            
            <audio className="w-full" controls src={audioSrc} />
        </div>
    </ViewerLayout>
  );
};

export const PDFViewer: React.FC<{ file: FileItem; onClose: () => void }> = ({ file, onClose }) => {
  // Check if it's a blob URL (uploaded) or a mock URL/path
  const isBlob = file.url?.startsWith('blob:');
  
  return (
    <ViewerLayout file={file} onClose={onClose} icon={FileText}>
        <div className="w-full h-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="h-full w-full bg-slate-100 flex items-center justify-center relative">
                 {isBlob ? (
                     <iframe 
                        src={file.url}
                        className="w-full h-full border-none"
                        title="PDF Viewer"
                     />
                 ) : (
                     /* Simulated PDF Iframe for mock data using Google Viewer */
                     <iframe 
                        src={`https://docs.google.com/gview?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`}
                        className="w-full h-full border-none"
                        title="PDF Viewer"
                     />
                 )}
                 {!isBlob && (
                    <div className="absolute bottom-4 right-6 pointer-events-none">
                        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">Page 1 / 5</span>
                    </div>
                 )}
            </div>
        </div>
    </ViewerLayout>
  );
};

export const TextViewer: React.FC<{ file: FileItem; onClose: () => void }> = ({ file, onClose }) => {
  const isCode = ['json', 'js', 'ts', 'html', 'css', 'py'].some(ext => file.name.endsWith(ext));
  
  return (
    <ViewerLayout file={file} onClose={onClose} icon={isCode ? FileCode : FileText}>
        <div className="w-full h-full max-w-4xl bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="bg-[#2d2d2d] px-4 py-2 border-b border-black/20 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <span className="text-xs text-slate-400 font-mono ml-2">{file.name}</span>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <pre className="font-mono text-sm text-slate-300">
{`{
  "name": "${file.name}",
  "size": ${file.size},
  "type": "${file.type}",
  "created": "${new Date(file.modifiedAt).toISOString()}",
  "status": "active",
  "content": "This is a preview of the text content. In a real app, this would fetch the file data."
}`}
                </pre>
            </div>
        </div>
    </ViewerLayout>
  );
};

export const UnsupportedViewer: React.FC<{ file: FileItem; onClose: () => void; category: string }> = ({ file, onClose, category }) => {
  const isArchive = category === 'archive';
  const Icon = isArchive ? FileArchive : HardDrive;
  
  return (
    <ViewerLayout file={file} onClose={onClose} icon={Icon}>
        <div className="text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 shadow-2xl">
                <Icon size={48} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
                {isArchive ? 'Archive Preview Unavailable' : 'Preview Unavailable'}
            </h2>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                {isArchive 
                    ? "This archive contains multiple files. Please download it to extract and view the contents."
                    : `The file type .${file.name.split('.').pop()} is not supported for preview in the browser.`
                }
            </p>
            <button 
                onClick={() => {}} 
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95"
            >
                <Download size={18} />
                <span>Download File ({FORMAT_BYTES(file.size)})</span>
            </button>
        </div>
    </ViewerLayout>
  );
};