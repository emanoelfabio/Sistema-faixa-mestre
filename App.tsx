
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import AttendancePage from './pages/AttendancePage';
import FinancePage from './pages/FinancePage';
import GalleryPage from './pages/GalleryPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage'; // Import LoginPage
import { useAuth } from './contexts/AuthContext'; // Import useAuth
import { AuthUser } from './types';

// ProtectedRoute component (can be in a separate file too)
const ProtectedRoute: React.FC<{ authUser: AuthUser | null, children: React.ReactNode, allowedRoles?: ('admin' | 'student')[] }> = ({ authUser, children, allowedRoles }) => {
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(authUser.role)) {
    // Optional: redirect to a "not authorized" page or back to dashboard
    return <Navigate to="/dashboard" replace />; // Or an error page
  }
  return <>{children}</>; // Wrap children in a fragment or ensure it's a single element if strictly JSX.Element
};


const App: React.FC = () => {
  const { authUser, loading } = useAuth();

  if (loading && !authUser) { // Show a simple loading screen if auth is in progress and no user yet
    return (
      <div className="flex h-screen bg-academy-primary text-academy-text items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academy-accent"></div>
        <p className="ml-4 text-lg">Carregando Aplicação...</p>
      </div>
    );
  }
  
  if (!authUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // User is authenticated
  return (
      <div className="flex h-screen bg-academy-primary text-academy-text">
        <Sidebar authUser={authUser} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header authUser={authUser} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-academy-primary p-6">
            <Routes>
              <Route path="/login" element={<Navigate to="/dashboard" replace />} /> {/* Redirect if logged in and tries to go to login */}
              
              <Route path="/" element={<ProtectedRoute authUser={authUser}><Navigate to="/dashboard" replace /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute authUser={authUser}><DashboardPage /></ProtectedRoute>} />
              
              <Route path="/students" element={
                <ProtectedRoute authUser={authUser} allowedRoles={['admin']}>
                  <StudentsPage />
                </ProtectedRoute>
              } />
              <Route path="/students/:studentId" element={
                <ProtectedRoute authUser={authUser}> {/* Both admin and student (for own profile) can access */}
                  <StudentDetailPage />
                </ProtectedRoute>
              }/>
              
              <Route path="/attendance" element={<ProtectedRoute authUser={authUser}><AttendancePage /></ProtectedRoute>} />
              <Route path="/finance" element={<ProtectedRoute authUser={authUser}><FinancePage /></ProtectedRoute>} />
              <Route path="/gallery" element={<ProtectedRoute authUser={authUser}><GalleryPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute authUser={authUser}><SettingsPage /></ProtectedRoute>} />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} /> {/* Fallback for any other route */}
            </Routes>
          </main>
        </div>
      </div>
  );
};

export default App;
