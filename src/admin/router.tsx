import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import JourneyListPage from './pages/JourneyListPage';
import JourneyEditPage from './pages/JourneyEditPage';
import WishlistPage from './pages/WishlistPage';
import PackingListPage from './pages/PackingListPage';
import CoordinatesPage from './pages/CoordinatesPage';
import SettingsPage from './pages/SettingsPage';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />

      <Route element={<AuthGuard />}>
        <Route path="dashboard" element={<AdminLayout><DashboardPage /></AdminLayout>} />
        <Route path="journeys" element={<AdminLayout><JourneyListPage /></AdminLayout>} />
        <Route path="journeys/new" element={<AdminLayout><JourneyEditPage /></AdminLayout>} />
        <Route path="journeys/:id" element={<AdminLayout><JourneyEditPage /></AdminLayout>} />
        <Route path="wishlist" element={<AdminLayout><WishlistPage /></AdminLayout>} />
        <Route path="packing" element={<AdminLayout><PackingListPage /></AdminLayout>} />
        <Route path="coordinates" element={<AdminLayout><CoordinatesPage /></AdminLayout>} />
        <Route path="settings" element={<AdminLayout><SettingsPage /></AdminLayout>} />
      </Route>

      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
