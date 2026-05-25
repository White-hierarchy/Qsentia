import type { Metadata } from 'next';
import LegalPageShell from '@/components/LegalPageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy | Qsentia',
  description: 'Privacy Policy for the Qsentia investor intelligence platform.',
};

const updatedAt = 'May 26, 2026';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy Policy"
      title="Privacy Policy"
      subtitle="This Privacy Policy explains how Qsentia collects, uses, discloses, and safeguards personal information when you visit our website, request information, or interact with our investor intelligence platform."
      updatedAt={updatedAt}
      sections={[
        {
          number: '01',
          title: 'Information We Collect',
          content: (
            <>
              <p>
                We may collect information you provide directly to us, including your name, email
                address, company affiliation, and any message you submit through forms or email.
              </p>
              <p>We may also collect information automatically when you use the site:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Device and browser information.</li>
                <li>IP address, approximate location, and referral data.</li>
                <li>Pages viewed, time spent, and interaction data.</li>
                <li>Cookie and analytics information used to maintain site performance.</li>
              </ul>
              <p>
                We may receive limited information from third-party service providers such as
                analytics, hosting, and security tools.
              </p>
            </>
          ),
        },
        {
          number: '02',
          title: 'How We Use Information',
          content: (
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
          number: '03',
          title: 'Legal Basis for Processing',
          content: (
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
          number: '04',
          title: 'Sharing and Disclosure',
          content: (
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
          number: '05',
          title: 'Security and Retention',
          content: (
            <>
              <p>
                We use administrative, technical, and organizational safeguards designed to protect
                information against unauthorized access, loss, or misuse.
              </p>
              <p>
                No method of transmission or storage is completely secure. We retain information for
                as long as necessary to fulfill the purposes described in this policy, satisfy legal
                requirements, resolve disputes, and enforce agreements.
              </p>
            </>
          ),
        },
        {
          number: '06',
          title: 'Your Rights and Choices',
          content: (
            <>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Access, correct, or delete personal information.</li>
                <li>Object to or restrict certain processing activities.</li>
                <li>Withdraw consent where processing is based on consent.</li>
                <li>Request portability of your personal information, where applicable.</li>
              </ul>
              <p>
                To exercise these rights, contact us using the details below. We may need to verify
                your identity before responding to a request.
              </p>
            </>
          ),
        },
        {
          number: '07',
          title: 'Cookies and Tracking',
          content: (
            <>
              <p>
                We may use cookies and similar technologies to support core functionality, remember
                preferences, measure performance, and understand how visitors use the site. You can
                usually control cookies through your browser settings, but some features may not work
                properly if cookies are disabled.
              </p>
            </>
          ),
        },
        {
          number: '08',
          title: 'International Transfers and Children',
          content: (
            <>
              <p>
                Your information may be processed in countries other than your own, which may have
                different data protection laws. Where required, we implement appropriate safeguards
                for such transfers.
              </p>
              <p>
                Our website is not directed to children under the age of 13, and we do not knowingly
                collect personal information from children.
              </p>
            </>
          ),
        },
        {
          number: '09',
          title: 'Contact Us',
          content: (
            <>
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact
                us at{' '}
                <a className="font-semibold text-[#4f46e5] underline decoration-[#4f46e5]/30 underline-offset-4" href="mailto:Lucas.Zarzeczny@qsentia.com">
                  Lucas.Zarzeczny@qsentia.com
                </a>
                .
              </p>
            </>
          ),
        },
      ]}
      footerNote={
        <>
          This policy is provided for general informational purposes and may be updated from time
          to time. Continued use of the website after any update constitutes acceptance of the
          revised policy.
        </>
      }
    />
  );
}