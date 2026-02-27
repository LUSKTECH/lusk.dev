import type { Metadata } from "next";
import Link from "next/link";
import SEOHead from "@/components/SEOHead";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Privacy Policy | Lusk Technologies",
  description:
    "Learn how Lusk Technologies collects, uses, and protects your personal data.",
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEOHead
        title="Privacy Policy | Lusk Technologies"
        description="Learn how Lusk Technologies collects, uses, and protects your personal data."
        url={`${siteUrl}/privacy`}
      />
      <main>
        <h1>Privacy Policy</h1>
        <p>
          <em>Last updated: [Date]</em>
        </p>
        <p>
          This Privacy Policy describes how Lusk Technologies, Inc.
          (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses,
          and shares your personal information when you visit our website.
        </p>

        <section>
          <h2>Data Collection</h2>
          <p>
            We may collect the following types of information when you use our
            website:
          </p>
          <ul>
            <li>
              Personal information you provide directly (e.g., name, email
              address) when filling out forms or contacting us.
            </li>
            <li>
              Usage data collected automatically, such as IP address, browser
              type, pages visited, and time spent on the site.
            </li>
            <li>
              Cookies and similar tracking technologies, subject to your consent
              preferences.
            </li>
          </ul>
        </section>

        <section>
          <h2>Data Usage</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our website and services.</li>
            <li>
              Respond to your inquiries and communicate with you about our
              products and services.
            </li>
            <li>
              Analyze usage patterns to enhance user experience and site
              performance.
            </li>
            <li>
              Comply with legal obligations and enforce our terms of service.
            </li>
          </ul>
        </section>

        <section>
          <h2>Third-Party Sharing</h2>
          <p>
            We do not sell your personal information. We may share your data with
            third parties in the following circumstances:
          </p>
          <ul>
            <li>
              With service providers who assist us in operating our website and
              conducting our business (e.g., analytics, hosting).
            </li>
            <li>
              When required by law, regulation, or legal process.
            </li>
            <li>
              To protect the rights, property, or safety of Lusk Technologies,
              our users, or the public.
            </li>
          </ul>
        </section>

        <section>
          <h2>User Rights</h2>
          <p>
            Depending on your jurisdiction, you may have the following rights
            regarding your personal data:
          </p>
          <ul>
            <li>
              The right to access, correct, or delete your personal information.
            </li>
            <li>
              The right to restrict or object to the processing of your data.
            </li>
            <li>The right to data portability.</li>
            <li>
              The right to withdraw consent at any time where processing is based
              on consent.
            </li>
            <li>
              The right to opt out of the sale of personal information (for
              California residents under CCPA).
            </li>
          </ul>
        </section>

        <section>
          <h2>Contact Information</h2>
          <p>
            If you have any questions about this Privacy Policy or our data
            practices, please contact us at:
          </p>
          <ul>
            <li>
              Email: <a href="mailto:[email]">[email]</a>
            </li>
            <li>Address: [Company Address]</li>
          </ul>
        </section>

        <hr />
        <p>
          Please also review our{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </main>
    </>
  );
}
