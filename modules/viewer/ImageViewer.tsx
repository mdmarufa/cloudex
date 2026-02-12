import React, { useState, useRef, useEffect } from 'react';
import { FileItem } from '../../types';
import { 
  X, ZoomIn, ZoomOut, Maximize, Download, ExternalLink, 
  Loader2, AlertCircle, RotateCw 
} from 'lucide-react';
import { FORMAT_BYTES } from '../../constants';

interface ImageViewerProps {
  file: FileItem;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ file, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Zoom Input State
  const [zoomInput, setZoomInput] = useState('100');
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Sync Input with Scale ---
  useEffect(() => {
    if (!isEditingZoom) {
        setZoomInput(Math.round(scale * 100).toString());
    }
  }, [scale, isEditingZoom]);

  // --- Controls ---
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
  const handleRotate = () => setRotation(prev => prev + 90);
  
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // --- Input Handlers ---
  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only digits
      const val = e.target.value;
      if (/^\d*$/.test(val)) {
          setZoomInput(val);
      }
  };

  const commitZoomInput = () => {
      setIsEditingZoom(false);
      let val = parseInt(zoomInput, 10);
      
      if (isNaN(val)) {
          // Revert to current scale if invalid
          setZoomInput(Math.round(scale * 100).toString());
          return;
      }

      // Clamp value between 10% and 500%
      val = Math.max(10, Math.min(500, val));
      
      setScale(val / 100);
      setZoomInput(val.toString());
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          (e.target as HTMLInputElement).blur(); // Triggers onBlur which calls commit
      }
  };

  // --- Keyboard Support ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if editing input
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'Escape') onClose();
      if (e.key === '=' || e.key === '+') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === 'r' || e.key === 'R') handleRotate();
      if (e.key === '0') handleReset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // --- Panning Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging if zoomed in OR if simply wanting to move the image around
    // Check if clicking on controls or inputs
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;

    e.preventDefault(); // Prevent default drag behavior of img
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // --- Image Source ---
  const imageUrl = `https://picsum.photos/seed/${file.id}/1920/1080`;

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-transparent select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Bar: Info & Close */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex flex-col text-white pointer-events-auto">
            <h3 className="text-sm font-bold truncate max-w-[200px] sm:max-w-md drop-shadow-md">{file.name}</h3>
            <p className="text-xs text-slate-300 opacity-80">{FORMAT_BYTES(file.size)} • {new Date(file.modifiedAt).toLocaleDateString()}</p>
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
            <button 
                onClick={() => window.open(imageUrl, '_blank')}
                className="p-2 rounded-full bg-black/20 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                title="Open in new tab"
            >
                <ExternalLink size={18} />
            </button>
            <button 
                className="p-2 rounded-full bg-black/20 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                title="Download"
            >
                <Download size={18} />
            </button>
            <button 
                onClick={onClose} 
                className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-white backdrop-blur-md transition-colors ml-2"
            >
                <X size={20} />
            </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-hidden flex items-center justify-center cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                <p className="text-sm font-medium animate-pulse">Loading preview...</p>
            </div>
        )}

        {hasError ? (
            <div className="flex flex-col items-center text-slate-400 pointer-events-none">
                <AlertCircle size={48} className="mb-4 text-red-400" />
                <p className="text-lg font-medium text-white">Failed to load image</p>
                <button onClick={() => { setHasError(false); setIsLoading(true); }} className="mt-4 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 pointer-events-auto">Retry</button>
            </div>
        ) : (
            <img 
                src={imageUrl} 
                alt={file.name}
                onLoad={() => setIsLoading(false)}
                onError={() => { setIsLoading(false); setHasError(true); }}
                // Use duration-0 when dragging to prevent lag, duration-300 otherwise for smooth zoom/rotate
                className={`max-w-none shadow-2xl transition-transform ease-out will-change-transform ${isDragging ? 'duration-0' : 'duration-300'} ${isLoading ? 'opacity-0' : 'opacity-100 animate-in fade-in zoom-in-95 duration-300'}`}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                    // Always constrain base size to viewport to prevent layout jumps when scaling
                    maxHeight: '85vh',
                    maxWidth: '90vw',
                    objectFit: 'contain'
                }}
                draggable={false}
            />
        )}
      </div>

      {/* Bottom Bar: Zoom & Rotate Controls */}
      <div className="absolute bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none">
         <div className="flex items-center gap-1 p-1.5 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl pointer-events-auto">
             <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-full text-white disabled:opacity-50 transition-colors" disabled={scale <= 0.1} title="Zoom Out (-)">
                 <ZoomOut size={18} />
             </button>
             
             <div className="relative flex items-center justify-center w-14 group">
                 <input 
                    type="text"
                    value={zoomInput}
                    onChange={handleZoomInputChange}
                    onFocus={() => setIsEditingZoom(true)}
                    onBlur={commitZoomInput}
                    onKeyDown={handleZoomInputKeyDown}
                    className="w-full bg-transparent text-center text-xs font-mono font-bold text-slate-300 focus:text-white outline-none selection:bg-blue-500/50"
                 />
                 <span className="absolute right-0.5 text-[10px] text-slate-500 pointer-events-none">%</span>
             </div>

             <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-full text-white disabled:opacity-50 transition-colors" disabled={scale >= 5} title="Zoom In (+)">
                 <ZoomIn size={18} />
             </button>

             <div className="w-px h-4 bg-white/20 mx-1"></div>

             <button onClick={handleRotate} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Rotate (R)">
                 <RotateCw size={18} />
             </button>

             <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Reset to Fit (0)">
                 <Maximize size={16} />
             </button>
         </div>
      </div>
    </div>
  );
};

export default ImageViewer;
