import type { ReactNode } from 'react';
import QSentiaMotionBackground from './QSentiaMotionBackground';

export type LegalSection = {
  number: string;
  title: string;
  content: ReactNode;
};

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  sections: LegalSection[];
  footerNote?: ReactNode;
};

export default function LegalPageShell({
  eyebrow,
  title,
  subtitle,
  updatedAt,
  sections,
  footerNote,
}: LegalPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfbfb] text-[#1a1a2e]">
      <QSentiaMotionBackground />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 py-12 sm:px-6 lg:py-16">
        <div className="mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d9dcf6] bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f46e5] shadow-sm backdrop-blur">
            {eyebrow}
          </div>
          <h1 className="mt-5 font-serif text-4xl font-normal tracking-[-0.03em] text-[#11102a] sm:text-5xl">
            <span className="gradient-text">{title}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4a4a72] sm:text-base">
            {subtitle}
          </p>
          <div className="mt-4 inline-flex rounded-full border border-[#d9dcf6] bg-white/75 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#6a6a91] backdrop-blur">
            Last updated: {updatedAt}
          </div>
        </div>

        <article className="overflow-hidden rounded-[28px] border border-[#dfe2f7] bg-white/78 shadow-[0_30px_120px_rgba(75,63,209,0.12)] backdrop-blur-xl">
          <div className="h-1 bg-gradient-to-r from-[#4f46e5] via-[#6f63eb] to-[#16a34a]" />
          <div className="space-y-10 px-6 py-8 sm:px-8 sm:py-10">
            {sections.map((section) => (
              <section key={section.number} className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                  <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#d9dcf6] bg-[#f4f4ff] font-mono text-xs font-semibold text-[#4f46e5]">
                    {section.number}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#11102a] sm:text-2xl">
                      {section.title}
                    </h2>
                    <div className="space-y-4 text-sm leading-7 text-[#3f3f62] sm:text-[15px]">
                      {section.content}
                    </div>
                  </div>
                </div>
              </section>
            ))}

            {footerNote ? (
              <div className="rounded-2xl border border-[#d9dcf6] bg-[#f8f8ff] p-5 text-sm leading-7 text-[#4a4a72]">
                {footerNote}
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  );
}