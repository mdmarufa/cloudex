export enum FileType {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  ARCHIVE = 'ARCHIVE',
  FOLDER = 'FOLDER'
}

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: number; // in bytes
  modifiedAt: string;
  owner: string;
  isStarred: boolean;
  thumbnail?: string;
  path: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  storageUsed: number;
  storageLimit: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface ActivityLog {
  id: string;
  action: 'upload' | 'delete' | 'move' | 'rename' | 'share';
  itemName: string;
  itemType: FileType;
  timestamp: string;
  user: string;
}

export interface StorageStat {
  name: string;
  value: number; // size in bytes
  color: string;
}
