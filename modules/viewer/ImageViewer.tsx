import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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

// --- Simplified Linear Slide Styles ---
const styles = `
  /* NEXT ANIMATION (Move Right -> Left) */
  .slide-next-enter { animation: slideInFromRight 0.4s ease-out forwards; }
  .slide-next-exit  { animation: slideOutToLeft 0.4s ease-out forwards; }

  /* PREV ANIMATION (Move Left -> Right) */
  .slide-prev-enter { animation: slideInFromLeft 0.4s ease-out forwards; }
  .slide-prev-exit  { animation: slideOutToRight 0.4s ease-out forwards; }

  @keyframes slideInFromRight {
    0% { transform: translate3d(100%, 0, 0); }
    100% { transform: translate3d(0, 0, 0); }
  }

  @keyframes slideOutToLeft {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-100%, 0, 0); }
  }

  @keyframes slideInFromLeft {
    0% { transform: translate3d(-100%, 0, 0); }
    100% { transform: translate3d(0, 0, 0); }
  }

  @keyframes slideOutToRight {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(100%, 0, 0); }
  }
`;

// --- Control Button ---
interface ControlBtnProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  shortcut?: string;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}

const ControlBtn: React.FC<ControlBtnProps> = ({ 
  icon: Icon, onClick, disabled = false, active = false, className = ''
}) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`
        p-2.5 rounded-xl backdrop-blur-md border transition-all duration-200
        disabled:opacity-30 disabled:cursor-not-allowed
        active:scale-95 hover:scale-105
        ${active 
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
            : 'bg-black/40 hover:bg-white/10 text-slate-200 hover:text-white border-white/5 hover:border-white/20'}
        ${className}
    `}
  >
    <Icon size={20} strokeWidth={2} />
  </button>
);

