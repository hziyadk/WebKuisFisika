import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Praktikan Pages
import LoginPraktikan from './pages/praktikan/LoginPraktikan';
import RegisterPraktikan from './pages/praktikan/RegisterPraktikan';
import HomePraktikan from './pages/praktikan/HomePraktikan';
import QuizMobile from './pages/praktikan/QuizMobile';

// Asisten Pages
import LoginAsisten from './pages/asisten/LoginAsisten';
import LiveMonitoringAsisten from './pages/asisten/LiveMonitoringAsisten';
import TopicManager from './pages/asisten/TopicManager';
import RekapNilaiAsisten from './pages/asisten/RekapNilaiAsisten';

// Route Guard for Praktikan
function RequirePraktikan({ children }) {
  const { currentUser, isPraktikan } = useAuth();
  if (!currentUser || !isPraktikan) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Route Guard for Asisten
function RequireAsisten({ children }) {
  const { currentUser, isAsisten } = useAuth();
  if (!currentUser || !isAsisten) {
    return <Navigate to="/asisten/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Portal Praktikan Routes */}
          <Route path="/login" element={<LoginPraktikan />} />
          <Route path="/register" element={<RegisterPraktikan />} />
          <Route
            path="/"
            element={
              <RequirePraktikan>
                <HomePraktikan />
              </RequirePraktikan>
            }
          />
          <Route
            path="/kuis/:topicId"
            element={
              <RequirePraktikan>
                <QuizMobile />
              </RequirePraktikan>
            }
          />

          {/* Portal Asisten Routes (Terpisah) */}
          <Route path="/asisten" element={<Navigate to="/asisten/dashboard" replace />} />
          <Route path="/asisten/login" element={<LoginAsisten />} />
          <Route
            path="/asisten/dashboard"
            element={
              <RequireAsisten>
                <LiveMonitoringAsisten />
              </RequireAsisten>
            }
          />
          <Route
            path="/asisten/monitoring"
            element={<Navigate to="/asisten/dashboard" replace />}
          />
          <Route
            path="/asisten/topik"
            element={
              <RequireAsisten>
                <TopicManager />
              </RequireAsisten>
            }
          />
          <Route
            path="/asisten/rekap"
            element={
              <RequireAsisten>
                <RekapNilaiAsisten />
              </RequireAsisten>
            }
          />
          <Route path="/asisten/laporan" element={<Navigate to="/asisten/rekap" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
