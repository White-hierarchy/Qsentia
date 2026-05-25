import type { Metadata } from 'next';
import Link from 'next/link';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';

export const metadata: Metadata = {
  title: 'Privacy Policy | Qsentia',
  description: 'Privacy Policy for the Qsentia investor intelligence platform.',
};

const updatedAt = 'May 26, 2026';

const sections = [
  {
    title: 'Information We Collect',
    body: (
      <>
        <p>
          We may collect information you provide directly to us, including your name, email address,
          company affiliation, and any message you submit through forms or email.
        </p>
        <p>We may also collect information automatically when you use the site:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Device and browser information.</li>
          <li>IP address, approximate location, and referral data.</li>
          <li>Pages viewed, time spent, and interaction data.</li>
          <li>Cookie and analytics information used to maintain site performance.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'How We Use Information',
    body: (
      <>
        <p>We use collected information to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Operate, secure, and improve the website and related services.</li>
          <li>Respond to inquiries and provide requested investor information.</li>
          <li>Analyze traffic, usage patterns, and system performance.</li>
          <li>Maintain compliance, detect misuse, and protect against fraud.</li>
          <li>Communicate relevant updates, if you have opted in to receive them.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Legal Basis for Processing',
    body: (
      <>
        <p>Where applicable, we process personal information on the following bases:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Your consent, where required.</li>
          <li>Our legitimate interests in operating and improving the platform.</li>
          <li>Performance of a contract or pre-contractual request.</li>
          <li>Compliance with legal obligations and regulatory requirements.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Sharing and Disclosure',
    body: (
      <>
        <p>We do not sell personal information. We may share limited data with:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Service providers that help us host, secure, and analyze the site.</li>
          <li>Professional advisers, auditors, or legal counsel when necessary.</li>
          <li>Authorities or third parties when required by law or to protect rights.</li>
          <li>Counterparties in connection with a corporate transaction, if applicable.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Security and Retention',
    body: (
      <>
        <p>
          We use administrative, technical, and organizational safeguards designed to protect
          information against unauthorized access, loss, or misuse.
        </p>
        <p>
          No method of transmission or storage is completely secure. We retain information for as long
          as necessary to fulfill the purposes described in this policy, satisfy legal requirements,
          resolve disputes, and enforce agreements.
        </p>
      </>
    ),
  },
  {
    title: 'Your Rights and Choices',
    body: (
      <>
        <p>Depending on your location, you may have the right to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Access, correct, or delete personal information.</li>
          <li>Object to or restrict certain processing activities.</li>
          <li>Withdraw consent where processing is based on consent.</li>
          <li>Request portability of your personal information, where applicable.</li>
        </ul>
        <p>
          To exercise these rights, contact us using the details below. We may need to verify your
          identity before responding to a request.
        </p>
      </>
    ),
  },
  {
    title: 'Cookies and Tracking',
    body: (
      <>
        <p>
          We may use cookies and similar technologies to support core functionality, remember
          preferences, measure performance, and understand how visitors use the site. You can usually
          control cookies through your browser settings, but some features may not work properly if
          cookies are disabled.
        </p>
      </>
    ),
  },
  {
    title: 'International Transfers and Children',
    body: (
      <>
        <p>
          Your information may be processed in countries other than your own, which may have different
          data protection laws. Where required, we implement appropriate safeguards for such transfers.
        </p>
        <p>
          Our website is not directed to children under the age of 13, and we do not knowingly collect
          personal information from children.
        </p>
      </>
    ),
  },
  {
    title: 'Contact Us',
    body: (
      <>
        <p>
          If you have questions about this Privacy Policy or our data practices, please contact us at{' '}
          <a
            className="font-semibold text-[#a5b4fc] underline decoration-[#a5b4fc]/30 underline-offset-4"
            href="mailto:Lucas.Zarzeczny@qsentia.com"
          >
            Lucas.Zarzeczny@qsentia.com
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0e0c1e] text-white">
      <QSentiaMotionBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(165,180,252,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(75,63,209,0.2),transparent_30%)]" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <div className="mb-8 max-w-3xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a5b4fc] backdrop-blur-xl">
            Privacy Policy
          </div>
          <h1 className="mt-5 text-[clamp(2.75rem,6vw,4.75rem)] font-light leading-[0.95] tracking-[-0.08em] text-white">
            <span className="gradient-text">Privacy Policy</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#c4c4e8] sm:text-base">
            This Privacy Policy explains how Qsentia collects, uses, discloses, and safeguards personal
            information when you visit our website, request information, or interact with our investor
            intelligence platform.
          </p>
          <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#c4c4e8] backdrop-blur-xl">
            Last updated: {updatedAt}
          </div>
        </div>

        <article className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(75,63,209,0.18)] backdrop-blur-2xl">
          <div className="h-1 bg-gradient-to-r from-[#4f46e5] via-[#a5b4fc] to-[#16a34a]" />
          <div className="space-y-10 px-6 py-8 sm:px-8 sm:py-10">
            {sections.map((section, index) => (
              <section key={section.title} className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                  <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-mono text-xs font-semibold text-[#a5b4fc]">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
                      {section.title}
                    </h2>
                    <div className="space-y-4 text-sm leading-7 text-[#c4c4e8] sm:text-[15px]">
                      {section.body}
                    </div>
                  </div>
                </div>
              </section>
            ))}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-[#c4c4e8]">
              This policy is provided for general informational purposes and may be updated from time to
              time. Continued use of the website after any update constitutes acceptance of the revised
              policy.
            </div>

            <div className="flex justify-end">
              <Link href="/" className="text-sm font-medium text-[#a5b4fc] hover:text-white">
                Return home
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
