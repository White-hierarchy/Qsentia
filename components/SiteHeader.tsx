'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Disclaimer', href: '/disclaimer' },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeMap = useMemo(
    () => navItems.map((item) => ({ ...item, active: isActivePath(pathname, item.href) })),
    [pathname]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9dcf6]/80 bg-white/65 backdrop-blur-xl supports-[backdrop-filter]:bg-white/55 shadow-[0_10px_40px_rgba(75,63,209,0.08)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo/qsentia-primary.png"
            alt="Qsentia"
            width={200}
            height={60}
            className="h-8 w-auto sm:h-9"
            priority
          />
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.28em] text-[#75759a] sm:inline">
            Investor Intelligence
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {activeMap.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                item.active
                  ? 'bg-[#4f46e5]/10 text-[#3f36c9] shadow-[0_0_0_1px_rgba(79,70,229,0.18)]'
                  : 'text-[#4a4a72] hover:bg-white/80 hover:text-[#2c2c52]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-full border border-[#d9dcf6] bg-white/80 p-2 text-[#4a4a72] transition hover:border-[#4f46e5]/40 hover:text-[#3f36c9] md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#e0e3f7] bg-white/90 px-5 py-4 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {activeMap.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-3 text-sm transition ${
                  item.active
                    ? 'bg-[#4f46e5]/10 text-[#3f36c9]'
                    : 'text-[#4a4a72] hover:bg-white hover:text-[#2c2c52]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}