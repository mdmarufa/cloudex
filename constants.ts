import { FileType, FileItem, User, Notification, ActivityLog, StorageStat } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex@cloudvault.com',
  avatar: 'https://picsum.photos/200',
  plan: 'Pro',
  storageUsed: 75000000000, // 75GB
  storageLimit: 100000000000, // 100GB
};

export const MOCK_FILES: FileItem[] = [
  { id: 'f1', name: 'Project Specs.pdf', type: FileType.DOCUMENT, size: 2500000, modifiedAt: '2023-10-25T10:00:00Z', owner: 'Me', isStarred: true, path: '/Docs' },
  { id: 'f2', name: 'Holiday Photos', type: FileType.FOLDER, size: 0, modifiedAt: '2023-10-24T15:30:00Z', owner: 'Me', isStarred: false, path: '/' },
  { id: 'f3', name: 'Q4 Report.docx', type: FileType.DOCUMENT, size: 1500000, modifiedAt: '2023-10-23T09:15:00Z', owner: 'Jane Doe', isStarred: false, path: '/Work' },
  { id: 'f4', name: 'Design Assets.zip', type: FileType.ARCHIVE, size: 45000000, modifiedAt: '2023-10-22T14:20:00Z', owner: 'Me', isStarred: true, path: '/Design' },
  { id: 'f5', name: 'Launch Video.mp4', type: FileType.VIDEO, size: 125000000, modifiedAt: '2023-10-21T11:00:00Z', owner: 'Marketing', isStarred: false, path: '/Marketing' },
  { id: 'f6', name: 'Profile.png', type: FileType.IMAGE, size: 2400000, modifiedAt: '2023-10-20T16:45:00Z', owner: 'Me', isStarred: false, path: '/Images' },
  { id: 'f7', name: 'Budget.xlsx', type: FileType.DOCUMENT, size: 500000, modifiedAt: '2023-10-26T08:30:00Z', owner: 'Finance', isStarred: true, path: '/Finance' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'File Shared', message: 'Sarah shared "Q4 Roadmap" with you.', type: 'info', timestamp: '2023-10-26T09:00:00Z', read: false, link: '/dashboard/files?id=f3' },
  { id: 'n2', title: 'Upload Complete', message: 'Design Assets.zip uploaded successfully.', type: 'success', timestamp: '2023-10-25T14:22:00Z', read: true },
  { id: 'n3', title: 'Storage Warning', message: 'You have used 75% of your storage.', type: 'warning', timestamp: '2023-10-24T10:00:00Z', read: false },
];

export const MOCK_ACTIVITY: ActivityLog[] = [
  { id: 'a1', action: 'upload', itemName: 'Budget.xlsx', itemType: FileType.DOCUMENT, timestamp: '2023-10-26T08:30:00Z', user: 'You' },
  { id: 'a2', action: 'share', itemName: 'Project Specs.pdf', itemType: FileType.DOCUMENT, timestamp: '2023-10-25T11:00:00Z', user: 'You' },
  { id: 'a3', action: 'delete', itemName: 'Old Draft.docx', itemType: FileType.DOCUMENT, timestamp: '2023-10-24T16:15:00Z', user: 'You' },
  { id: 'a4', action: 'move', itemName: 'Logo.png', itemType: FileType.IMAGE, timestamp: '2023-10-23T13:45:00Z', user: 'You' },
  { id: 'a5', action: 'rename', itemName: 'Final Video.mp4', itemType: FileType.VIDEO, timestamp: '2023-10-22T09:20:00Z', user: 'You' },
];

export const STORAGE_DATA: StorageStat[] = [
  { name: 'Images', value: 10000000000, color: '#3b82f6' }, // Blue 10GB
  { name: 'Videos', value: 20000000000, color: '#8b5cf6' }, // Violet 20GB
  { name: 'Documents', value: 10000000000, color: '#10b981' }, // Green 10GB
  { name: 'Others', value: 10000000000, color: '#64748b' }, // Slate 10GB
  { name: 'Apps', value: 5000000000, color: '#f59e0b' }, // Amber 5GB
];

export const FORMAT_BYTES = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};