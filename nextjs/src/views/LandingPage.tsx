import HeroSection from '../components/landing/HeroSection'
import StatsSection from '../components/landing/StatsSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import CheckinSection from '../components/landing/CheckinSection'
import ReflectionSection from '../components/landing/ReflectionSection'
import JournalSection from '../components/landing/JournalSection'
import ClosingCTASection from '../components/landing/ClosingCTASection'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CheckinSection />
      <ReflectionSection />
      <JournalSection />
      <ClosingCTASection />
    </>
  )
}