import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_USER, MOCK_FILES, MOCK_NOTIFICATIONS, MOCK_ACTIVITY, STORAGE_DATA } from '../constants';
import { User, FileItem, Notification, ActivityLog, StorageStat } from '../types';

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
        state.files = state.files.filter(f => f.id !== action.payload);
    },
    toggleStar(state, action: PayloadAction<string>) {
        const file = state.files.find(f => f.id === action.payload);
        if (file) file.isStarred = !file.isStarred;
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

export const { setSearchQuery, markNotificationRead, deleteFile, toggleStar } = dashboardSlice.actions;
export default dashboardSlice.reducer;
