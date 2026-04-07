export const dynamic = 'force-dynamic';
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  AuctionSection,
  CommunityMarketSection,
  ClassNewsSection,
  TestimonialsSection,
  StatsSection,
  CtaSection,
  Footer,
} from '@/components/landing';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <AuctionSection />
        <CommunityMarketSection />
        <ClassNewsSection />
        <TestimonialsSection />
        <StatsSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
