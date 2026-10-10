import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@candi/auth';
import { WholesaleOrderProvider } from './context/WholesaleOrderContext';
import '@candi/theme/tokens.css';
import './responsive.css';

import { WelcomePage } from './pages/WelcomePage';
import { PhoneLoginPage } from './pages/PhoneLoginPage';
import { OtpVerifyPage } from './pages/OtpVerifyPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';


export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WholesaleOrderProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </WholesaleOrderProvider>
    </AuthProvider>
  );
};


