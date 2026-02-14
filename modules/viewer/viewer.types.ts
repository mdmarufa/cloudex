import { FileItem } from '../../types';

export type FileCategory = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'archive' | 'code' | 'unknown';

export interface ImageViewerProps {
  file: FileItem;
  onClose: () => void;
  onNavigate: (fileId: string) => void;
}

export const EXTENSION_MAP: Record<string, FileCategory> = {
  // Images
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image', bmp: 'image',
  
  // Video
  mp4: 'video', webm: 'video', ogg: 'video', mov: 'video', avi: 'video', mkv: 'video',
  
  // Audio
  mp3: 'audio', wav: 'audio', m4a: 'audio', aac: 'audio', flac: 'audio',
  
  // Documents
  pdf: 'pdf',
  
  // Text / Code
  txt: 'text', md: 'text', csv: 'text', json: 'code', js: 'code', ts: 'code', 
  html: 'code', css: 'code', xml: 'code', yml: 'code', py: 'code', java: 'code', c: 'code',
  
  // Archives (Unsupported View)
  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
  
  // Executables (Unsupported View)
  exe: 'unknown', msi: 'unknown', apk: 'unknown', dmg: 'unknown', iso: 'unknown'
};

export const getFileCategory = (filename: string): FileCategory => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return EXTENSION_MAP[ext] || 'unknown';
};