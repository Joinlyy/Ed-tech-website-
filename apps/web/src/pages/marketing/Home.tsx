import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Report from '@/components/Report';
import WhoMarks from '@/components/WhoMarks';
import Stats from '@/components/Stats';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import Reveal from '@/components/Reveal';

export default function Home() {
  return (
    <>
      {/* Hero is above the fold — never revealed, always visible */}
      <Hero />

      <Reveal><HowItWorks /></Reveal>
      <Reveal><Report /></Reveal>
      <Reveal><WhoMarks /></Reveal>
      <Reveal><Stats /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><Pricing /></Reveal>
      <Reveal><FAQ /></Reveal>
      <Reveal><FinalCTA /></Reveal>

      <WhatsAppFloat />
    </>
  );
}
