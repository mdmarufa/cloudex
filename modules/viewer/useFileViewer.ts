import { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { FileItem } from '../../types';
import { SUPPORTED_IMAGE_EXTENSIONS } from './viewer.types';

export const useFileViewer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { files } = useSelector((state: RootState) => state.dashboard);
  
  const [activeFile, setActiveFile] = useState<FileItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isSupportedImage, setIsSupportedImage] = useState(false);

  useEffect(() => {
    const modalType = searchParams.get('modal');
    const fileId = searchParams.get('fileId');

    if (modalType === 'preview' && fileId) {
      const foundFile = files.find(f => f.id === fileId);
      
      if (foundFile) {
        setActiveFile(foundFile);
        setIsOpen(true);
        
        // Determine extension
        const extension = foundFile.name.split('.').pop()?.toLowerCase() || '';
        setFileType(extension);
        setIsSupportedImage(SUPPORTED_IMAGE_EXTENSIONS.includes(extension));
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
      } else {
        closeViewer();
      }
    } else {
      setIsOpen(false);
      setActiveFile(null);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [searchParams, files]);

  const closeViewer = () => {
    // Remove modal params from URL but keep others
    const newParams = new URLSearchParams(location.search);
    newParams.delete('modal');
    newParams.delete('fileId');
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  return {
    isOpen,
    activeFile,
    fileType,
    isSupportedImage,
    closeViewer
  };
};
