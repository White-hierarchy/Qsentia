import type { Metadata } from 'next';
import Link from 'next/link';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';

export const metadata: Metadata = {
  title: 'Privacy Policy | Qsentia',
  description: 'Privacy Policy for the Qsentia investor intelligence platform.',
};

const updatedAt = 'May 2026';

const sections = [
  {
    title: 'Overview',
    body: (
      <>
        <p>
          QSentia is a research and analytics platform that displays simulated and paper-trading
          investment strategy performance. The platform is intended for educational, research, and
          informational purposes only.
        </p>
        <p>QSentia does not manage customer funds, custody assets, execute trades on behalf of users, or provide brokerage services.</p>
      </>
    ),
  },
  {
    title: 'Information We Collect',
    body: (
      <>
        <p>We may collect limited technical and usage information, including:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Browser type and device information</li>
          <li>IP address and approximate geographic region</li>
          <li>Website usage analytics and interaction data</li>
          <li>Authentication or login-related information if applicable</li>
          <li>Voluntarily submitted contact information</li>
        </ul>
        <p className="mt-2">We do not collect or store brokerage account credentials, banking information, or payment card information on the platform.</p>
      </>
    ),
  },
  {
    title: 'Paper Trading and Simulated Data',
    body: (
      <>
        <p>
          The strategies and portfolio data displayed on QSentia are based on simulated or
          paper-trading environments unless explicitly stated otherwise. No real-money investment
          accounts are managed through the platform.
        </p>
        <p>Performance data shown may include:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Simulated portfolio returns</li>
          <li>Backtested strategy results</li>
          <li>Paper trading results</li>
          <li>Hypothetical allocation models</li>
          <li>AI-generated research outputs</li>
        </ul>
        <p className="mt-2">These results do not represent actual client investment performance.</p>
      </>
    ),
  },
  {
    title: 'Use of Third-Party Services',
    body: (
      <>
        <p>QSentia may integrate with third-party services including:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Interactive Brokers paper trading environments</li>
          <li>Alpaca paper trading APIs</li>
          <li>GitHub</li>
          <li>Vercel</li>
          <li>Cloud hosting providers</li>
          <li>Financial market data providers</li>
        </ul>
        <p className="mt-2">These services maintain their own privacy policies and terms.</p>
      </>
    ),
  },
  {
    title: 'Data Security',
    body: (
      <>
        <p>
          Reasonable efforts are made to secure platform infrastructure and data. However, no
          internet-based system can guarantee absolute security.
        </p>
        <p>Users should not upload sensitive personal, financial, or confidential information to the platform.</p>
      </>
    ),
  },
  {
    title: 'Cookies and Analytics',
    body: (
      <>
        <p>
          The platform may use cookies, analytics tools, and similar technologies to improve
          performance, monitor usage, and enhance the user experience.
        </p>
      </>
    ),
  },
  {
    title: 'No Financial Advice',
    body: (
      <>
        <p>The information displayed on QSentia does not constitute:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Investment advice</li>
          <li>Financial planning advice</li>
          <li>Tax advice</li>
          <li>Legal advice</li>
          <li>Trading recommendations</li>
        </ul>
        <p className="mt-2">Users are solely responsible for their own investment decisions.</p>
      </>
    ),
  },
  {
    title: 'Limitation of Liability',
    body: (
      <>
        <p>QSentia and its operators are not liable for:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Financial losses</li>
          <li>Trading losses</li>
          <li>Data inaccuracies</li>
          <li>Downtime or interruptions</li>
          <li>Reliance on simulated or hypothetical results</li>
        </ul>
        <p className="mt-2">Use of the platform is at the user's own risk.</p>
      </>
    ),
  },
  {
    title: 'Changes to This Policy',
    body: (
      <>
        <p>
          This Privacy Policy may be updated periodically without prior notice. Continued use of the
          platform constitutes acceptance of any updated terms.
        </p>
      </>
    ),
  },
  {
    title: 'Contact',
    body: (
      <>
        <p>
          For questions regarding this Privacy Policy, contact the platform administrator through
          the official QSentia website or repository contact channels.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfbfb] text-[#1a1a2e]">
      <QSentiaMotionBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(75,63,209,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(22,163,74,0.08),transparent_30%)]" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <div className="mb-8 max-w-3xl">
          <div className="inline-flex rounded-full border border-[#d9dcf6] bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f46e5] backdrop-blur-xl shadow-sm">
            Privacy Policy
          </div>
          <h1 className="mt-5 text-[clamp(2.75rem,6vw,4.75rem)] font-light leading-[0.95] tracking-[-0.08em] text-[#1a1a2e]">
            <span className="gradient-text">Privacy Policy</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4a4a72] sm:text-base">
            This Privacy Policy explains how Qsentia collects, uses, discloses, and safeguards personal
            information when you visit our website, request information, or interact with our investor
            intelligence platform.
          </p>
          <div className="mt-4 inline-flex rounded-full border border-[#d9dcf6] bg-white/75 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#6a6a91] backdrop-blur-xl shadow-sm">
            Last updated: {updatedAt}
          </div>
        </div>

        <article className="overflow-hidden rounded-[32px] border border-[#dfe2f7] bg-white/78 shadow-[0_30px_120px_rgba(75,63,209,0.12)] backdrop-blur-2xl">
          <div className="h-1 bg-gradient-to-r from-[#4f46e5] via-[#a5b4fc] to-[#16a34a]" />
          <div className="space-y-10 px-6 py-8 sm:px-8 sm:py-10">
            {sections.map((section, index) => (
              <section key={section.title} className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                  <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#d9dcf6] bg-[#f4f4ff] font-mono text-xs font-semibold text-[#4f46e5]">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#1a1a2e] sm:text-2xl">
                      {section.title}
                    </h2>
                    <div className="space-y-4 text-sm leading-7 text-[#3f3f62] sm:text-[15px]">
                      {section.body}
                    </div>
                  </div>
                </div>
              </section>
            ))}

            <div className="rounded-2xl border border-[#d9dcf6] bg-[#f8f8ff] p-5 text-sm leading-7 text-[#4a4a72]">
              This policy is provided for general informational purposes and may be updated from time to
              time. Continued use of the website after any update constitutes acceptance of the revised
              policy.
            </div>

            <div className="flex justify-end">
              <Link href="/" className="text-sm font-medium text-[#4f46e5] hover:text-[#2f2ab8]">
                Return home
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