const ImageViewer: React.FC<ImageViewerProps> = ({ file, onClose, onNavigate }) => {
  const { files } = useSelector((state: RootState) => state.dashboard);
  
  // --- View State ---
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // --- Animation State ---
  // activeFile is the one currently supposed to be shown (Incoming)
  // previousFile is the one being animated out (Outgoing)
  const [activeFile, setActiveFile] = useState<FileItem>(file);
  const [previousFile, setPreviousFile] = useState<FileItem | null>(null);
  
  // 'right' means we clicked Next (images move Left)
  // 'left' means we clicked Prev (images move Right)
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Derived Data ---
  const allImages = useMemo(() => files.filter(f => f.type === FileType.IMAGE), [files]);
  const currentIndex = allImages.findIndex(f => f.id === activeFile.id);
  const hasNext = currentIndex < allImages.length - 1;
  const hasPrev = currentIndex > 0;

  // --- Synchronization Effect ---
  useEffect(() => {
    // Only trigger transition if the ID actually changed
    if (file.id !== activeFile.id) {
        
        // 1. Determine direction based on index comparison
        const newIndex = allImages.findIndex(f => f.id === file.id);
        const oldIndex = allImages.findIndex(f => f.id === activeFile.id);
        
        // If new index > old index, we go "Next" (direction right visually, slides left)
        const isNext = newIndex > oldIndex; 
        const newDirection = isNext ? 'right' : 'left';

        // 2. Set transition state
        setDirection(newDirection);
        setPreviousFile(activeFile); // The current one becomes previous
        setActiveFile(file);         // The new one becomes active
        setIsAnimating(true);
        
        // 3. Reset Zoom/Pan for the new image immediately
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });

        // 4. Clear transition after animation duration (400ms to match CSS)
        if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = setTimeout(() => {
            setPreviousFile(null); // Remove the old image from DOM
            setIsAnimating(false);
        }, 400); 
    }
  }, [file, activeFile, allImages]);

  // Clean up timeout
  useEffect(() => {
    return () => {
        if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, []);

  // --- Filmstrip Scroll ---
  useEffect(() => {
    if (activeThumbRef.current && filmstripRef.current) {
        const container = filmstripRef.current;
        const thumb = activeThumbRef.current;
        const scrollTarget = thumb.offsetLeft - (container.clientWidth / 2) + (thumb.offsetWidth / 2);
        container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }
  }, [activeFile.id]);

  // --- Handlers ---
  const handleNext = useCallback(() => {
      if (hasNext && !isAnimating) onNavigate(allImages[currentIndex + 1].id);
  }, [hasNext, isAnimating, onNavigate, allImages, currentIndex]);

  const handlePrev = useCallback(() => {
      if (hasPrev && !isAnimating) onNavigate(allImages[currentIndex - 1].id);
  }, [hasPrev, isAnimating, onNavigate, allImages, currentIndex]);

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.5, 8));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.5, 0.5));
  const handleRotate = () => setRotation(prev => prev + 90);
  const handleReset = () => { setScale(1); setRotation(0); setPosition({ x: 0, y: 0 }); };

  // --- Keyboard ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': onClose(); break;
        case 'ArrowRight': handleNext(); break;
        case 'ArrowLeft': handlePrev(); break;
        case '+': handleZoomIn(); break;
        case '-': handleZoomOut(); break;
        case '0': handleReset(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

  // --- Pan Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setIsDragging(false);

  // --- Swipe Logic (Mobile) ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
      if (scale > 1) {
          setIsDragging(true);
          setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
          return;
      }
      setTouchStart(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
      if (isDragging && scale > 1) {
          setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
      }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
      setIsDragging(false);
      if (scale === 1 && touchStart !== null) {
          const touchEnd = e.changedTouches[0].clientX;
          const dist = touchStart - touchEnd;
          if (dist > 50) handleNext();
          if (dist < -50) handlePrev();
      }
      setTouchStart(null);
  };

  /**
   * Renders a single image layer.
   * @param f - File Item
   * @param isExiting - If true, this is the 'previous' image animating out.
   */
  const renderImage = (f: FileItem, isExiting: boolean) => {
    const imageUrl = `https://picsum.photos/seed/${f.id}/1920/1080`;
    
    let animClass = '';

    if (isAnimating) {
        if (direction === 'right') {
            // User clicked Next: Content moves Left
            // Enter: From Right (100% -> 0)
            // Exit: To Left (0 -> -100%)
            animClass = isExiting ? 'slide-next-exit' : 'slide-next-enter';
        } else {
            // User clicked Prev: Content moves Right
            // Enter: From Left (-100% -> 0)
            // Exit: To Right (0 -> 100%)
            animClass = isExiting ? 'slide-prev-exit' : 'slide-prev-enter';
        }
    }

    return (
        <div 
            key={f.id}
            className={`absolute inset-0 flex items-center justify-center w-full h-full pointer-events-none ${animClass}`}
            style={{ 
                zIndex: isExiting ? 0 : 1 
            }}
        >
            <img 
                src={imageUrl} 
                alt={f.name}
                className="max-w-[95%] max-h-[90vh] object-contain shadow-2xl will-change-transform"
                style={{
                    // Only apply zoom/pan transforms to the ACTIVE image, not the exiting one
                    transform: !isExiting 
                        ? `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})` 
                        : 'none',
                    cursor: scale > 1 ? 'grab' : 'default'
                }}
                draggable={false}
            />
        </div>
    );
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-transparent select-none overflow-hidden"
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    >
      <style>{styles}</style>
      
      {/* 1. Top Bar */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto min-w-0 pr-4">
             <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <FileImage className="text-blue-400" size={20} />
             </div>
             <div className="min-w-0 flex flex-col">
                 <h3 className="text-white font-bold truncate leading-tight">{activeFile.name}</h3>
                 <span className="text-xs text-slate-300">{FORMAT_BYTES(activeFile.size)} • {new Date(activeFile.modifiedAt).toLocaleDateString()}</span>
             </div>
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
             <div className="hidden md:flex gap-2 mr-2">
                <ControlBtn icon={ExternalLink} label="Open" onClick={() => {}} />
                <ControlBtn icon={Download} label="Download" onClick={() => {}} />
             </div>
             <ControlBtn icon={X} label="Close" onClick={onClose} className="hover:bg-red-500/20 hover:text-red-400" />
        </div>
      </div>

      {/* 2. Main Viewport (Stack) */}
      <div ref={containerRef} className="flex-1 relative w-full h-full z-0 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-black/80 to-black z-[-1]" />
          
          {/* Render Exiting Image (if any) */}
          {previousFile && renderImage(previousFile, true)}
          
          {/* Render Active Image */}
          {renderImage(activeFile, false)}

          {/* Nav Arrows (Desktop) */}
          {!isAnimating && hasPrev && (
            <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white backdrop-blur-sm transition-all hover:scale-110 z-20 hidden lg:flex"
            >
                <ChevronLeft size={32} />
            </button>
          )}
          {!isAnimating && hasNext && (
            <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white backdrop-blur-sm transition-all hover:scale-110 z-20 hidden lg:flex"
            >
                <ChevronRight size={32} />
            </button>
          )}
      </div>

      {/* 3. Bottom Controls */}
      <div className="absolute bottom-0 inset-x-0 z-50 flex flex-col items-center pb-8 pt-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
         
         {/* Filmstrip */}
         {allImages.length > 1 && (
            <div 
                ref={filmstripRef}
                className="relative flex gap-3 p-2 mb-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-x-auto max-w-[90vw] sm:max-w-xl pointer-events-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
            >
                {allImages.map((img) => (
                    <button 
                        key={img.id}
                        ref={img.id === activeFile.id ? activeThumbRef : null}
                        onClick={(e) => { e.stopPropagation(); if(!isAnimating) onNavigate(img.id); }}
                        className={`
                            relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300
                            ${img.id === activeFile.id 
                                ? 'opacity-100 ring-2 ring-blue-500 scale-100' 
                                : 'opacity-40 hover:opacity-80 scale-95 hover:scale-100'}
                        `}
                    >
                        <img src={`https://picsum.photos/seed/${img.id}/100/100`} alt="" className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
         )}

         {/* Toolbar */}
         <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl pointer-events-auto shadow-2xl">
             <ControlBtn icon={ZoomOut} label="Zoom Out" onClick={handleZoomOut} disabled={scale <= 0.5} />
             <ControlBtn icon={ZoomIn} label="Zoom In" onClick={handleZoomIn} disabled={scale >= 8} />
             <div className="w-px h-6 bg-white/10 mx-1" />
             <ControlBtn icon={RotateCw} label="Rotate" onClick={handleRotate} />
             <ControlBtn icon={Maximize} label="Reset" onClick={handleReset} />
         </div>
      </div>
    </div>
  );
};

export default ImageViewer;