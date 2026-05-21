'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

type LogoTheme = 'dark' | 'light' | 'system';

const DARK_LOGO = '/logo/dark.png';
const LIGHT_LOGO = '/logo/light.png';

function useResolvedTheme(theme: LogoTheme) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setMounted(true);

    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    applyTheme();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }

    mediaQuery.addListener(applyTheme);
    return () => mediaQuery.removeListener(applyTheme);
  }, [theme]);

  if (theme !== 'system') return theme;

  if (!mounted) return 'dark';

  return resolvedTheme === 'light' ? 'light' : systemTheme;
}

export function QSentiaLogo({
  theme = 'system',
  alt = 'Qsentia',
  width = 220,
  height = 72,
  className = 'h-auto w-auto object-contain',
  priority = false,
  sizes,
}: {
  theme?: LogoTheme;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const resolvedTheme = useResolvedTheme(theme);
  const src = resolvedTheme === 'light' ? LIGHT_LOGO : DARK_LOGO;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      onLoadingComplete={() => setLoaded(true)}
      className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

export default QSentiaLogo;