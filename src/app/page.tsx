import { getLandingPageData } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { PortfolioSection } from "@/components/landing/PortfolioSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { TeamStructureSection } from "@/components/landing/TeamStructureSection";
import { TestimonialsFaqSection } from "@/components/landing/TestimonialsFaqSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [data, currentUser] = await Promise.all([getLandingPageData(), getCurrentUser()]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kodelokal.store";

  const sameAs = [
    data.settings.socialLinks?.instagram,
    data.settings.socialLinks?.github,
    data.settings.socialLinks?.linkedin,
  ].filter(Boolean);

  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#organization`,
        name: data.settings.brandName,
        alternateName: `${data.settings.brandName} — ${data.settings.tagline}`,
        url: siteUrl,
        logo: `${siteUrl}/brand/logo-full-light.png`,
        image: `${siteUrl}/brand/og-kodelokal.png`,
        description: data.settings.heroSubtitle,
        email: data.settings.contactEmail,
        telephone: `+${data.settings.whatsappNumber.replace(/\D/g, "")}`,
        areaServed: "ID",
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: `${data.settings.brandName} — ${data.settings.tagline}`,
        inLanguage: "id-ID",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      ...(data.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${siteUrl}/#faq`,
              mainEntity: data.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />
      <Navbar isLoggedIn={Boolean(currentUser)} />
      <main className="flex-1">
        <HeroSection settings={data.settings} />
        <ServicesSection services={data.services} />
        <WorkflowSection />
        <PortfolioSection portfolios={data.portfolios} />
        <TeamStructureSection members={data.teamMembers} />
        <TestimonialsFaqSection testimonials={data.testimonials} faqs={data.faqs} />
        <ContactSection settings={data.settings} services={data.services} />
      </main>
      <Footer settings={data.settings} />
    </div>
  );
}
