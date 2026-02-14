import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_USER, MOCK_FILES, MOCK_NOTIFICATIONS, MOCK_ACTIVITY, STORAGE_DATA } from '../constants';
import { User, FileItem, Notification, ActivityLog, StorageStat, FileType } from '../types';

interface DashboardState {
  user: User | null;
  files: FileItem[];
  notifications: Notification[];
  recentActivity: ActivityLog[];
  storageStats: StorageStat[];
  loading: boolean;
  searchQuery: string;
}

const initialState: DashboardState = {
  user: null,
  files: [],
  notifications: [],
  recentActivity: [],
  storageStats: [],
  loading: true,
  searchQuery: '',
};

// Simulate API fetch
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async () => {
    return new Promise<{ user: User; files: FileItem[]; notifications: Notification[]; activity: ActivityLog[]; storage: StorageStat[] }>((resolve) => {
      setTimeout(() => {
        resolve({
          user: MOCK_USER,
          files: MOCK_FILES,
          notifications: MOCK_NOTIFICATIONS,
          activity: MOCK_ACTIVITY,
          storage: STORAGE_DATA,
        });
      }, 1500); // 1.5s simulated delay for skeleton viewing
    });
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) notif.read = true;
    },
    deleteFile(state, action: PayloadAction<string>) {
        const fileId = action.payload;
        const fileToDelete = state.files.find(f => f.id === fileId);
        
        if (fileToDelete) {
            if (fileToDelete.type === FileType.FOLDER) {
                // Construct the full path of the folder to delete children
                const folderPath = fileToDelete.path === '/' 
                    ? `/${fileToDelete.name}` 
                    : `${fileToDelete.path}/${fileToDelete.name}`;
                
                // Remove the folder AND any files that exist within its path
                state.files = state.files.filter(f => 
                    f.id !== fileId && !f.path.startsWith(folderPath)
                );
            } else {
                state.files = state.files.filter(f => f.id !== fileId);
            }
        }
    },
    toggleStar(state, action: PayloadAction<string>) {
        const file = state.files.find(f => f.id === action.payload);
        if (file) file.isStarred = !file.isStarred;
    },
    createFolder(state, action: PayloadAction<{ name: string; path: string }>) {
        const newFolder: FileItem = {
            id: `folder-${Date.now()}`,
            name: action.payload.name,
            type: FileType.FOLDER,
            size: 0,
            modifiedAt: new Date().toISOString(),
            owner: 'Me',
            isStarred: false,
            path: action.payload.path
        };
        state.files.push(newFolder);
    },
    renameItem(state, action: PayloadAction<{ id: string; newName: string }>) {
        const item = state.files.find(f => f.id === action.payload.id);
        if (item) {
            const oldName = item.name;
            const oldPathFull = item.path === '/' ? `/${oldName}` : `${item.path}/${oldName}`;
            
            // 1. Rename the item
            item.name = action.payload.newName;

            // 2. If it's a folder, we must update the 'path' of all children
            if (item.type === FileType.FOLDER) {
                const newPathFull = item.path === '/' ? `/${action.payload.newName}` : `${item.path}/${action.payload.newName}`;
                
                state.files.forEach(f => {
                    if (f.path.startsWith(oldPathFull)) {
                        f.path = f.path.replace(oldPathFull, newPathFull);
                    }
                });
            }
        }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.files = action.payload.files;
        state.notifications = action.payload.notifications;
        state.recentActivity = action.payload.activity;
        state.storageStats = action.payload.storage;
      });
  },
});

export const { setSearchQuery, markNotificationRead, deleteFile, toggleStar, createFolder, renameItem } = dashboardSlice.actions;
export default dashboardSlice.reducer;