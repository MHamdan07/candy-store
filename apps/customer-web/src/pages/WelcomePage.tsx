import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Logo } from '@candi/ui';
import { useAuth } from '@candi/auth';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, customerAccount } = useAuth();
  const [lang, setLang] = useState<'en' | 'ur'>('en');

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

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-border, #E2E8F0)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Logo size="md" variant="confectionery" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Language Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: '999px',
              padding: '2px',
              border: '1px solid var(--color-border, #E2E8F0)',
            }}
          >
            <button
              onClick={() => setLang('en')}
              type="button"
              style={{
                border: 'none',
                backgroundColor: lang === 'en' ? 'var(--color-primary, #E11D48)' : 'transparent',
                color: lang === 'en' ? '#FFFFFF' : 'var(--color-text-muted, #64748B)',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
            >
              English
            </button>
            <button
              onClick={() => setLang('ur')}
              type="button"
              style={{
                border: 'none',
                backgroundColor: lang === 'ur' ? 'var(--color-primary, #E11D48)' : 'transparent',
                color: lang === 'ur' ? '#FFFFFF' : 'var(--color-text-muted, #64748B)',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
            >
              اردو
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Main 2-Column Hero */}
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '48px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Column: Headline, Description & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: '#FFF1F2',
                color: 'var(--color-primary, #E11D48)',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '14px',
                border: '1px solid rgba(225, 29, 72, 0.2)',
              }}
            >
              ★ OFFICIAL WHOLESALE FMCG DISTRIBUTOR
            </span>

            <h1
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 800,
                color: 'var(--color-text-main, #0F172A)',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                margin: '0 0 12px 0',
              }}
            >
              {lang === 'en'
                ? 'Wholesale Stock for Your Retail Business'
                : 'آپ کے کاروبار کے لیے ہول سیل اسٹاک'}
            </h1>
          </div>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-text-muted, #64748B)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {lang === 'en'
              ? 'Buy confectionery and FMCG products from Candi Super Store. Built for retailers and sub-wholesalers, with direct carton rates, live margin breakdowns, and fast Karachi delivery.'
              : 'کینڈی سپر اسٹور سے کنفیکشنری اور روزمرہ مصنوعات ہول سیل نرخوں پر حاصل کریں۔ دکانداروں اور ہول سیلرز کے لیے خصوصی پلیٹ فارم۔'}
          </p>

          {/* Primary & Secondary Actions */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/home')}
              style={{ minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>🛍️ Browse Wholesale Catalog</span>
              <span>→</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/register')}
              style={{ minWidth: '160px' }}
            >
              Create Account
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/login')}
              style={{ minWidth: '100px' }}
            >
              Sign In
            </Button>
          </div>

          {/* Three Benefit Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            <Card padding="sm" style={{ border: '1px solid var(--color-border, #E2E8F0)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>💰</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>
                Wholesale Pricing
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
                Carton & Box Tiers
              </div>
            </Card>

            <Card padding="sm" style={{ border: '1px solid var(--color-border, #E2E8F0)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🚚</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>
                Business Delivery
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
                COD at Shop Doorstep
              </div>
            </Card>

            <Card padding="sm" style={{ border: '1px solid var(--color-border, #E2E8F0)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>📱</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>
                Team Confirmation
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
                WhatsApp & Phone Support
              </div>
            </Card>
          </div>

          {/* Support action link */}
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginTop: '8px' }}>
            Need ordering or onboarding assistance?{' '}
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--color-primary, #E11D48)', fontWeight: 700, textDecoration: 'none' }}
            >
              WhatsApp Support Escalation →
            </a>
          </div>
        </div>

        {/* Right Column: Wholesale Confectionery Showcase */}
        <div style={{ position: 'relative' }}>
          <Card
            padding="lg"
            style={{
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border, #E2E8F0)',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              borderRadius: '16px',
            }}
          >
            {/* Promo Ticket Banner */}
            <div
              style={{
                backgroundColor: 'var(--color-primary, #E11D48)',
                color: '#FFFFFF',
                padding: '10px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '0.03em' }}>
                🎟️ WHOLESALE FESTIVAL OFFER
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.2)', padding: '3px 8px', borderRadius: '4px' }}>
                UP TO 12% OFF CARTONS
              </div>
            </div>

            {/* Visual Confectionery Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '14px',
                  border: '1px solid var(--color-border, #E2E8F0)',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🍫</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>
                  Choco Dream Truffles
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                  Carton (24 Boxes)
                </div>
                <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 800, color: 'var(--color-primary, #E11D48)' }}>
                  PKR 2,900 / carton
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '14px',
                  border: '1px solid var(--color-border, #E2E8F0)',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧇</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>
                  Crispy Hazelnut Wafers
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                  Carton (36 Packets)
                </div>
                <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 800, color: 'var(--color-primary, #E11D48)' }}>
                  PKR 2,050 / carton
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '14px',
                  border: '1px solid var(--color-border, #E2E8F0)',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🍬</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>
                  Fruity Chewy Candies
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                  Master Carton (100 Pkts)
                </div>
                <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 800, color: 'var(--color-primary, #E11D48)' }}>
                  PKR 1,280 / carton
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '14px',
                  border: '1px solid var(--color-border, #E2E8F0)',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🥛</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>
                  Dairy Rich Sachets
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                  Display Box (50 pcs)
                </div>
                <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 800, color: 'var(--color-primary, #E11D48)' }}>
                  PKR 1,040 / box
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '16px',
                textAlign: 'center',
                fontSize: '11px',
                color: 'var(--color-text-muted, #64748B)',
              }}
            >
              Wholesale pricing unlocked for all registered retail &amp; sub-wholesale partners.
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
