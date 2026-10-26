import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Logo, Alert } from '@candi/ui';
import { useAuth } from '@candi/auth';
import { normalizePakistanPhone } from '@candi/validation';
import { useLanguage } from '../context/LanguageContext';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, customerAccount, signInWithOtp, updateProfile, updateCustomerAccount } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();

  // Auth Card States
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [customerType, setCustomerType] = useState<'retailer' | 'sub_wholesaler'>('retailer');
  
  // Login fields
  const [phone, setPhone] = useState('0300 1111111');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Register fields
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('0300 2222222');
  const [area, setArea] = useState('Karachi');

  // Route guard: if already logged in, redirect based on account status
  useEffect(() => {
    if (isAuthenticated) {
      if (!customerAccount) {
        navigate('/register');
      } else if (customerAccount.status === 'approved') {
        navigate('/home');
      } else {
        navigate('/account/status');
      }
    }
  }, [isAuthenticated, customerAccount, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const norm = normalizePakistanPhone(phone);
    if (!norm.isValid) {
      setAuthError(norm.error || (language === 'ur' ? 'درست پاکستانی موبائل نمبر درج کریں (مثلاً 0300 1234567)' : 'Please enter a valid Pakistani phone number (e.g. 0300 1234567)'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signInWithOtp(norm.normalized);
      setIsSubmitting(false);

      if (res.success) {
        navigate('/verify-otp', {
          state: {
            phone: norm.normalized,
            displayPhone: norm.display,
            customerType,
          },
        });
      } else {
        setAuthError(res.error || (language === 'ur' ? 'کوڈ بھیجنے میں خرابی۔ دوبارہ کوشش کریں۔' : 'Unable to send verification code. Please try again.'));
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setAuthError(err.message || 'Error sending OTP');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!businessName.trim() || !ownerName.trim()) {
      setAuthError(language === 'ur' ? 'برائے مہربانی دکان اور مالک کا نام درج کریں' : 'Please provide shop name and owner name');
      return;
    }

    const norm = normalizePakistanPhone(registerPhone);
    if (!norm.isValid) {
      setAuthError(norm.error || (language === 'ur' ? 'درست موبائل نمبر درج کریں' : 'Please enter a valid phone number'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signInWithOtp(norm.normalized);
      setIsSubmitting(false);

      if (res.success) {
        navigate('/verify-otp', {
          state: {
            phone: norm.normalized,
            displayPhone: norm.display,
            customerType,
            prefill: {
              businessName,
              ownerName,
              area,
            },
          },
        });
      } else {
        setAuthError(res.error || 'Failed to initiate registration.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setAuthError(err.message || 'Registration error');
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: isRTL ? "'Noto Nastaliq Urdu', 'Segoe UI', Tahoma, sans-serif" : 'var(--font-family-base)',
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-border, #E2E8F0)',
          backgroundColor: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Logo size="md" variant="confectionery" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Functional Language Switcher Pill (Matching User Screenshot) */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#F1F5F9',
              borderRadius: '999px',
              padding: '3px',
              border: '1px solid var(--color-border, #CBD5E1)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <button
              onClick={() => setLanguage('en')}
              type="button"
              aria-label="Switch to English"
              style={{
                border: 'none',
                backgroundColor: language === 'en' ? 'var(--color-primary, #1e2023)' : 'transparent',
                color: language === 'en' ? '#FFFFFF' : '#475569',
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.18s ease',
              }}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ur')}
              type="button"
              aria-label="Switch to Urdu"
              style={{
                border: 'none',
                backgroundColor: language === 'ur' ? 'var(--color-primary, #1e2023)' : 'transparent',
                color: language === 'ur' ? '#FFFFFF' : '#475569',
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.18s ease',
              }}
            >
              اردو
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAuthMode('login');
              const authCard = document.getElementById('wholesale-auth-card');
              if (authCard) authCard.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('nav.signIn')}
          </Button>
        </div>
      </header>

      {/* Main 2-Column Responsive Hero */}
      <main
        style={{
          flex: 1,
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
          padding: '36px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Column: Value Proposition & FMCG Distribution Perks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: '#F1F5F9',
                color: 'var(--color-primary, #1e2023)',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                marginBottom: '14px',
                border: '1px solid #E2E8F0',
              }}
            >
              {t('badge.official')}
            </span>

            <h1
              style={{
                fontSize: 'clamp(28px, 4.2vw, 42px)',
                fontWeight: 800,
                color: 'var(--color-text-main, #0F172A)',
                lineHeight: 1.22,
                letterSpacing: '-0.02em',
                margin: '0 0 14px 0',
              }}
            >
              {t('hero.title')}
            </h1>
          </div>

          <p
            style={{
              fontSize: '15.5px',
              color: 'var(--color-text-muted, #64748B)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {t('hero.description')}
          </p>

          {/* Quick Action Button to Browse Catalog */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/home')}
              style={{ minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
            >
              <span>🛍️ {t('hero.browseBtn')}</span>
            </Button>
          </div>

          {/* Benefit Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginTop: '12px',
            }}
          >
            <Card padding="sm" style={{ border: '1px solid var(--color-border, #E2E8F0)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>💰</div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                {t('hero.features.pricing.title')}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
                {t('hero.features.pricing.desc')}
              </div>
            </Card>

            <Card padding="sm" style={{ border: '1px solid var(--color-border, #E2E8F0)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>🚚</div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                {t('hero.features.delivery.title')}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
                {t('hero.features.delivery.desc')}
              </div>
            </Card>

            <Card padding="sm" style={{ border: '1px solid var(--color-border, #E2E8F0)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>📱</div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                {t('hero.features.support.title')}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
                {t('hero.features.support.desc')}
              </div>
            </Card>
          </div>

          {/* Support Escalation */}
          <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted, #64748B)' }}>
            {t('hero.supportText')}{' '}
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--color-primary, #1e2023)', fontWeight: 700, textDecoration: 'none' }}
            >
              {t('hero.whatsappEscalation')}
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Retailer & Wholesaler Auth Portal (Replaces static festival box) */}
        <div id="wholesale-auth-card" style={{ position: 'relative' }}>
          <Card
            padding="lg"
            style={{
              position: 'relative',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--color-border, #E2E8F0)',
              boxShadow: '0 12px 36px rgba(15, 23, 42, 0.09)',
              borderRadius: '16px',
            }}
          >
            {/* Header Badge */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {t('auth.title')}
                </h2>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                  {t('auth.subtitle')}
                </p>
              </div>
              <span
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                  border: '1px solid #BFDBFE',
                }}
              >
                🔒 B2B Only
              </span>
            </div>

            {/* Mode Tabs: Sign In vs Create Account */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                backgroundColor: '#F1F5F9',
                padding: '4px',
                borderRadius: '10px',
                marginBottom: '18px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: authMode === 'login' ? '#FFFFFF' : 'transparent',
                  color: authMode === 'login' ? '#0F172A' : '#64748B',
                  fontWeight: authMode === 'login' ? 800 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: authMode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                🔑 {t('auth.tab.login')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: authMode === 'register' ? '#FFFFFF' : 'transparent',
                  color: authMode === 'register' ? '#0F172A' : '#64748B',
                  fontWeight: authMode === 'register' ? 800 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: authMode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                ✨ {t('auth.tab.register')}
              </button>
            </div>

            {/* Role Switcher: Retailer vs Sub-Wholesaler */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                {language === 'ur' ? 'اپنا کاروباری درجہ منتخب کریں:' : 'Select Your Business Type:'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setCustomerType('retailer')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: customerType === 'retailer' ? '2px solid #1e2023' : '1px solid #CBD5E1',
                    backgroundColor: customerType === 'retailer' ? '#F8FAFC' : '#FFFFFF',
                    textAlign: isRTL ? 'right' : 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 800, color: customerType === 'retailer' ? '#1e2023' : '#1e1f22' }}>
                    {t('auth.role.retailer')}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                    {t('auth.role.retailer.desc')}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerType('sub_wholesaler')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: customerType === 'sub_wholesaler' ? '2px solid #1e2023' : '1px solid #CBD5E1',
                    backgroundColor: customerType === 'sub_wholesaler' ? '#F8FAFC' : '#FFFFFF',
                    textAlign: isRTL ? 'right' : 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 800, color: customerType === 'sub_wholesaler' ? '#1e2023' : '#1e1f22' }}>
                    {t('auth.role.wholesaler')}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                    {t('auth.role.wholesaler.desc')}
                  </div>
                </button>
              </div>
            </div>

            {authError && (
              <div style={{ marginBottom: '14px' }}>
                <Alert type="error">{authError}</Alert>
              </div>
            )}

            {/* TAB 1: SIGN IN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {t('auth.phone.label')}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('auth.phone.placeholder')}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      required
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                    {t('auth.phone.hint')}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  style={{ width: '100%', marginTop: '4px', fontWeight: 800 }}
                >
                  {isSubmitting ? t('auth.login.loading') : t('auth.login.btn')}
                </Button>
              </form>
            )}

            {/* TAB 2: CREATE ACCOUNT FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {t('auth.register.businessName')}
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={t('auth.register.businessPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      {t('auth.register.ownerName')}
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder={t('auth.register.ownerPlaceholder')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      {t('auth.register.area')}
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder={t('auth.register.areaPlaceholder')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {t('auth.phone.label')} (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="0300 1234567"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  style={{ width: '100%', marginTop: '6px', fontWeight: 800 }}
                >
                  {isSubmitting ? t('auth.login.loading') : t('auth.register.btn')}
                </Button>
              </form>
            )}

            {/* Guest Link */}
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/home')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {t('auth.guestLink')}
              </button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
