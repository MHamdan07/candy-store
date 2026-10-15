import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, Alert, Logo } from '@candi/ui';
import { useAuth, MOCK_ACCOUNTS } from '@candi/auth';
import { normalizePakistanPhone } from '@candi/validation';

export const LoginPage: React.FC = () => {
  const { signInWithOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('0300 9999999');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('+923009999999');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const norm = normalizePakistanPhone(phone);
    if (!norm.isValid) {
      setError(norm.error || 'Please enter a valid Pakistani phone number');
      return;
    }

    setIsLoading(true);
    setNormalizedPhone(norm.normalized);

    const res = await signInWithOtp(norm.normalized);
    setIsLoading(false);

    if (res.success) {
      setStep('otp');
      setOtp('123456'); // Pre-fill mock OTP for convenience
      setOtpSentNotice(`Verification code sent to ${norm.display}. Demo code is 123456.`);
    } else {
      setError(res.error || 'Failed to send verification code');
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    const res = await verifyOtp(normalizedPhone, otp);
    setIsLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Verification failed');
    }
  };

  const handleQuickLogin = async (phoneToUse: string) => {
    setPhone(phoneToUse);
    const norm = normalizePakistanPhone(phoneToUse);
    setNormalizedPhone(norm.normalized);
    setIsLoading(true);
    const res = await verifyOtp(norm.normalized, '123456');
    setIsLoading(false);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-floral-white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Logo size="lg" variant="dark" />
          <p
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '13px',
              color: 'var(--color-olive-drab)',
              marginTop: '10px',
            }}
          >
            Internal Operations Control Tower & Governance
          </p>
        </div>

        <Card padding="lg" style={{ border: '1.5px solid var(--color-bone)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--color-smoky-black)',
              marginBottom: '6px',
            }}
          >
            {step === 'phone' ? 'Staff Authentication' : 'Verify Verification Code'}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '12px',
              color: 'var(--color-olive-drab)',
              marginBottom: '20px',
            }}
          >
            {step === 'phone'
              ? 'Enter your registered authorized phone number to access the operations dashboard.'
              : `Enter the 6-digit OTP sent to ${normalizedPhone}.`}
          </p>

          {error && (
            <div style={{ marginBottom: '16px' }}>
              <Alert type="danger">{error}</Alert>
            </div>
          )}

          {otpSentNotice && (
            <div style={{ marginBottom: '16px' }}>
              <Alert type="success">{otpSentNotice}</Alert>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Registered Mobile Number"
                prefixText="🇵🇰 +92"
                placeholder="0300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                helperText="Pakistan format: 0300 1234567"
                autoFocus
              />

              <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
                Request Verification Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="6-Digit Verification Code"
                placeholder="123456"
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                helperText="Enter demo OTP: 123456"
                autoFocus
              />

              <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
                Verify & Enter Control Tower
              </Button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-olive-drab)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textAlign: 'center',
                }}
              >
                Change phone number
              </button>
            </form>
          )}

          {/* Quick Demo Staff Logins */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-bone)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-olive-drab)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
              }}
            >
              Demo Staff Roles:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('03009999999')}
                style={{ justifyContent: 'flex-start' }}
              >
                🔑 <strong>Super Admin</strong> (0300 9999999 - Farhan Zaidi)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('03009999901')}
                style={{ justifyContent: 'flex-start' }}
              >
                📋 <strong>Admin Manager</strong> (0300 9999901 - Bilal Ahmed)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('03009999902')}
                style={{ justifyContent: 'flex-start' }}
              >
                📦 <strong>Warehouse Manager</strong> (0300 9999902 - Asim Raza)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('03009999903')}
                style={{ justifyContent: 'flex-start' }}
              >
                🏷️ <strong>Warehouse Staff</strong> (0300 9999903 - Kashif Mehmood)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('03009999904')}
                style={{ justifyContent: 'flex-start' }}
              >
                📱 <strong>Wholesale Sales Agent</strong> (0300 9999904 - Hamza Tariq)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('03009999905')}
                style={{ justifyContent: 'flex-start' }}
              >
                🚚 <strong>Fleet & Logistics Lead</strong> (0300 9999905 - Salman Khan)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('03009999906')}
                style={{ justifyContent: 'flex-start' }}
              >
                🛵 <strong>Delivery Rider</strong> (0300 9999906 - Usman Ghani)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('03009999907')}
                style={{ justifyContent: 'flex-start' }}
              >
                💵 <strong>Accounts & Cashier</strong> (0300 9999907 - Naveed Siddiqui)
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
