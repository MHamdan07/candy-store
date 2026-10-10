import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Alert, Logo } from '@candi/ui';
import { useAuth } from '@candi/auth';
import { normalizePakistanPhone } from '@candi/validation';

export const PhoneLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithOtp } = useAuth();

  const [phone, setPhone] = useState('0300 1111111');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const norm = normalizePakistanPhone(phone);
    if (!norm.isValid) {
      setError(norm.error || 'Please enter a valid Pakistani phone number (e.g. 0300 1234567)');
      return;
    }

    setIsLoading(true);
    const res = await signInWithOtp(norm.normalized);
    setIsLoading(false);

    if (res.success) {
      navigate('/verify-otp', {
        state: {
          phone: norm.normalized,
          displayPhone: norm.display,
        },
      });
    } else {
      setError(res.error || 'Unable to send verification code. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Logo size="lg" variant="confectionery" />
        </div>

        <Card padding="lg" style={{ border: '1px solid var(--color-border, #E2E8F0)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--color-smoky-black)',
              marginBottom: '6px',
            }}
          >
            Login to Candi Super Store
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '13px',
              color: 'var(--color-olive-drab)',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}
          >
            Enter your registered phone number to receive a verification code.
          </p>

          {error && (
            <div style={{ marginBottom: '16px' }}>
              <Alert type="danger">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Registered Mobile Number"
              prefixText="🇵🇰 +92"
              placeholder="0300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              helperText="Local Pakistan format: 0300 1234567"
              autoFocus
            />

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
              Send OTP →
            </Button>

            <Button type="button" variant="ghost" onClick={() => navigate('/welcome')}>
              ← Back to Welcome
            </Button>
          </form>

          {/* Quick Demo Accounts */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-bone)',
              fontSize: '11px',
              color: 'var(--color-olive-drab)',
            }}
          >
            <div style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
              Demo Customer Accounts:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setPhone('0300 1111111')}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: 'var(--color-smoky-black)',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  textDecoration: 'underline',
                }}
              >
                • 0300 1111111 (Approved Retailer - Bilal Store)
              </button>
              <button
                type="button"
                onClick={() => setPhone('0300 2222222')}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: 'var(--color-smoky-black)',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  textDecoration: 'underline',
                }}
              >
                • 0300 2222222 (Pending Review Sub-wholesaler)
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--color-olive-drab)',
            }}
          >
            Need help?{' '}
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--color-smoky-black)', fontWeight: 700, textDecoration: 'underline' }}
            >
              Contact Candi Super Store.
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};
