import type { ReactNode } from "react";
import { Users } from "lucide-react";

export default function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    // min-h-screen (100vh), not min-h-full (a percentage) — this div is a
    // flex item inside a column flex container (<body>) whose own height
    // comes from min-height rather than an explicit height, and percentage
    // heights don't reliably resolve through that chain. 100vh sidesteps
    // it entirely.
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="hero-gradient relative hidden flex-col justify-between overflow-hidden bg-surface-container-low p-4xl md:flex md:w-2/5">
        <div className="flex items-center gap-sm text-h3 font-bold text-primary">
          <Users size={28} aria-hidden="true" />
          CaseNest Academy
        </div>
        {/* Decorative brand tagline, not a document heading — the page's
            real h1 is the login form's own title. */}
        <p className="max-w-sm text-h2 leading-snug text-primary">
          Peer-led collaborative learning and teaching
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background p-xl">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
