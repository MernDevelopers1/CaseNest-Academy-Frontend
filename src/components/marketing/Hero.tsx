import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import ToastButton from "/src/components/marketing/ToastButton";

export default function Hero() {
  return (
    <section className="hero-gradient relative flex min-h-[700px] items-center overflow-hidden px-xl py-4xl lg:px-4xl">
      <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-4xl lg:grid-cols-2">
        <div className="flex flex-col gap-xl">
          <div className="inline-flex w-max items-center gap-sm rounded-full bg-secondary-container px-md py-xs text-caption text-on-secondary-container">
            <Sparkles size={16} />
            Introducing the ICE framework integration
          </div>
          <h1 className="text-display leading-tight text-primary">
            Peer-led collaborative learning and teaching
          </h1>
          <p className="max-w-lg text-body text-on-surface-variant">
            Empower your institution with structured case studies, tutor-led
            discussions, and comprehensive learning analytics. Build a
            vibrant community of shared knowledge.
          </p>
          <div className="mt-md flex flex-wrap gap-md">
            <ToastButton size="lg" rightIcon={<ArrowRight size={20} />}>
              Get started
            </ToastButton>
            <ToastButton variant="secondary" size="lg">
              Log in
            </ToastButton>
          </div>
        </div>
        <div className="ambient-shadow glass-card relative h-[400px] overflow-hidden rounded-xl p-sm transition-transform duration-500 hover:rotate-0 lg:h-[500px] lg:-translate-y-4 lg:rotate-1">
          <Image
            alt="Preview of the CaseNest Academy dashboard, showing a world map of student connections and analytics charts"
            className="relative z-10 rounded-lg border border-outline-variant/20 object-cover shadow-sm"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFoNf42MIIY2OjXjf1UN1inRl6jhtekovDcscgGMS_oabl9Fwd2rexR69UnRS6bLEHbMxfFG78XpZeBjH9z0lndsnFNgWKNzSwFSMMTndO4HPoTwcXyqHyOqUdzBss5mMK1EHar07hYWtRFNMZcwm92Pgd9RBhAipZZHB-wwx0ossE5yYbDFMsyK1FAKVkgjxoA2YIoidKoxirmDtXRFUTWK4bpIDyx8jInUlYQ63Nzp338EodGuZk"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        </div>
      </div>
      <div className="absolute right-0 top-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-inverse-primary/20 blur-3xl" />
      <div className="absolute bottom-0 left-10 -z-10 h-[400px] w-[400px] rounded-full bg-secondary-container/20 blur-3xl" />
    </section>
  );
}
