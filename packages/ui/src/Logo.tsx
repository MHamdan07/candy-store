import React from 'react';

export interface LogoProps {
  variant?: 'dark' | 'light' | 'confectionery';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
}) => {
  const isLight = variant === 'light';
  const isConfectionery = variant === 'confectionery';

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { iconSize: 26, fontSize: '15px', subFontSize: '10px' };
      case 'lg':
        return { iconSize: 42, fontSize: '24px', subFontSize: '12px' };
      case 'md':
      default:
        return { iconSize: 32, fontSize: '18px', subFontSize: '11px' };
    }
  };

  const config = getSizeConfig();

  const getEmblemBg = () => {
    if (isConfectionery) return 'var(--color-primary, #1e2023)';
    if (isLight) return '#FFFFFF';
    return 'var(--color-smoky-black, #1e1f22)';
  };

  const getInnerFill = () => {
    if (isConfectionery) return '#1e2023';
    if (isLight) return '#FFFFFF';
    return '#1e1f22';
  };

  const getCircleFill = () => {
    if (isLight) return 'var(--color-smoky-black)';
    return '#FFFFFF';
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}>
      {/* Emblem SVG */}
      <svg
        width={config.iconSize}
        height={config.iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="40"
          height="40"
          rx="10"
          fill={getEmblemBg()}
        />
        {/* Stylized Candy / Wholesale Box Emblem */}
        <circle cx="20" cy="20" r="10" fill={getCircleFill()} />
        <path
          d="M14 20C14 16.6863 16.6863 14 20 14C23.3137 14 26 16.6863 26 20C26 23.3137 23.3137 26 20 26C16.6863 26 14 23.3137 14 20Z"
          fill={getInnerFill()}
        />
        <circle cx="20" cy="20" r="4" fill={getCircleFill()} />
        <path d="M10 20L14 17V23L10 20Z" fill={getCircleFill()} />
        <path d="M30 20L26 17V23L30 20Z" fill={getCircleFill()} />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: config.fontSize,
            fontWeight: 800,
            lineHeight: 1.1,
            color: isLight ? '#FFFFFF' : 'var(--color-text)',
            letterSpacing: '-0.02em',
          }}
        >
          CANDI<span style={{ color: 'var(--color-promo-crimson)', marginLeft: '3px' }}>•</span>
        </span>
        {showSubtitle && (
          <span
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: config.subFontSize,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: isLight ? 'rgba(255, 255, 255, 0.75)' : 'var(--color-text-muted)',
            }}
          >
            Super Store Wholesale
          </span>
        )}
      </div>
    </div>
  );
};
