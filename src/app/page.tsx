import { FeatureGrid } from "@/components/home/FeatureGrid";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeatureGrid />
      <FinalCta />
    </>
  );
}
