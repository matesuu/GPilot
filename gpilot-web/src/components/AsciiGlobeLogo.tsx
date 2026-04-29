import { useEffect, useMemo, useState } from 'react';

type AsciiGlobeLogoProps = {
  className?: string;
  size?: 'small' | 'hero';
};

const SMALL_FRAMES = [
  ` .-.
(o|)
 '-'`,
  ` .-.
(|o)
 '-'`,
  ` .-.
(-o)
 '-'`,
  ` .-.
(o-)
 '-'`,
];

const HERO_FRAMES = [
  `      .-""""-.
   .-'  .--.  '-.
 .'   .' || '.   '.
/   / ==||== \\   \\
|  |----++----|  |
\\   \\ ==||== /   /
 '.  '. || .'  .'
   '-. '--' .-'
      '-..-'`,
  `      .-""""-.
   .-' .----. '-.
 .'  .'  ||  '.  '.
/  / == || == \\  \\
| |---- ++ ----| |
\\  \\ == || == /  /
 '. '.  ||  .' .'
   '-. '----' .-'
      '-..-'`,
  `      .-""""-.
   .-'  .--.  '-.
 .'   .' || '.   '.
/   / ==||== \\   \\
|  |----++----|  |
\\   \\ ==||== /   /
 '.  '. || .'  .'
   '-. '--' .-'
      '-..-'`,
  `      .-""""-.
   .-' .----. '-.
 .'  .'  ||  '.  '.
/  / == || == \\  \\
| | ----++---- | |
\\  \\ == || == /  /
 '. '.  ||  .' .'
   '-. '----' .-'
      '-..-'`,
];

export function AsciiGlobeLogo({ className = '', size = 'small' }: AsciiGlobeLogoProps) {
  const frames = useMemo(() => (size === 'hero' ? HERO_FRAMES : SMALL_FRAMES), [size]);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, size === 'hero' ? 180 : 260);

    return () => window.clearInterval(interval);
  }, [frames.length, size]);

  return (
    <pre className={`ascii-globe-logo ${className}`} aria-label="animated ASCII globe logo">{frames[frameIndex]}</pre>
  );
}
