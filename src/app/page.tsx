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

  return (
    <div className="flex min-h-screen flex-col">
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
