import LegalPageShell from './LegalPageShell';

const updatedAt = 'May 26, 2026';

export default function renderDisclaimerContent() {
  return (
    <LegalPageShell
      eyebrow="Disclaimer and Terms"
      title="Disclaimer and Terms of Use"
      subtitle="Please read this disclaimer carefully. It describes the scope of the content on this website, the limitations of liability, and the terms governing your use of Qsentia public-facing materials."
      updatedAt={updatedAt}
      sections={[
        {
          number: '01',
          title: 'No Investment Advice',
          content: (
            <>
              <p>
                The information on this website is provided for informational purposes only and does
                not constitute investment, legal, accounting, tax, or other professional advice. You
                should not rely on any content here as the sole basis for making an investment or
                trading decision.
              </p>
            </>
          ),
        },
        {
          number: '02',
          title: 'No Offer or Solicitation',
          content: (
            <>
              <p>
                Nothing on this site constitutes an offer to sell, a solicitation of an offer to buy,
                or a recommendation with respect to any security, strategy, or investment product.
                Any discussion of performance, models, or frameworks is illustrative only.
              </p>
            </>
          ),
        },
        {
          number: '03',
          title: 'Forward-Looking Statements',
          content: (
            <>
              <p>
                This website may include forward-looking statements, projections, or estimates that
                are subject to assumptions, risks, and uncertainties. Actual results may differ
                materially from those expressed or implied by such statements, and Qsentia undertakes
                no obligation to update them.
              </p>
            </>
          ),
        },
        {
          number: '04',
          title: 'Accuracy and Completeness',
          content: (
            <>
              <p>
                Although we strive to keep information current and accurate, we make no warranty that
                the content is complete, error-free, or suitable for any particular purpose. Metrics,
                charts, and placeholders may change without notice.
              </p>
            </>
          ),
        },
        {
          number: '05',
          title: 'Third-Party Links and Services',
          content: (
            <>
              <p>
                The site may link to third-party websites, services, or resources that are not owned
                or controlled by Qsentia. We are not responsible for the content, policies, or
                practices of third parties and such links do not imply endorsement.
              </p>
            </>
          ),
        },
        {
          number: '06',
          title: 'Limitation of Liability and No Warranty',
          content: (
            <>
              <p>
                To the fullest extent permitted by law, Qsentia disclaims all warranties, express or
                implied, including warranties of merchantability, fitness for a particular purpose,
                non-infringement, and uninterrupted availability.
              </p>
              <p>
                Qsentia shall not be liable for any direct, indirect, incidental, consequential,
                special, or exemplary damages arising out of your access to or use of the website or
                reliance on its content.
              </p>
            </>
          ),
        },
        {
          number: '07',
          title: 'Investment Risk',
          content: (
            <>
              <p>
                Investing involves risk, including the possible loss of principal. Past performance is
                not indicative of future results, and model outputs should be evaluated in the context
                of broader market, operational, and policy risks.
              </p>
            </>
          ),
        },
        {
          number: '08',
          title: 'Governing Law and Use of the Site',
          content: (
            <>
              <p>
                Your use of the site is subject to applicable laws and regulations. If any part of this
                disclaimer is held unenforceable, the remaining provisions will continue in full force
                and effect to the extent permitted by law.
              </p>
            </>
          ),
        },
        {
          number: '09',
          title: 'Contact',
          content: (
            <>
              <p>
                If you have questions regarding this Disclaimer and Terms of Use, contact{' '}
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
          By accessing this site, you acknowledge that you have read and understood this disclaimer
          and agree to use the information responsibly and at your own risk.
        </>
      }
    />
  );
}