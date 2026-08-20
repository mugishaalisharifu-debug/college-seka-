import HeroSection from "@/components/marketing/page/hero";
import StatsSection from "@/components/marketing/page/stats";
import MainSection from "@/components/marketing/page/main";
import WhyChooseUs from "@/components/marketing/page/whychoose";
import NewsSection from "@/components/marketing/page/newsSection";
import ReadyToJoinSection from "@/components/marketing/page/readyTo";
export default function Home() {
  return (
    <div>
      <HeroSection/>
      <StatsSection/>
      <MainSection/>
      <WhyChooseUs/>
      <NewsSection/>
      <ReadyToJoinSection/>
    </div>
  );
}
