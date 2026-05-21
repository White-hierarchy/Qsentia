'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type LogoTheme = 'dark' | 'light' | 'system';

const DARK_LOGO = '/logo/Qsentia%20Logo%20Bg%20transparent.png';
const LIGHT_LOGO = '/logo/Qsentia%20Logo%20Bg%20transparent%201.png';

function useResolvedTheme(theme: LogoTheme) {
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (theme !== 'system') {
      setResolvedTheme(theme);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    applyTheme();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }

    mediaQuery.addListener(applyTheme);
    return () => mediaQuery.removeListener(applyTheme);
  }, [theme]);

  return resolvedTheme;
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

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}

export default QSentiaLogo;