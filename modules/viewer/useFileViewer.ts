import { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { FileItem } from '../../types';
import { getFileCategory, FileCategory } from './viewer.types';

export const useFileViewer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { files } = useSelector((state: RootState) => state.dashboard);
  
  const [activeFile, setActiveFile] = useState<FileItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [fileCategory, setFileCategory] = useState<FileCategory>('unknown');
  const [fileNotFound, setFileNotFound] = useState(false);

  useEffect(() => {
    const modalType = searchParams.get('modal');
    const fileId = searchParams.get('fileId');

    if (modalType === 'preview' && fileId) {
      setIsOpen(true);
      const foundFile = files.find(f => f.id === fileId);
      
      if (foundFile) {
        setActiveFile(foundFile);
        setFileNotFound(false);
        setFileCategory(getFileCategory(foundFile.name));
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
      } else {
        // ID is in URL, but file not found in store
        setActiveFile(null);
        setFileNotFound(true);
      }
    } else {
      setIsOpen(false);
      setActiveFile(null);
      setFileNotFound(false);
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

  const navigateToFile = (fileId: string) => {
      const newParams = new URLSearchParams(location.search);
      newParams.set('modal', 'preview');
      newParams.set('fileId', fileId);
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  return {
    isOpen,
    activeFile,
    fileCategory,
    fileNotFound,
    closeViewer,
    navigateToFile
  };
};