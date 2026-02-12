import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { FileItem, FileType } from '../../types';
import { 
  X, ZoomIn, ZoomOut, Maximize, Download, ExternalLink, 
  Loader2, AlertCircle, RotateCw, ArrowLeftRight, ArrowUpDown, 
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { FORMAT_BYTES } from '../../constants';

interface ImageViewerProps {
  file: FileItem;
  onClose: () => void;
  onNavigate: (fileId: string) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ file, onClose, onNavigate }) => {
  const { files } = useSelector((state: RootState) => state.dashboard);
  
  // State
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
  const imageRef = useRef<HTMLImageElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);

  // --- Image List Logic (Filmstrip) ---
  const allImages = useMemo(() => files.filter(f => f.type === FileType.IMAGE), [files]);
  const currentIndex = allImages.findIndex(f => f.id === file.id);
  const hasNext = currentIndex < allImages.length - 1;
  const hasPrev = currentIndex > 0;

  // Reset view when file changes
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setIsLoading(true);
    setHasError(false);
  }, [file.id]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (activeThumbRef.current) {
        activeThumbRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
  }, [file.id]);

  // --- Sync Input with Scale ---
  useEffect(() => {
    if (!isEditingZoom) {
        setZoomInput(Math.round(scale * 100).toString());
    }
  }, [scale, isEditingZoom]);

  // --- Controls Actions ---
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.1));
  const handleRotate = () => setRotation(prev => prev + 90);
  
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleFitWidth = () => {
    if (!containerRef.current || !imageRef.current) return;
    const containerW = containerRef.current.clientWidth;
    const rect = imageRef.current.getBoundingClientRect();
    const unscaledW = rect.width / scale;
    if (unscaledW > 0) {
        setScale((containerW * 0.9) / unscaledW); // 90% width to allow margin
        setPosition({ x: 0, y: 0 });
    }
  };

  const handleFitHeight = () => {
    if (!containerRef.current || !imageRef.current) return;
    const containerH = containerRef.current.clientHeight;
    const rect = imageRef.current.getBoundingClientRect();
    const unscaledH = rect.height / scale;
    if (unscaledH > 0) {
        setScale((containerH * 0.9) / unscaledH);
        setPosition({ x: 0, y: 0 });
    }
  };

  const handleNext = () => {
      if (hasNext) onNavigate(allImages[currentIndex + 1].id);
  };

  const handlePrev = () => {
      if (hasPrev) onNavigate(allImages[currentIndex - 1].id);
  };

  // --- Input Handlers ---
  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (/^\d*$/.test(val)) setZoomInput(val);
  };

  const commitZoomInput = () => {
      setIsEditingZoom(false);
      let val = parseInt(zoomInput, 10);
      if (isNaN(val)) {
          setZoomInput(Math.round(scale * 100).toString());
          return;
      }
      val = Math.max(10, Math.min(500, val));
      setScale(val / 100);
      setZoomInput(val.toString());
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          (e.target as HTMLInputElement).blur();
      }
  };

  // --- Keyboard & Wheel Support ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      switch (e.key) {
        case 'Escape': onClose(); break;
        case '=': 
        case '+': handleZoomIn(); break;
        case '-': handleZoomOut(); break;
        case 'r': 
        case 'R': handleRotate(); break;
        case '0': handleReset(); break;
        case 'w': 
        case 'W': handleFitWidth(); break;
        case 'h': 
        case 'H': handleFitHeight(); break;
        case 'ArrowRight': handleNext(); break;
        case 'ArrowLeft': handlePrev(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, scale, rotation, currentIndex, allImages]);

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
      e.stopPropagation();
      // Detect pinch gesture (ctrlKey) or standard wheel
      if (e.ctrlKey || Math.abs(e.deltaY) > 0) {
        if (e.deltaY < 0) {
            setScale(prev => Math.min(prev + 0.1, 5));
        } else {
            setScale(prev => Math.max(prev - 0.1, 0.1));
        }
      }
  };

  // --- Panning Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    e.preventDefault();
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
      onWheel={handleWheel}
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
                title="Open in New Tab"
            >
                <ExternalLink size={18} />
            </button>
            <button 
                className="p-2 rounded-full bg-black/20 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                title="Download File"
            >
                <Download size={18} />
            </button>
            <button 
                onClick={onClose} 
                className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-white backdrop-blur-md transition-colors ml-2"
                title="Close (Esc)"
            >
                <X size={20} />
            </button>
        </div>
      </div>

      {/* Navigation Arrows (Side) */}
      <div className="absolute inset-y-0 left-4 flex items-center z-40 pointer-events-none">
          {hasPrev && (
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="p-3 bg-black/30 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all pointer-events-auto hover:scale-110 shadow-lg"
                title="Previous Image (Left Arrow)"
              >
                  <ChevronLeft size={32} />
              </button>
          )}
      </div>
      <div className="absolute inset-y-0 right-4 flex items-center z-40 pointer-events-none">
          {hasNext && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="p-3 bg-black/30 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all pointer-events-auto hover:scale-110 shadow-lg"
                title="Next Image (Right Arrow)"
              >
                  <ChevronRight size={32} />
              </button>
          )}
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
                ref={imageRef}
                src={imageUrl} 
                alt={file.name}
                onLoad={() => setIsLoading(false)}
                onError={() => { setIsLoading(false); setHasError(true); }}
                className={`max-w-none shadow-2xl transition-transform ease-out will-change-transform ${isDragging ? 'duration-0' : 'duration-300'} ${isLoading ? 'opacity-0' : 'opacity-100 animate-in fade-in zoom-in-95 duration-300'}`}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                    maxHeight: '85vh',
                    maxWidth: '90vw',
                    objectFit: 'contain'
                }}
                draggable={false}
            />
        )}
      </div>

      {/* Bottom Area: Gradient Overlay, Filmstrip & Controls */}
      <div className="absolute bottom-0 inset-x-0 z-50 flex flex-col items-center pb-6 pt-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
         
         {/* Filmstrip (Thumbnails) */}
         {allImages.length > 1 && (
            <div 
                ref={filmstripRef}
                className="flex items-center gap-2 p-2 mb-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-x-auto max-w-[90vw] sm:max-w-xl pointer-events-auto custom-scrollbar scroll-smooth"
            >
                {allImages.map((img) => (
                    <div 
                        key={img.id}
                        ref={img.id === file.id ? activeThumbRef : null}
                        onClick={(e) => { e.stopPropagation(); onNavigate(img.id); }}
                        className={`relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all hover:opacity-100 border-2 ${img.id === file.id ? 'border-blue-500 opacity-100 scale-105 ring-2 ring-blue-500/50' : 'border-transparent opacity-50 hover:scale-105'}`}
                        title={img.name}
                    >
                        <img 
                            src={`https://picsum.photos/seed/${img.id}/100/100`} 
                            alt={img.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
         )}

         {/* Toolbar Controls */}
         <div className="flex items-center gap-1 p-1.5 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl pointer-events-auto transition-transform hover:scale-105">
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
            
             <button onClick={handleFitWidth} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Fit Width (W)">
                 <ArrowLeftRight size={18} />
             </button>

             <button onClick={handleFitHeight} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Fit Height (H)">
                 <ArrowUpDown size={18} />
             </button>

             <div className="w-px h-4 bg-white/20 mx-1"></div>

             <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Reset to Original (0)">
                 <Maximize size={16} />
             </button>
         </div>
      </div>
    </div>
  );
};

export default ImageViewer;