import { Users } from "lucide-react";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";

export default function Footer() {
  return (
    <footer
      id="about"
      className="mt-auto border-t border-outline-variant/20 bg-surface-container-highest py-3xl text-caption"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-xl px-xl md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-md lg:col-span-1">
          <span className="flex items-center gap-sm text-h3 font-bold text-on-surface">
            <Users size={20} aria-hidden="true" />
            CaseNest Academy
          </span>
          <Text size="caption" className="max-w-xs leading-relaxed text-on-surface-variant">
            © 2026 CaseNest Academy. Empowering peer-led education through
            structured collaboration.
          </Text>
        </div>
        <div className="flex flex-col gap-sm lg:col-span-1 lg:col-start-3">
          <Heading as="h4" size="h4" className="mb-xs text-on-surface">
            Platform
          </Heading>
          <a
            href="#"
            className="text-on-surface-variant transition-all hover:underline"
          >
            Resources
          </a>
          <a
            href="#"
            className="text-on-surface-variant transition-all hover:underline"
          >
            FAQ
          </a>
        </div>
        <div className="flex flex-col gap-sm lg:col-span-1">
          <Heading as="h4" size="h4" className="mb-xs text-on-surface">
            Legal &amp; Contact
          </Heading>
          <a
            href="#"
            className="text-on-surface-variant transition-all hover:underline"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-on-surface-variant transition-all hover:underline"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-on-surface-variant transition-all hover:underline"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
