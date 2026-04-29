type AsciiGlobeLogoProps = {
  className?: string;
  size?: 'small' | 'hero';
};

export function AsciiGlobeLogo({ className = '', size = 'small' }: AsciiGlobeLogoProps) {
  return (
    <pre className={`ascii-globe-logo ${className}`} data-size={size} aria-label="gpilot logo">gpilot</pre>
  );
}
