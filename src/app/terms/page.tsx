import type { Metadata } from "next";
import Link from "next/link";
import SEOHead from "@/components/SEOHead";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Terms of Service | Lusk Technologies",
  description:
    "Review the terms and conditions for using the Lusk Technologies website.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      <SEOHead
        title="Terms of Service | Lusk Technologies"
        description="Review the terms and conditions for using the Lusk Technologies website."
        url={`${siteUrl}/terms`}
      />
      <main>
        <h1>Terms of Service</h1>
        <p>
          <em>Last updated: [Date]</em>
        </p>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of the Lusk
          Technologies, Inc. (&quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;) website. By accessing or using our website, you agree
          to be bound by these Terms.
        </p>

        <section>
          <h2>Acceptable Use</h2>
          <p>
            You agree to use our website only for lawful purposes and in
            accordance with these Terms. You agree not to:
          </p>
          <ul>
            <li>
              Use the website in any way that violates applicable local, state,
              national, or international law or regulation.
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the website, its
              servers, or any connected systems.
            </li>
            <li>
              Interfere with or disrupt the integrity or performance of the
              website or its related systems.
            </li>
            <li>
              Transmit any material that is defamatory, obscene, or otherwise
              objectionable.
            </li>
          </ul>
        </section>

        <section>
          <h2>Intellectual Property</h2>
          <p>
            All content, features, and functionality on this website, including
            but not limited to text, graphics, logos, icons, images, and
            software, are the exclusive property of Lusk Technologies, Inc. or
            its licensors and are protected by copyright, trademark, and other
            intellectual property laws.
          </p>
          <p>
            You may not reproduce, distribute, modify, create derivative works
            of, publicly display, or otherwise exploit any content from this
            website without our prior written consent.
          </p>
        </section>

        <section>
          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by applicable law, Lusk
            Technologies, Inc. shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, including but not
            limited to loss of profits, data, or goodwill, arising out of or in
            connection with your use of the website.
          </p>
          <p>
            The website and its content are provided on an &quot;as is&quot; and
            &quot;as available&quot; basis without warranties of any kind, either
            express or implied.
          </p>
        </section>

        <section>
          <h2>Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the
            laws of [State/Jurisdiction], without regard to its conflict of law
            provisions. Any disputes arising under these Terms shall be subject
            to the exclusive jurisdiction of the courts located in
            [State/Jurisdiction].
          </p>
        </section>

        <section>
          <h2>Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please
            contact us at:
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
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </main>
    </>
  );
}
