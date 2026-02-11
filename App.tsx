import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Overview } from './pages/Dashboard/Overview';
import { FilesPage } from './pages/Dashboard/Files';
import { SettingsPage } from './pages/Dashboard/Settings';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
          
          {/* Main Dashboard Route with Nested Children */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="overview" element={<Overview />} />
            <Route path="files" element={<FilesPage />} />
            <Route path="recent" element={<FilesPage />} /> {/* Reusing FilesPage for simplicity */}
            <Route path="starred" element={<FilesPage />} /> {/* Reusing FilesPage for simplicity */}
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
