import React, { useEffect, useState } from 'react';
import { Logo } from '@candi/ui';
import { useLanguage } from '../context/LanguageContext';

export interface AppSplashScreenProps {
  isAuthenticated: boolean;
  onAnimationComplete: () => void;
  minDurationMs?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  isAuthenticated,
  onAnimationComplete,
  minDurationMs = 1800,
}) => {
  const { language } = useLanguage();
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Progress bar increment animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 25;
      });
    }, minDurationMs / 4);

    // Complete splash sequence and trigger smooth exit transition
    const exitTimer = setTimeout(() => {
      setIsFadingOut(true);
      const finishTimer = setTimeout(() => {
        onAnimationComplete();
      }, 450); // duration of fade-out animation
      return () => clearTimeout(finishTimer);
    }, minDurationMs);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(exitTimer);
    };
  }, [minDurationMs, onAnimationComplete]);

  return (
    <div
      className={`candi-splash-overlay ${isFadingOut ? 'splash-fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 40%, #1E293B 0%, #0F172A 60%, #4C0519 100%)',
        color: '#FFFFFF',
        overflow: 'hidden',
        pointerEvents: isFadingOut ? 'none' : 'all',
        transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s ease',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      {/* Background Subtle Particle Texture */}
      <div
        className="candi-splash-texture"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage: `radial-gradient(circle, #47484c 1.5px, transparent 1.5px)`,
          backgroundSize: '36px 36px',
          pointerEvents: 'none',
        }}
      />

      {/* Floating Animated Confectionery Accents */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '14%',
          fontSize: '32px',
          opacity: 0.25,
          animation: 'candiFloatSlow 5s ease-in-out infinite',
        }}
      >
        🍫
      </div>
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '16%',
          fontSize: '28px',
          opacity: 0.25,
          animation: 'candiFloatSlow 6s ease-in-out infinite reverse',
        }}
      >
        🍭
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '18%',
          fontSize: '28px',
          opacity: 0.2,
          animation: 'candiFloatSlow 7s ease-in-out infinite 1s',
        }}
      >
        🧇
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '14%',
          right: '15%',
          fontSize: '30px',
          opacity: 0.2,
          animation: 'candiFloatSlow 5.5s ease-in-out infinite 1.5s',
        }}
      >
        🍬
      </div>

      {/* Central Content Box */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: '480px',
        }}
      >
        {/* Animated Glowing Logo Aura */}
        <div
          className="candi-splash-logo-container"
          style={{
            position: 'relative',
            marginBottom: '24px',
            animation: 'candiLogoEntrance 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          {/* Pulsing Backlight Glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(225, 29, 72, 0.45) 0%, rgba(245, 158, 11, 0.2) 60%, transparent 80%)',
              filter: 'blur(16px)',
              animation: 'candiGlowPulse 2.4s ease-in-out infinite alternate',
            }}
          />

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '16px 24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Logo size="lg" variant="confectionery" />
          </div>
        </div>

        {/* Brand Title with Shimmer Sweep */}
        <h1
          className="candi-splash-title"
          style={{
            fontSize: 'clamp(22px, 5vw, 28px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0',
            fontFamily: 'var(--font-family-base, sans-serif)',
            color: '#FFFFFF',
            textShadow: '0 2px 10px rgba(0,0,0,0.4)',
            animation: 'candiFadeInUp 0.7s ease-out 0.2s both',
          }}
        >
          CANDI SUPER STORE
        </h1>

        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#CBD5E1',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            animation: 'candiFadeInUp 0.7s ease-out 0.35s both',
          }}
        >
          {language === 'ur'
            ? 'تھوک کنفیکشنری اور روزمرہ سامان ڈسٹری بیوشن'
            : 'Wholesale Confectionery & FMCG Distribution'}
        </div>

        {/* Dynamic Launch Progress Meter */}
        <div
          style={{
            width: '200px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '14px',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: '#FFFFFF',
              borderRadius: '999px',
              transition: 'width 0.4s ease-out',
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.4)',
            }}
          />
        </div>

        {/* Dynamic Auth Verification State Caption */}
        <div
          style={{
            fontSize: '12px',
            color: '#94A3B8',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'candiFadeInUp 0.7s ease-out 0.5s both',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isAuthenticated ? '#059669' : '#94A3B8',
            }}
          />
          <span>
            {isAuthenticated
              ? language === 'ur'
                ? 'خوش آمدید! آپ کا ہول سیل پورٹل لوڈ ہو رہا ہے...'
                : 'Welcome back! Loading wholesale portal...'
              : language === 'ur'
                ? 'لاگ ان اور ریٹس کی تصدیق کی جا رہی ہے...'
                : 'Preparing wholesale catalog & login...'}
          </span>
        </div>
      </div>

      {/* Touch / Click to Skip Button (Bottom Right) */}
      <button
        type="button"
        onClick={() => {
          setIsFadingOut(true);
          setTimeout(onAnimationComplete, 200);
        }}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          color: '#E2E8F0',
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.04em',
          transition: 'all 0.15s ease',
          zIndex: 10,
        }}
      >
        {language === 'ur' ? 'آگے بڑھیں ←' : 'Skip →'}
      </button>
    </div>
  );
};
