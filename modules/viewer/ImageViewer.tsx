import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { FileItem, FileType } from '../../types';
import { 
  X, ZoomIn, ZoomOut, Maximize, Download, ExternalLink, 
  Loader2, AlertCircle, RotateCw, ArrowLeftRight, ArrowUpDown, 
  ChevronLeft, ChevronRight, FileImage, MoreVertical
} from 'lucide-react';
import { FORMAT_BYTES } from '../../constants';

interface ImageViewerProps {
  file: FileItem;
  onClose: () => void;
  onNavigate: (fileId: string) => void;
}

// --- Control Button Component ---
interface ControlBtnProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  shortcut?: string;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'primary';
  active?: boolean;
  tooltipPlacement?: 'top' | 'bottom';
  tooltipAlign?: 'center' | 'left' | 'right';
  className?: string;
}

const ControlBtn: React.FC<ControlBtnProps> = ({ 
  icon: Icon, label, onClick, shortcut, disabled = false, variant = 'default', active = false, tooltipPlacement = 'top', tooltipAlign = 'center', className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getBaseStyles = () => {
    switch(variant) {
      case 'danger': return 'hover:bg-red-500/20 text-white hover:text-red-400 border-transparent hover:border-red-500/30';
      case 'primary': return 'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-blue-500/20 shadow-lg';
      default: return 'hover:bg-white/10 text-slate-200 hover:text-white border-white/5 hover:border-white/20';
    }
  };

  const activeStyles = active ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : '';
  const tooltipPosClass = tooltipPlacement === 'top' ? 'bottom-full mb-3 origin-bottom' : 'top-full mt-3 origin-top';
  const arrowPosClass = tooltipPlacement === 'top' ? 'top-full border-t-slate-900/95 border-b-transparent border-x-transparent' : 'bottom-full border-b-slate-900/95 border-t-transparent border-x-transparent';
  const alignClass = tooltipAlign === 'right' ? 'right-0' : tooltipAlign === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2';
  const arrowAlignClass = tooltipAlign === 'right' ? 'right-4' : tooltipAlign === 'left' ? 'left-4' : 'left-1/2 -translate-x-1/2';

  return (
    <div className={`relative group flex items-center justify-center flex-shrink-0 ${className}`}>
      <button 
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`relative p-2 sm:p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300 ease-[cubic-bezier(0.25,0.4,0.25,1)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-110 active:scale-95 ${getBaseStyles()} ${activeStyles}`}
        aria-label={label}
      >
        <Icon size={20} strokeWidth={2} />
        {active && <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 animate-pulse"></span>}
      </button>
      <div className={`absolute ${tooltipPosClass} ${alignClass} px-3 py-1.5 bg-slate-900/95 backdrop-blur-xl text-white text-xs font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap pointer-events-none z-[60] transition-all duration-200 ${showTooltip ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
         <div className="flex items-center gap-2"><span>{label}</span>{shortcut && (<span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono text-slate-300 border border-white/5">{shortcut}</span>)}</div>
         <div className={`absolute ${arrowAlignClass} -mt-[1px] border-4 ${arrowPosClass}`}></div>
      </div>
    </div>
  );
};

// --- Styles for Slide Animations ---
const slideStyles = `
  .slide-enter-next { animation: slideInRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .slide-exit-next { animation: slideOutLeft 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .slide-enter-prev { animation: slideInLeft 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .slide-exit-prev { animation: slideOutRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  
  @keyframes slideInRight { from { transform: translate3d(100%, 0, 0); } to { transform: translate3d(0, 0, 0); } }
  @keyframes slideOutLeft { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(-100%, 0, 0); } }
  @keyframes slideInLeft { from { transform: translate3d(-100%, 0, 0); } to { transform: translate3d(0, 0, 0); } }
  @keyframes slideOutRight { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(100%, 0, 0); } }
`;

// --- ImageSlide Component ---
interface ImageSlideProps {
  file: FileItem;
  isCached: boolean;
  onLoaded: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
  dragRef?: React.Ref<HTMLImageElement>;
}

const ImageSlide: React.FC<ImageSlideProps> = ({ file, isCached, onLoaded, className, style, dragRef }) => {
    // Initial state logic: if cached, assume loaded immediately.
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(isCached ? 'loaded' : 'loading');
    
    // Prefer the real file URL (uploaded), fallback to picsum (mock)
    const imageUrl = file.url || `https://picsum.photos/seed/${file.id}/1920/1080`;
    
    const internalRef = useRef<HTMLImageElement>(null);

    // Double check: if browser has it cached but our state is out of sync
    useEffect(() => {
        if (status === 'loading' && internalRef.current && internalRef.current.complete) {
             setStatus('loaded');
             onLoaded(file.id);
        }
    }, [status, file.id, onLoaded]);

    const handleLoad = () => {
        setStatus('loaded');
        onLoaded(file.id);
    };

    const handleRef = (node: HTMLImageElement | null) => {
        internalRef.current = node;
        if (typeof dragRef === 'function') {
            dragRef(node);
        } else if (dragRef) {
            (dragRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
        }
    };

    return (
        <div className={`absolute inset-0 flex items-center justify-center w-full h-full ${className}`} style={{ transformOrigin: 'center center' }}>
            {status === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                     <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                     </div>
                     <p className="mt-4 text-sm font-medium text-slate-300 animate-pulse tracking-wide uppercase">Loading</p>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center text-slate-400 z-50">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                        <AlertCircle size={40} className="text-red-500" />
                    </div>
                    <p className="text-xl font-bold text-white mb-2">Failed to load</p>
                </div>
            )}
            
            <img 
                ref={handleRef}
                src={imageUrl} 
                alt={file.name}
                onLoad={handleLoad}
                onError={() => setStatus('error')}
                className={`max-w-[90%] max-h-[85vh] object-contain shadow-2xl will-change-transform ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                style={style}
                draggable={false}
            />
        </div>
    );
};

const ImageViewer: React.FC<ImageViewerProps> = ({ file, onClose, onNavigate }) => {
  const { files } = useSelector((state: RootState) => state.dashboard);
  
  // --- Animation State ---
  const [activeFile, setActiveFile] = useState(file);
  const [exitingFile, setExitingFile] = useState<FileItem | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  
  // Cache to prevent loading flicker
  const loadedImagesRef = useRef<Set<string>>(new Set());

  // --- View Controls State ---
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Zoom Input
  const [zoomInput, setZoomInput] = useState('100');
  const [isEditingZoom, setIsEditingZoom] = useState(false);

  // Mobile/UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Scoped Image Logic ---
  // Filter images only from the SAME FOLDER as the current active file
  const allImages = useMemo(() => {
      // Find the parent folder of the current file
      const parentPath = activeFile.path;
      return files.filter(f => f.type === FileType.IMAGE && f.path === parentPath);
  }, [files, activeFile.path]);

  const currentIndex = allImages.findIndex(f => f.id === activeFile.id);
  const hasNext = currentIndex < allImages.length - 1;
  const hasPrev = currentIndex > 0;

  // --- Transition Logic ---
  useEffect(() => {
    if (file.id !== activeFile.id) {
        // Determine Direction
        // Note: We use the *current* allImages context to find direction relative to the list
        // If switching folders entirely via URL, this might be arbitrary, but usually fine.
        const newIndex = allImages.findIndex(f => f.id === file.id);
        const oldIndex = allImages.findIndex(f => f.id === activeFile.id);
        const dir = newIndex > oldIndex ? 'next' : 'prev';

        setDirection(dir);
        setExitingFile(activeFile);
        setActiveFile(file);

        // Reset View Controls for new image
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });

        // Cleanup exiting slide after animation
        if (animationTimer.current) clearTimeout(animationTimer.current);
        animationTimer.current = setTimeout(() => {
            setExitingFile(null);
        }, 300); // Match CSS animation duration
    }
  }, [file, activeFile, allImages]);

  // Cleanup timer on unmount
  useEffect(() => {
      return () => { if (animationTimer.current) clearTimeout(animationTimer.current); };
  }, []);

  // --- Controls Handlers (Preserved Logic) ---
  const handleCacheUpdate = (id: string) => {
      loadedImagesRef.current.add(id);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 10));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
  const handleRotate = () => setRotation(prev => prev + 90);
  const handleReset = () => { setScale(1); setRotation(0); setPosition({ x: 0, y: 0 }); };

  const handleFitWidth = () => {
    if (!containerRef.current || !imageRef.current) return;
    const containerW = containerRef.current.clientWidth;
    const rect = imageRef.current.getBoundingClientRect();
    if (rect.width === 0) return;
    const factor = containerW / (rect.width / scale); // Calculate based on unscaled width
    setScale(factor);
    setPosition({ x: 0, y: 0 });
  };

  const handleFitHeight = () => {
    if (!containerRef.current || !imageRef.current) return;
    const containerH = containerRef.current.clientHeight;
    const rect = imageRef.current.getBoundingClientRect();
    if (rect.height === 0) return;
    const factor = containerH / (rect.height / scale); // Calculate based on unscaled height
    setScale(factor);
    setPosition({ x: 0, y: 0 });
  };

  const handleNext = () => { if (hasNext) onNavigate(allImages[currentIndex + 1].id); };
  const handlePrev = () => { if (hasPrev) onNavigate(allImages[currentIndex - 1].id); };

  // Inputs
  useEffect(() => {
    if (!isEditingZoom) setZoomInput(Math.round(scale * 100).toString());
  }, [scale, isEditingZoom]);

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (/^\d*$/.test(e.target.value)) setZoomInput(e.target.value);
  };
  const commitZoomInput = () => {
      setIsEditingZoom(false);
      let val = parseInt(zoomInput, 10);
      if (isNaN(val)) { setZoomInput(Math.round(scale * 100).toString()); return; }
      val = Math.max(10, Math.min(1000, val));
      setScale(val / 100);
      setZoomInput(val.toString());
  };

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      switch (e.key) {
        case 'Escape': onClose(); break;
        case '+': case '=': handleZoomIn(); break;
        case '-': handleZoomOut(); break;
        case 'r': case 'R': handleRotate(); break;
        case '0': handleReset(); break;
        case 'w': case 'W': handleFitWidth(); break;
        case 'h': case 'H': handleFitHeight(); break;
        case 'ArrowRight': handleNext(); break;
        case 'ArrowLeft': handlePrev(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, scale, activeFile]);

  // Mouse/Touch Interaction
  const handleWheel = (e: React.WheelEvent) => {
      // Allow scroll only if not stopped propagation from children
      if (e.defaultPrevented) return;
      
      e.stopPropagation();
      if (e.ctrlKey || Math.abs(e.deltaY) > 0) {
        e.deltaY < 0 ? setScale(p => Math.min(p * 1.1, 10)) : setScale(p => Math.max(p / 1.1, 0.1));
      }
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1) {
       setIsDragging(true);
       setDragStart({ x: e.targetTouches[0].clientX - position.x, y: e.targetTouches[0].clientY - position.y });
       return;
    }
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (scale > 1 && isDragging) {
       setPosition({ x: e.targetTouches[0].clientX - dragStart.x, y: e.targetTouches[0].clientY - dragStart.y });
       return;
    }
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
    if (scale === 1 && touchStart !== null && touchEnd !== null) {
        const distance = touchStart - touchEnd;
        if (distance > 50 && hasNext) handleNext();
        else if (distance < -50 && hasPrev) handlePrev();
    }
    setTouchStart(null); setTouchEnd(null);
  };

  // Filmstrip Scroll
  useEffect(() => {
    if (activeThumbRef.current && filmstripRef.current) {
        const container = filmstripRef.current;
        const thumb = activeThumbRef.current;
        const scrollTarget = thumb.offsetLeft - (container.clientWidth / 2) + (thumb.offsetWidth / 2);
        container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }
  }, [activeFile.id]);

  // --- Styles ---
  // Apply transition only when NOT dragging for smooth controls (zoom/pan/rotate)
  const activeTransform: React.CSSProperties = {
      transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${rotation}deg) scale(${scale})`,
      cursor: isDragging ? 'grabbing' : 'grab',
      transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.4, 1)' 
  };

  const downloadUrl = activeFile.url || `https://picsum.photos/seed/${activeFile.id}/1920/1080`;

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-transparent select-none overflow-hidden touch-none"
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    >
      <style>{slideStyles}</style>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900/50 to-black pointer-events-none z-0"></div>

      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto flex-1 min-w-0 pr-4">
             <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex-shrink-0 flex items-center justify-center border border-white/10 shadow-lg">
                <FileImage className="text-blue-400" size={20} />
             </div>
             <div className="flex flex-col text-white drop-shadow-md min-w-0">
                <h3 className="text-sm sm:text-base font-bold truncate leading-tight" title={activeFile.name}>{activeFile.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium mt-0.5">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{FORMAT_BYTES(activeFile.size)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{new Date(activeFile.modifiedAt).toLocaleDateString()}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-slate-400 italic truncate max-w-[100px]">{activeFile.path === '/' ? 'Root' : activeFile.path}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto flex-shrink-0">
             <div className="hidden md:flex items-center gap-2">
                <ControlBtn icon={ExternalLink} label="Open Original" onClick={() => window.open(downloadUrl, '_blank')} tooltipPlacement="bottom" />
                <ControlBtn icon={Download} label="Download" onClick={() => {}} tooltipPlacement="bottom" />
                <div className="w-px h-6 bg-white/10 mx-1"></div>
             </div>
             <div className="md:hidden relative" ref={menuRef}>
                 <ControlBtn icon={MoreVertical} label="Options" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} active={isMobileMenuOpen} tooltipPlacement="bottom" tooltipAlign="right" />
                 {isMobileMenuOpen && (
                     <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 origin-top-right">
                         <button onClick={() => window.open(downloadUrl, '_blank')} className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3"><ExternalLink size={16} /> Open Original</button>
                         <button onClick={() => {}} className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3"><Download size={16} /> Download</button>
                     </div>
                 )}
             </div>
             <ControlBtn icon={X} label="Close" shortcut="Esc" onClick={onClose} variant="danger" tooltipPlacement="bottom" tooltipAlign="right" />
        </div>
      </div>

      {/* Nav Arrows */}
      <div className="absolute inset-y-0 left-6 hidden lg:flex items-center z-40 pointer-events-none">
          {hasPrev && (
              <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="p-4 bg-black/40 hover:bg-white/10 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-all pointer-events-auto hover:scale-110 shadow-2xl border border-white/5 active:scale-95 group">
                  <ChevronLeft size={32} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
          )}
      </div>
      <div className="absolute inset-y-0 right-6 hidden lg:flex items-center z-40 pointer-events-none">
          {hasNext && (
              <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="p-4 bg-black/40 hover:bg-white/10 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-all pointer-events-auto hover:scale-110 shadow-2xl border border-white/5 active:scale-95 group">
                  <ChevronRight size={32} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
          )}
      </div>

      {/* Main Viewport */}
      <div ref={containerRef} className="flex-1 relative w-full h-full overflow-hidden z-10" onClick={(e) => e.stopPropagation()}>
        
        {/* Exiting Slide */}
        {exitingFile && (
            <ImageSlide 
                key={exitingFile.id}
                file={exitingFile}
                isCached={loadedImagesRef.current.has(exitingFile.id)}
                onLoaded={handleCacheUpdate}
                className={direction === 'next' ? 'slide-exit-next' : 'slide-exit-prev'}
            />
        )}

        {/* Active Slide (Entering or Static) */}
        <ImageSlide 
            key={activeFile.id}
            file={activeFile}
            isCached={loadedImagesRef.current.has(activeFile.id)}
            onLoaded={handleCacheUpdate}
            dragRef={imageRef}
            className={exitingFile ? (direction === 'next' ? 'slide-enter-next' : 'slide-enter-prev') : ''}
            style={activeTransform}
        />

      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 inset-x-0 z-50 flex flex-col items-center pb-8 pt-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
         {allImages.length > 1 && (
            <div 
                ref={filmstripRef} 
                className="relative flex items-center gap-3 p-3 mb-2 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-x-auto w-auto max-w-[calc(100%-2rem)] sm:max-w-2xl pointer-events-auto custom-scrollbar scroll-smooth mx-4"
                onWheel={(e) => e.stopPropagation()} // Stop propagation to prevent image zooming while scrolling filmstrip
            >
                {allImages.map((img) => (
                    <div key={img.id} ref={img.id === activeFile.id ? activeThumbRef : null} onClick={(e) => { e.stopPropagation(); onNavigate(img.id); }} className={`relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${img.id === activeFile.id ? 'opacity-100 scale-105 ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : 'opacity-50 hover:opacity-100 hover:scale-105 hover:ring-2 hover:ring-white/20'}`}>
                        <img 
                            src={img.url || `https://picsum.photos/seed/${img.id}/100/100`} 
                            alt={img.name} 
                            className="w-full h-full object-cover transform transition-transform group-hover:scale-110" 
                            loading="lazy" 
                        />
                    </div>
                ))}
            </div>
         )}

         <div className="pointer-events-auto w-full px-4 flex justify-center">
             <div 
                 className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] max-w-full"
                 onWheel={(e) => e.stopPropagation()} // Stop propagation to prevent image zooming while interacting with controls
             >
                 <div className="flex items-center gap-1 flex-shrink-0">
                    <ControlBtn icon={ZoomOut} label="Zoom Out" shortcut="-" onClick={handleZoomOut} disabled={scale <= 0.1} />
                    <div className="relative group mx-1 flex-shrink-0">
                        <input type="text" value={zoomInput} onChange={handleZoomInputChange} onFocus={() => setIsEditingZoom(true)} onBlur={commitZoomInput} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} className="w-12 sm:w-16 bg-black/20 text-center text-xs font-mono font-bold text-white/90 focus:text-white rounded-lg py-2 border border-transparent focus:border-blue-500/50 outline-none transition-all focus:bg-black/40" />
                        <span className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 pointer-events-none">%</span>
                    </div>
                    <ControlBtn icon={ZoomIn} label="Zoom In" shortcut="+" onClick={handleZoomIn} disabled={scale >= 10} />
                 </div>
                 <div className="w-px h-6 sm:h-8 bg-white/10 mx-1 flex-shrink-0"></div>
                 <div className="flex items-center gap-1 flex-shrink-0">
                    <ControlBtn icon={RotateCw} label="Rotate" shortcut="R" onClick={handleRotate} />
                    <ControlBtn icon={ArrowLeftRight} label="Fit Width" shortcut="W" onClick={handleFitWidth} />
                    <ControlBtn icon={ArrowUpDown} label="Fit Height" shortcut="H" onClick={handleFitHeight} />
                 </div>
                 <div className="w-px h-6 sm:h-8 bg-white/10 mx-1 flex-shrink-0"></div>
                 <ControlBtn icon={Maximize} label="Reset View" shortcut="0" onClick={handleReset} />
             </div>
         </div>
      </div>
    </div>
  );
};

export default ImageViewer;