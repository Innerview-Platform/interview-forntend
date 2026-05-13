import { FeatureGrid } from "@/components/home/FeatureGrid";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16 md:gap-20 md:pb-24 lg:gap-24 lg:pb-28">
      <Hero />
      <TrustBar />
      <FeatureGrid />
      <FinalCta />
    </div>
  );
}
