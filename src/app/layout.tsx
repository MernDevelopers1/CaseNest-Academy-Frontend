import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import ThemeInit from "/src/components/ThemeInit";
import QueryProvider from "/src/components/QueryProvider";
import { ToastProvider } from "/src/components/ui/Toast";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CaseNest Academy",
  description:
    "CaseNest Academy is a peer-led collaborative learning and teaching platform for tutors and students.",
};

// Must match the STORAGE_KEY literal in src/lib/theme.ts — this runs before
// any module loads, so it can't import the constant.
const NO_FLASH_THEME_SCRIPT = `(function () {
  try {
    var key = "casenest-theme";
    var stored = localStorage.getItem(key);
    var pref = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    var resolved = pref === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : pref;
    if (resolved === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ThemeInit />
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
