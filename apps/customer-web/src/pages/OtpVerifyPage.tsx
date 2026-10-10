import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Logo } from '@candi/ui';
import { useAuth } from '@candi/auth';

export const OtpVerifyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, signInWithOtp } = useAuth();

  const phone = (location.state as { phone?: string })?.phone || '+923001111111';
  const displayPhone = (location.state as { displayPhone?: string })?.displayPhone || phone;

  const [digits, setDigits] = useState<string[]>(['1', '2', '3', '4', '5', '6']); // Pre-fill mock OTP
  const [countdown, setCountdown] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    // Handle paste of complete 6 digits
    if (val.length > 1) {
      const pasted = val.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }

    newDigits[index] = val;
    setDigits(newDigits);

    // Auto focus next
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const token = digits.join('');
    if (token.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    const res = await verifyOtp(phone, token);
    setIsLoading(false);

    if (res.success) {
      navigate(res.nextRoute || '/home');
    } else {
      setError(res.error || 'Invalid verification code. Please check and try again.');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError(null);
    setResendNotice('New verification code sent! (Mock OTP: 123456)');
    setCountdown(60);
    await signInWithOtp(phone);
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
            Verify Your Phone
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
            Enter the 6-digit verification code sent to <strong>{displayPhone}</strong>.
          </p>

          {error && (
            <div style={{ marginBottom: '16px' }}>
              <Alert type="danger">{error}</Alert>
            </div>
          )}

          {resendNotice && (
            <div style={{ marginBottom: '16px' }}>
              <Alert type="success">{resendNotice}</Alert>
            </div>
          )}

          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 6 Digit Input Group */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  style={{
                    width: '46px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-family-mono)',
                    border: '1.5px solid var(--color-bone)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-smoky-black)',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-olive-drab)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-bone)')}
                />
              ))}
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
              Verify & Continue →
            </Button>

            {/* Resend Action & Countdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-olive-drab)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'inherit',
                }}
              >
                Change phone number
              </button>

              {countdown > 0 ? (
                <span style={{ color: 'var(--color-olive-drab)' }}>Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-promo-crimson)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontFamily: 'inherit',
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>

          <div
            style={{
              marginTop: '20px',
              padding: '10px 12px',
              backgroundColor: 'var(--color-surface-muted)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              color: 'var(--color-olive-drab)',
              textAlign: 'center',
            }}
          >
            Demo Environment Note: Use OTP <strong>123456</strong> for instant testing.
          </div>
        </Card>
      </div>
    </div>
  );
};
