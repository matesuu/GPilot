type AsciiGlobeLogoProps = {
  className?: string;
  size?: 'small' | 'hero';
};

const LOGOS = {
  small: '(o)-(o)',
  hero: '(o)---(o)',
};

export function AsciiGlobeLogo({ className = '', size = 'small' }: AsciiGlobeLogoProps) {
  return (
    <pre className={`ascii-globe-logo ${className}`} data-size={size} aria-label="gpilot logo">{LOGOS[size]}</pre>
  );
}
