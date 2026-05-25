import Link from 'next/link';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';

const updatedAt = 'May 26, 2026';

const sections = [
  {
    title: 'No Investment Advice',
    body: (
      <>
        <p>
          The information on this website is provided for informational purposes only and does not
          constitute investment, legal, accounting, tax, or other professional advice. You should not
          rely on any content here as the sole basis for making an investment or trading decision.
        </p>
      </>
    ),
  },
  {
    title: 'No Offer or Solicitation',
    body: (
      <>
        <p>
          Nothing on this site constitutes an offer to sell, a solicitation of an offer to buy, or a
          recommendation with respect to any security, strategy, or investment product. Any discussion
          of performance, models, or frameworks is illustrative only.
        </p>
      </>
    ),
  },
  {
    title: 'Forward-Looking Statements',
    body: (
      <>
        <p>
          This website may include forward-looking statements, projections, or estimates that are
          subject to assumptions, risks, and uncertainties. Actual results may differ materially from
          those expressed or implied by such statements, and Qsentia undertakes no obligation to
          update them.
        </p>
      </>
    ),
  },
  {
    title: 'Accuracy and Completeness',
    body: (
      <>
        <p>
          Although we strive to keep information current and accurate, we make no warranty that the
          content is complete, error-free, or suitable for any particular purpose. Metrics, charts, and
          placeholders may change without notice.
        </p>
      </>
    ),
  },
  {
    title: 'Third-Party Links and Services',
    body: (
      <>
        <p>
          The site may link to third-party websites, services, or resources that are not owned or
          controlled by Qsentia. We are not responsible for the content, policies, or practices of
          third parties and such links do not imply endorsement.
        </p>
      </>
    ),
  },
  {
    title: 'Limitation of Liability and No Warranty',
    body: (
      <>
        <p>
          To the fullest extent permitted by law, Qsentia disclaims all warranties, express or implied,
          including warranties of merchantability, fitness for a particular purpose, non-infringement,
          and uninterrupted availability.
        </p>
        <p>
          Qsentia shall not be liable for any direct, indirect, incidental, consequential, special, or
          exemplary damages arising out of your access to or use of the website or reliance on its
          content.
        </p>
      </>
    ),
  },
  {
    title: 'Investment Risk',
    body: (
      <>
        <p>
          Investing involves risk, including the possible loss of principal. Past performance is not
          indicative of future results, and model outputs should be evaluated in the context of broader
          market, operational, and policy risks.
        </p>
      </>
    ),
  },
  {
    title: 'Governing Law and Use of the Site',
    body: (
      <>
        <p>
          Your use of the site is subject to applicable laws and regulations. If any part of this
          disclaimer is held unenforceable, the remaining provisions will continue in full force and
          effect to the extent permitted by law.
        </p>
      </>
    ),
  },
  {
    title: 'Contact',
    body: (
      <>
        <p>
          If you have questions regarding this Disclaimer and Terms of Use, contact{' '}
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

export default function DisclaimerPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfbfb] text-[#1a1a2e]">
      <QSentiaMotionBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(75,63,209,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(22,163,74,0.08),transparent_30%)]" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <div className="mb-8 max-w-3xl">
          <div className="inline-flex rounded-full border border-[#d9dcf6] bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f46e5] backdrop-blur-xl shadow-sm">
            Disclaimer and Terms
          </div>
          <h1 className="mt-5 text-[clamp(2.75rem,6vw,4.75rem)] font-light leading-[0.95] tracking-[-0.08em] text-[#1a1a2e]">
            <span className="gradient-text">Disclaimer and Terms of Use</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4a4a72] sm:text-base">
            Please read this disclaimer carefully. It describes the scope of the content on this
            website, the limitations of liability, and the terms governing your use of Qsentia public
            facing materials.
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
              By accessing this site, you acknowledge that you have read and understood this disclaimer
              and agree to use the information responsibly and at your own risk.
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