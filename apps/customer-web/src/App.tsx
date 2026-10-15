import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@candi/auth';
import { WholesaleOrderProvider } from './context/WholesaleOrderContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppSplashScreen } from './components/AppSplashScreen';
import '@candi/theme/tokens.css';
import './responsive.css';

import { WelcomePage } from './pages/WelcomePage';
import { PhoneLoginPage } from './pages/PhoneLoginPage';
import { OtpVerifyPage } from './pages/OtpVerifyPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show splash animation on initial app open / load
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);

    // Concept Decision Logic:
    // If person is NOT logged in / new user -> Open login / welcome page
    // If person ALREADY logged in -> Open website / catalog home
    if (!isAuthenticated) {
      if (location.pathname === '/' || location.pathname === '/home') {
        navigate('/welcome');
      }
    } else {
      if (location.pathname === '/' || location.pathname === '/welcome' || location.pathname === '/login') {
        navigate('/home');
      }
    }
  };

  return (
    <>
      {showSplash && (
        <AppSplashScreen
          isAuthenticated={isAuthenticated}
          onAnimationComplete={handleSplashComplete}
          minDurationMs={1800}
        />
      )}

      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<PhoneLoginPage />} />
        <Route path="/verify-otp" element={<OtpVerifyPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/home" element={<CustomerPortalPage defaultTab="catalog" />} />
        <Route path="/catalog" element={<CustomerPortalPage defaultTab="catalog" />} />
        <Route path="/orders" element={<CustomerPortalPage defaultTab="orders" />} />
        <Route path="/khata" element={<CustomerPortalPage defaultTab="khata" />} />
        <Route path="/account/*" element={<CustomerPortalPage defaultTab="addresses" />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <WholesaleOrderProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </WholesaleOrderProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};
