import Link from "next/link";

export default function PortalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto flex w-full flex-col items-center justify-between gap-lg border-t border-outline-variant bg-surface-container-high px-xl py-xl md:flex-row">
      <div className="text-h4 font-bold text-primary">CaseNest Academy</div>
      <p className="text-center text-caption text-on-surface-variant md:text-left">
        © {year} CaseNest Academy. Empowering peer-led education.
      </p>
      <div className="flex gap-lg text-caption">
        <Link
          href="#"
          className="text-on-surface-variant opacity-80 transition-colors hover:text-primary hover:opacity-100"
        >
          Privacy Policy
        </Link>
        <Link
          href="#"
          className="text-on-surface-variant opacity-80 transition-colors hover:text-primary hover:opacity-100"
        >
          Terms of Service
        </Link>
        <Link
          href="#"
          className="text-on-surface-variant opacity-80 transition-colors hover:text-primary hover:opacity-100"
        >
          Contact Support
        </Link>
      </div>
    </footer>
  );
}
