import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Booking from './pages/Booking';
import { AuthProvider, useAuth } from './lib/auth';
import { APIProvider } from './components/SmartMapView';

import Profile from './pages/Profile';

import Parcel from './pages/Parcel';
import Activity from './pages/Activity';
import Wallet from './pages/Wallet';
import Pricing from './pages/Pricing';
import AiHelp from './pages/AiHelp';
import CaptainDashboard from './pages/CaptainDashboard';
import PremiumPayment from './pages/PremiumPayment';
import DesignSystem from './pages/DesignSystem';

function ProtectedRoute({ children, role }: { children: ReactNode; role: string }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <>{children}</>;
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== role && currentUser.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  // @ts-ignore
  const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || import.meta.env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';

  return (
    <APIProvider apiKey={apiKey} version="weekly">
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans relative selection:bg-[#FFD000]/30 selection:text-white pb-20 md:pb-0">
             <div className="fixed inset-0 pointer-events-none z-[-1] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>
            <Navbar />
            <main className="flex-grow flex flex-col relative z-0 md:pt-28 pt-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/book" element={
                  <ProtectedRoute role="customer">
                    <Booking />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute role="customer">
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/parcel" element={
                  <ProtectedRoute role="customer">
                    <Parcel />
                  </ProtectedRoute>
                } />
                <Route path="/activity" element={
                  <ProtectedRoute role="customer">
                    <Activity />
                  </ProtectedRoute>
                } />
                <Route path="/wallet" element={
                  <ProtectedRoute role="customer">
                    <Wallet />
                  </ProtectedRoute>
                } />
                <Route path="/ai-help" element={
                  <ProtectedRoute role="customer">
                    <AiHelp />
                  </ProtectedRoute>
                } />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/premium-checkout" element={<PremiumPayment />} />
                <Route path="/design-system" element={<DesignSystem />} />
                <Route path="/captain" element={
                  <ProtectedRoute role="captain">
                    <CaptainDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </APIProvider>
  );
}
