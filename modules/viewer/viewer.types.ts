import { FileItem } from '../../types';

export type SupportedImageType = 'jpeg' | 'jpg' | 'png' | 'webp' | 'gif';

export const SUPPORTED_IMAGE_EXTENSIONS: string[] = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export interface ImageViewerProps {
  file: FileItem;
  onClose: () => void;
}

export interface ViewerControls {
  scale: number;
  rotation: number;
  position: { x: number; y: number };
  isDragging: boolean;
}
