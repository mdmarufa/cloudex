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

// --- Premium Control Button Component ---
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

  // Tooltip positioning logic
  const tooltipPosClass = tooltipPlacement === 'top' 
    ? 'bottom-full mb-3 origin-bottom' 
    : 'top-full mt-3 origin-top';
    
  const arrowPosClass = tooltipPlacement === 'top'
    ? 'top-full border-t-slate-900/95 border-b-transparent border-x-transparent'
    : 'bottom-full border-b-slate-900/95 border-t-transparent border-x-transparent';

  // Alignment classes
  const alignClass = tooltipAlign === 'right' ? 'right-0' : tooltipAlign === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2';
  const arrowAlignClass = tooltipAlign === 'right' ? 'right-4' : tooltipAlign === 'left' ? 'left-4' : 'left-1/2 -translate-x-1/2';

  return (
    <div className={`relative group flex items-center justify-center flex-shrink-0 ${className}`}>
      <button 
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
            relative p-2 sm:p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300 ease-[cubic-bezier(0.25,0.4,0.25,1)]
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
            hover:scale-110 active:scale-95
            ${getBaseStyles()}
            ${activeStyles}
        `}
        aria-label={label}
      >
        <Icon size={20} strokeWidth={2} />
        {active && <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 animate-pulse"></span>}
      </button>

      {/* Premium Tooltip */}
      <div className={`
          absolute ${tooltipPosClass} ${alignClass} px-3 py-1.5 
          bg-slate-900/95 backdrop-blur-xl text-white text-xs font-medium rounded-lg 
          shadow-xl border border-white/10 whitespace-nowrap pointer-events-none z-[60]
          transition-all duration-200
          ${showTooltip ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          ${tooltipPlacement === 'top' && !showTooltip ? 'translate-y-2' : ''}
          ${tooltipPlacement === 'bottom' && !showTooltip ? '-translate-y-2' : ''}
      `}>
         <div className="flex items-center gap-2">
            <span>{label}</span>
            {shortcut && (
                <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono text-slate-300 border border-white/5">
                    {shortcut}
                </span>
            )}
         </div>
         {/* Arrow */}
         <div className={`absolute ${arrowAlignClass} -mt-[1px] border-4 ${arrowPosClass}`}></div>
      </div>
    </div>
  );
};

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Zoom Input State
  const [zoomInput, setZoomInput] = useState('100');
  const [isEditingZoom, setIsEditingZoom] = useState(false);

  // Touch Swipe State
  const minSwipeDistance = 50;
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    setIsMobileMenuOpen(false);
  }, [file.id]);

  // Scroll active thumbnail into view - REPLACED scrollIntoView with manual calculation
  useEffect(() => {
    if (activeThumbRef.current && filmstripRef.current) {
        const container = filmstripRef.current;
        const thumb = activeThumbRef.current;
        
        // Manual scroll calculation to prevent whole-page shifting
        const containerWidth = container.clientWidth;
        const thumbLeft = thumb.offsetLeft;
        const thumbWidth = thumb.offsetWidth;
        
        // Center the thumbnail
        const scrollTarget = thumbLeft - (containerWidth / 2) + (thumbWidth / 2);
        
        container.scrollTo({
            left: scrollTarget,
            behavior: 'smooth'
        });
    }
  }, [file.id]);

  // Close Mobile Menu on Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // --- Sync Input with Scale ---
  useEffect(() => {
    if (!isEditingZoom) {
        setZoomInput(Math.round(scale * 100).toString());
    }
  }, [scale, isEditingZoom]);

  // --- Controls Actions ---
  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 10)); // Logarithmic zoom feels better
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
  const handleRotate = () => setRotation(prev => prev + 90);
  
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Fixed Fit Logic: Use 100% of container dimension
  const handleFitWidth = () => {
    if (!containerRef.current || !imageRef.current) return;
    const containerW = containerRef.current.clientWidth;
    const rect = imageRef.current.getBoundingClientRect();
    const currentVisualWidth = rect.width;
    
    // Avoid division by zero
    if (currentVisualWidth === 0) return;

    // Calculate scaling factor to make visual width match container width
    // Factor = Target / Current
    const factor = (containerW) / currentVisualWidth;
    
    setScale(prev => prev * factor);
    setPosition({ x: 0, y: 0 });
  };

  const handleFitHeight = () => {
    if (!containerRef.current || !imageRef.current) return;
    const containerH = containerRef.current.clientHeight;
    const rect = imageRef.current.getBoundingClientRect();
    const currentVisualHeight = rect.height;

    if (currentVisualHeight === 0) return;

    const factor = (containerH) / currentVisualHeight;
    
    setScale(prev => prev * factor);
    setPosition({ x: 0, y: 0 });
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
      val = Math.max(10, Math.min(1000, val));
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
      if (e.ctrlKey || Math.abs(e.deltaY) > 0) {
        if (e.deltaY < 0) {
            setScale(prev => Math.min(prev * 1.1, 10));
        } else {
            setScale(prev => Math.max(prev / 1.1, 0.1));
        }
      }
  };

  // --- Panning Logic (Mouse) ---
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

  // --- Touch Logic (Swipe & Pan) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    // If zoomed in, allow dragging (panning) via touch
    if (scale > 1) {
       setIsDragging(true);
       setDragStart({ 
           x: e.targetTouches[0].clientX - position.x, 
           y: e.targetTouches[0].clientY - position.y 
       });
       return;
    }

    // If not zoomed, prepare for swipe detection
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Pan if zoomed
    if (scale > 1 && isDragging) {
       setPosition({
         x: e.targetTouches[0].clientX - dragStart.x,
         y: e.targetTouches[0].clientY - dragStart.y
       });
       return;
    }

    // Track swipe
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Swipe Navigation (Only if not zoomed)
    if (scale === 1 && touchStart !== null && touchEnd !== null) {
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && hasNext) {
            handleNext();
        } else if (isRightSwipe && hasPrev) {
            handlePrev();
        }
    }
    
    // Reset
    setTouchStart(null);
    setTouchEnd(null);
  };

  // --- Image Source ---
  const imageUrl = `https://picsum.photos/seed/${file.id}/1920/1080`;

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-transparent select-none overflow-hidden touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      // Touch Handlers
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900/50 to-black pointer-events-none z-0"></div>

      {/* Top Bar: Info & Close */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 hover:opacity-100">
        
        {/* Left: Title & Info - Constrained Width to prevent overflow */}
        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto flex-1 min-w-0 pr-4">
             {/* File Type Icon Badge */}
             <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex-shrink-0 flex items-center justify-center border border-white/10 shadow-lg">
                <FileImage className="text-blue-400" size={20} />
             </div>
             <div className="flex flex-col text-white drop-shadow-md min-w-0">
                <h3 className="text-sm sm:text-base font-bold truncate leading-tight" title={file.name}>{file.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium mt-0.5">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{FORMAT_BYTES(file.size)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{new Date(file.modifiedAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-2 pointer-events-auto flex-shrink-0">
             
             {/* Desktop Actions */}
             <div className="hidden md:flex items-center gap-2">
                <ControlBtn 
                   icon={ExternalLink} 
                   label="Open Original" 
                   onClick={() => window.open(imageUrl, '_blank')}
                   tooltipPlacement="bottom" 
                />
                <ControlBtn 
                   icon={Download} 
                   label="Download" 
                   onClick={() => {}} 
                   tooltipPlacement="bottom"
                />
                <div className="w-px h-6 bg-white/10 mx-1"></div>
             </div>

             {/* Mobile Actions Menu */}
             <div className="md:hidden relative" ref={menuRef}>
                 <ControlBtn 
                    icon={MoreVertical} 
                    label="Options" 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    active={isMobileMenuOpen}
                    tooltipPlacement="bottom"
                    tooltipAlign="right"
                 />
                 {isMobileMenuOpen && (
                     <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 origin-top-right">
                         <button 
                             onClick={() => window.open(imageUrl, '_blank')}
                             className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3"
                         >
                             <ExternalLink size={16} /> Open Original
                         </button>
                         <button 
                             onClick={() => {}}
                             className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3"
                         >
                             <Download size={16} /> Download
                         </button>
                     </div>
                 )}
             </div>

             {/* Close Button (Always Visible) */}
             <ControlBtn 
                icon={X} 
                label="Close" 
                shortcut="Esc"
                onClick={onClose}
                variant="danger"
                tooltipPlacement="bottom"
                tooltipAlign="right"
             />
        </div>
      </div>

      {/* Navigation Arrows (Side) - HIDDEN ON MOBILE/TABLET */}
      <div className="absolute inset-y-0 left-6 hidden lg:flex items-center z-40 pointer-events-none">
          {hasPrev && (
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="p-4 bg-black/40 hover:bg-white/10 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-all pointer-events-auto hover:scale-110 shadow-2xl border border-white/5 active:scale-95 group"
                title="Previous"
              >
                  <ChevronLeft size={32} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
          )}
      </div>
      <div className="absolute inset-y-0 right-6 hidden lg:flex items-center z-40 pointer-events-none">
          {hasNext && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="p-4 bg-black/40 hover:bg-white/10 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-all pointer-events-auto hover:scale-110 shadow-2xl border border-white/5 active:scale-95 group"
                title="Next"
              >
                  <ChevronRight size={32} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
          )}
      </div>

      {/* Main Viewport */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-hidden flex items-center justify-center cursor-${isDragging ? 'grabbing' : 'grab'} relative z-10 w-full h-full`}
        onClick={(e) => e.stopPropagation()} 
      >
        {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none z-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse opacity-20"></div>
                    </div>
                </div>
                <p className="mt-4 text-sm font-medium text-slate-300 animate-pulse tracking-wide uppercase">Loading Preview</p>
            </div>
        )}

        {hasError ? (
            <div className="flex flex-col items-center text-slate-400 pointer-events-none z-50 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-xl shadow-red-500/5">
                    <AlertCircle size={40} className="text-red-500" />
                </div>
                <p className="text-xl font-bold text-white mb-2">Failed to load image</p>
                <p className="text-sm text-slate-400 mb-6">The image data could not be retrieved.</p>
                <button 
                    onClick={() => { setHasError(false); setIsLoading(true); }} 
                    className="pointer-events-auto px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors border border-white/10"
                >
                    Try Again
                </button>
            </div>
        ) : (
            <img 
                ref={imageRef}
                src={imageUrl} 
                alt={file.name}
                onLoad={() => setIsLoading(false)}
                onError={() => { setIsLoading(false); setHasError(true); }}
                className={`
                    max-w-none max-h-none 
                    transition-transform ease-[cubic-bezier(0.25,0.4,0.25,1)] will-change-transform 
                    ${isDragging ? 'duration-0' : 'duration-300'} 
                    ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                `}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                    // Initial constraints to ensure it starts reasonably sized
                    maxHeight: '85vh',
                    maxWidth: '90%', // Use % instead of vw for safety
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
                draggable={false}
            />
        )}
      </div>

      {/* Bottom Area: Controls */}
      <div className="absolute bottom-0 inset-x-0 z-50 flex flex-col items-center pb-8 pt-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
         
         {/* Filmstrip */}
         {allImages.length > 1 && (
            <div 
                ref={filmstripRef}
                className="relative flex items-center gap-3 p-3 mb-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-x-auto w-auto max-w-[calc(100%-2rem)] sm:max-w-2xl pointer-events-auto custom-scrollbar scroll-smooth mx-4"
            >
                {allImages.map((img) => (
                    <div 
                        key={img.id}
                        ref={img.id === file.id ? activeThumbRef : null}
                        onClick={(e) => { e.stopPropagation(); onNavigate(img.id); }}
                        className={`
                            relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group
                            ${img.id === file.id 
                                ? 'opacity-100 scale-105 ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' 
                                : 'opacity-50 hover:opacity-100 hover:scale-105 hover:ring-2 hover:ring-white/20'}
                        `}
                    >
                        <img 
                            src={`https://picsum.photos/seed/${img.id}/100/100`} 
                            alt={img.name}
                            className="w-full h-full object-cover transform transition-transform group-hover:scale-110"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
         )}

         {/* Floating Control Bar */}
         <div className="pointer-events-auto w-full px-4 flex justify-center">
             <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] max-w-full">
                 
                 {/* Section: Zoom */}
                 <div className="flex items-center gap-1 flex-shrink-0">
                    <ControlBtn icon={ZoomOut} label="Zoom Out" shortcut="-" onClick={handleZoomOut} disabled={scale <= 0.1} />
                    
                    <div className="relative group mx-1 flex-shrink-0">
                        <input 
                            type="text"
                            value={zoomInput}
                            onChange={handleZoomInputChange}
                            onFocus={() => setIsEditingZoom(true)}
                            onBlur={commitZoomInput}
                            onKeyDown={handleZoomInputKeyDown}
                            className="w-12 sm:w-16 bg-black/20 text-center text-xs font-mono font-bold text-white/90 focus:text-white rounded-lg py-2 border border-transparent focus:border-blue-500/50 outline-none transition-all focus:bg-black/40"
                        />
                        <span className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 pointer-events-none">%</span>
                    </div>

                    <ControlBtn icon={ZoomIn} label="Zoom In" shortcut="+" onClick={handleZoomIn} disabled={scale >= 10} />
                 </div>

                 <div className="w-px h-6 sm:h-8 bg-white/10 mx-1 flex-shrink-0"></div>

                 {/* Section: Tools */}
                 <div className="flex items-center gap-1 flex-shrink-0">
                    <ControlBtn icon={RotateCw} label="Rotate" shortcut="R" onClick={handleRotate} />
                    <ControlBtn icon={ArrowLeftRight} label="Fit Width" shortcut="W" onClick={handleFitWidth} />
                    <ControlBtn icon={ArrowUpDown} label="Fit Height" shortcut="H" onClick={handleFitHeight} />
                 </div>

                 <div className="w-px h-6 sm:h-8 bg-white/10 mx-1 flex-shrink-0"></div>

                 {/* Section: Reset */}
                 <ControlBtn icon={Maximize} label="Reset View" shortcut="0" onClick={handleReset} />

             </div>
         </div>
      </div>
    </div>
  );
};

export default ImageViewer;