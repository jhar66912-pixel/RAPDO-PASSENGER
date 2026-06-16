import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import Rewards from './pages/Rewards';
import Referral from './pages/Referral';
import CaptainDashboard from './pages/CaptainDashboard';
import PremiumPayment from './pages/PremiumPayment';
import DesignSystem from './pages/DesignSystem';

import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import SafetyCenter from './pages/SafetyCenter';
import TrustGuard from './pages/TrustGuard';
import Contact from './pages/Contact';
import SosEmergency from './pages/SosEmergency';
import AdminDashboard from './pages/AdminDashboard';

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
          <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans relative selection:bg-[#FFC107]/30 selection:text-white pb-20 md:pb-0">
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
                <Route path="/rewards" element={
                  <ProtectedRoute role="customer">
                    <Rewards />
                  </ProtectedRoute>
                } />
                <Route path="/referral" element={
                  <ProtectedRoute role="customer">
                    <Referral />
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
                
                {/* Legal & Trust Pages */}
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/safety" element={<SafetyCenter />} />
                <Route path="/trust" element={<TrustGuard />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/sos" element={<SosEmergency />} />

                <Route path="/captain" element={
                  <ProtectedRoute role="captain">
                    <CaptainDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </APIProvider>
  );
}
