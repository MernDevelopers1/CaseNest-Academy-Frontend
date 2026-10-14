"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Copy,
  Check,
  ArrowLeft,
  Search,
  Eye,
  Trash2,
  Download,
  BookOpen,
  GraduationCap,
  Shield,
} from "lucide-react";
import Heading from "/src/components/ui/Heading";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import IconButton from "/src/components/ui/IconButton";
import Input from "/src/components/ui/Input";
import Select from "/src/components/ui/Select";
import StatusBadge from "/src/components/ui/StatusBadge";
import Avatar from "/src/components/ui/Avatar";
import Modal from "/src/components/ui/Modal";
import ConfirmDialog from "/src/components/ui/ConfirmDialog";
import ThemeToggle from "/src/components/ui/ThemeToggle";
import { useToast } from "/src/components/ui/Toast";

interface ColorToken {
  name: string;
  className: string;
  hexLight: string;
  hexDark?: string;
  textColor: string;
  description: string;
}

const COLOR_GROUPS: { groupName: string; tokens: ColorToken[] }[] = [
  {
    groupName: "Primary Tones (Authority & Brand Core)",
    tokens: [
      {
        name: "Primary",
        className: "bg-primary",
        hexLight: "#2B0957",
        hexDark: "#D6BAFF",
        textColor: "text-on-primary",
        description: "Primary actions, active states, key branding elements.",
      },
      {
        name: "Primary Container",
        className: "bg-primary-container",
        hexLight: "#41246D",
        hexDark: "#4A2F7A",
        textColor: "text-on-primary-container",
        description: "Secondary branded containers, badge backgrounds.",
      },
      {
        name: "On Primary Container",
        className: "bg-on-primary-container",
        hexLight: "#AE8EDF",
        hexDark: "#E9DDFF",
        textColor: "text-primary",
        description: "High-contrast text & icons on primary container.",
      },
      {
        name: "Inverse Primary",
        className: "bg-inverse-primary",
        hexLight: "#D6BAFF",
        hexDark: "#6D509A",
        textColor: "text-primary",
        description: "Inverted contexts, dark mode accents.",
      },
    ],
  },
  {
    groupName: "Secondary Tones (Supportive & Peer Interaction)",
    tokens: [
      {
        name: "Secondary",
        className: "bg-secondary",
        hexLight: "#4355B9",
        hexDark: "#B8C3FF",
        textColor: "text-on-secondary",
        description: "Discussion actions, secondary buttons, tags.",
      },
      {
        name: "Secondary Container",
        className: "bg-secondary-container",
        hexLight: "#8596FF",
        hexDark: "#29348F",
        textColor: "text-on-secondary-container",
        description: "Peer notification panels, active discussion badges.",
      },
      {
        name: "On Secondary Container",
        className: "bg-on-secondary-container",
        hexLight: "#11278E",
        hexDark: "#DDE1FF",
        textColor: "text-secondary",
        description: "Content text on secondary container elements.",
      },
    ],
  },
  {
    groupName: "Tertiary & Warm Tones (Energy & Attention)",
    tokens: [
      {
        name: "Tertiary",
        className: "bg-tertiary",
        hexLight: "#2E1C00",
        hexDark: "#EBBF83",
        textColor: "text-on-tertiary",
        description: "Deep warm contrast accents, special callouts.",
      },
      {
        name: "Tertiary Container",
        className: "bg-tertiary-container",
        hexLight: "#4A2F00",
        hexDark: "#5C3D00",
        textColor: "text-tertiary-fixed",
        description: "Warm container surfaces, resource callouts.",
      },
      {
        name: "Tertiary Fixed",
        className: "bg-tertiary-fixed",
        hexLight: "#FFDDB2",
        textColor: "text-on-tertiary-fixed",
        description: "Constant warm highlight across both themes.",
      },
      {
        name: "Tertiary Fixed Dim",
        className: "bg-tertiary-fixed-dim",
        hexLight: "#EBBF83",
        textColor: "text-tertiary",
        description: "Subtle fixed accent for metrics and tags.",
      },
    ],
  },
  {
    groupName: "Surface Ramp (Elevation & Layering)",
    tokens: [
      {
        name: "Surface Lowest",
        className: "bg-surface-container-lowest",
        hexLight: "#FFFFFF",
        hexDark: "#0F0E0E",
        textColor: "text-on-surface",
        description: "Pure white cards, elevated content bento blocks.",
      },
      {
        name: "Surface Low",
        className: "bg-surface-container-low",
        hexLight: "#F6F3F2",
        hexDark: "#1C1B1B",
        textColor: "text-on-surface",
        description: "Background base panels, table headers.",
      },
      {
        name: "Surface Default",
        className: "bg-surface",
        hexLight: "#FCF9F8",
        hexDark: "#141313",
        textColor: "text-on-surface",
        description: "Standard application canvas, modal backgrounds.",
      },
      {
        name: "Surface Container",
        className: "bg-surface-container",
        hexLight: "#F0EDEC",
        hexDark: "#201F1F",
        textColor: "text-on-surface",
        description: "Muted cards, sidebar rails, disabled controls.",
      },
      {
        name: "Surface High",
        className: "bg-surface-container-high",
        hexLight: "#EBE7E7",
        hexDark: "#2A2929",
        textColor: "text-on-surface",
        description: "Active states, dropdown panels, top bars.",
      },
      {
        name: "Surface Highest",
        className: "bg-surface-container-highest",
        hexLight: "#E5E2E1",
        hexDark: "#353333",
        textColor: "text-on-surface",
        description: "Card dividers, hover states, accent borders.",
      },
    ],
  },
  {
    groupName: "Functional & Status Tones",
    tokens: [
      {
        name: "Success",
        className: "bg-success",
        hexLight: "#2E7D32",
        hexDark: "#81C784",
        textColor: "text-on-success",
        description: "Approved case studies, active cohort indicators.",
      },
      {
        name: "Warning",
        className: "bg-warning",
        hexLight: "#B26A00",
        hexDark: "#EBBF83",
        textColor: "text-on-warning",
        description: "Pending review, action required, deadlines.",
      },
      {
        name: "Error",
        className: "bg-error",
        hexLight: "#BA1A1A",
        hexDark: "#FFB4AB",
        textColor: "text-on-error",
        description: "Rejected submissions, destructive actions, form errors.",
      },
      {
        name: "Outline",
        className: "bg-outline",
        hexLight: "#7B7581",
        hexDark: "#948F99",
        textColor: "text-white",
        description: "Input borders, key focus boundaries.",
      },
      {
        name: "Outline Variant",
        className: "bg-outline-variant",
        hexLight: "#CCC4D1",
        hexDark: "#4A4550",
        textColor: "text-on-surface",
        description: "Subtle table row dividers, card borders.",
      },
    ],
  },
];

const TYPOGRAPHY_SAMPLES = [
  {
    token: "Display",
    cssClass: "text-display font-display",
    specs: "48px / 800 (ExtraBold) • Line height 1.2",
    sample: "Collaborative Learning",
    usage: "Hero headlines, major milestone numbers, landing splash.",
  },
  {
    token: "Heading 1 (h1)",
    cssClass: "text-h1 font-h1",
    specs: "32px / 700 (Bold) • Line height 1.2",
    sample: "Student Cohort Dashboard",
    usage: "Page primary titles, major modal headers.",
  },
  {
    token: "Heading 2 (h2)",
    cssClass: "text-h2 font-h2",
    specs: "24px / 700 (Bold) • Line height 1.3",
    sample: "Case Study Directory & Reviews",
    usage: "Section titles, card group headings.",
  },
  {
    token: "Heading 3 (h3)",
    cssClass: "text-h3 font-h3",
    specs: "20px / 600 (SemiBold) • Line height 1.3",
    sample: "Recent Discussion Activity",
    usage: "Component cards, dialog titles, sidebar category labels.",
  },
  {
    token: "Heading 4 (h4)",
    cssClass: "text-h4 font-h4",
    specs: "18px / 600 (SemiBold) • Line height 1.4",
    sample: "Learning Model: ICE Taxonomy",
    usage: "Sub-headings, list item titles, widget labels.",
  },
  {
    token: "Body",
    cssClass: "text-body font-body",
    specs: "16px / 400 (Regular) • Line height 1.6",
    sample: "Peer review empowers learners to evaluate, challenge, and refine academic arguments.",
    usage: "Standard long-form reading, descriptions, case study briefs.",
  },
  {
    token: "Small",
    cssClass: "text-small font-small",
    specs: "14px / 400 (Regular) • Line height 1.5",
    sample: "Submitted by Eleanor Vance on October 14, 2026 • 15 Comments",
    usage: "Metadata summaries, table body cells, form inputs.",
  },
  {
    token: "Caption",
    cssClass: "text-caption font-caption",
    specs: "12px / 500 (Medium) • Line height 1.4",
    sample: "ACADEMIC SESSION CODE: CS-2026-FALL",
    usage: "Badges, timestamps, input helper captions, micro-labels.",
  },
];

export default function StyleguidePage() {
  const { showToast } = useToast();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Interactive component demo states
  const [demoInput, setDemoInput] = useState("Medical Image Segmentation Analysis");
  const [demoErrorInput, setDemoErrorInput] = useState("invalid@format");
  const [demoSelect, setDemoSelect] = useState("approved");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(label);
    showToast({
      message: `Copied "${text}" to clipboard!`,
      variant: "info",
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface/95 px-lg md:px-2xl backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-md">
          <Link
            href="/"
            className="flex items-center gap-xs text-caption font-semibold text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </Link>
          <span className="text-outline-variant">/</span>
          <div className="flex items-center gap-sm">
            <div className="h-7 w-7 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-caption">
              CN
            </div>
            <span className="text-small font-bold text-on-surface">
              CaseNest Academy Design System
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-lg text-small text-on-surface-variant font-medium">
          <a href="#philosophy" className="hover:text-primary transition-colors">
            Philosophy
          </a>
          <a href="#colors" className="hover:text-primary transition-colors">
            Colors
          </a>
          <a href="#typography" className="hover:text-primary transition-colors">
            Typography
          </a>
          <a href="#spacing" className="hover:text-primary transition-colors">
            Spacing & Depth
          </a>
          <a href="#components" className="hover:text-primary transition-colors">
            Components
          </a>
          <a href="#interactive" className="hover:text-primary transition-colors">
            Playground
          </a>
        </nav>

        <div className="flex items-center gap-sm">
          <ThemeToggle />
          <Link href="/login/student">
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-lg md:px-2xl py-2xl md:py-4xl flex flex-col gap-4xl">
        {/* Hero Section */}
        <header className="flex flex-col gap-md max-w-3xl">
          <div className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-primary/10 text-primary border border-primary/20 w-fit text-caption font-semibold">
            <Sparkles size={14} />
            <span>Kinetic Scholastic Foundation</span>
          </div>
          <Heading as="h1" size="display" className="text-primary dark:text-primary-fixed-dim">
            Design System Documentation
          </Heading>
          <p className="text-body text-on-surface-variant leading-relaxed">
            The comprehensive visual language, design token architecture, and accessible component
            suite powering <strong>CaseNest Academy</strong>. Built to balance academic rigor with
            kinetic peer-learning momentum across Admin, Tutor, and Student portals.
          </p>
        </header>

        {/* 1. Philosophy & Brand Rationale */}
        <section id="philosophy" className="flex flex-col gap-xl scroll-mt-24">
          <div className="border-b border-outline-variant pb-sm">
            <Heading as="h2" size="h2" className="text-on-surface">
              1. Brand & Aesthetic Architecture
            </Heading>
            <p className="text-small text-on-surface-variant mt-xs">
              Core design philosophy sourced from the Kinetic Scholastic guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            <Card className="p-xl flex flex-col gap-md border border-outline-variant hover:border-primary transition-all">
              <div className="p-sm rounded-lg bg-primary/10 text-primary w-fit">
                <GraduationCap size={22} />
              </div>
              <h3 className="text-h4 font-bold text-on-surface">Academic Rigor</h3>
              <p className="text-small text-on-surface-variant leading-normal">
                Deep purple tones (#2B0957) and structured typography establish clarity, credibility,
                and institutional authority.
              </p>
            </Card>

            <Card className="p-xl flex flex-col gap-md border border-outline-variant hover:border-secondary transition-all">
              <div className="p-sm rounded-lg bg-secondary/10 text-secondary w-fit">
                <BookOpen size={22} />
              </div>
              <h3 className="text-h4 font-bold text-on-surface">Kinetic Energy</h3>
              <p className="text-small text-on-surface-variant leading-normal">
                Secondary indigo (#4355B9) and warm accents signal progress, peer momentum, and
                interactive collaboration.
              </p>
            </Card>

            <Card className="p-xl flex flex-col gap-md border border-outline-variant hover:border-outline transition-all">
              <div className="p-sm rounded-lg bg-surface-container text-on-surface w-fit">
                <Layers size={22} />
              </div>
              <h3 className="text-h4 font-bold text-on-surface">Tonal Layering</h3>
              <p className="text-small text-on-surface-variant leading-normal">
                Three elevation tiers (Base, Surface, Elevated) with ambient soft shadows replace
                heavy borders and skeuomorphic drop shadows.
              </p>
            </Card>

            <Card className="p-xl flex flex-col gap-md border border-outline-variant hover:border-primary transition-all">
              <div className="p-sm rounded-lg bg-primary-container/20 text-primary w-fit">
                <Shield size={22} />
              </div>
              <h3 className="text-h4 font-bold text-on-surface">Zero Hex Rule</h3>
              <p className="text-small text-on-surface-variant leading-normal">
                All screens utilize semantic CSS tokens in the Tailwind v4 @theme block, ensuring
                flawless light and dark mode parity.
              </p>
            </Card>
          </div>
        </section>

        {/* 2. Color Palette */}
        <section id="colors" className="flex flex-col gap-xl scroll-mt-24">
          <div className="border-b border-outline-variant pb-sm flex justify-between items-end flex-wrap gap-md">
            <div>
              <Heading as="h2" size="h2" className="text-on-surface">
                2. Design Tokens & Color Palette
              </Heading>
              <p className="text-small text-on-surface-variant mt-xs">
                Click any swatch to copy its utility class or inspect token specifications.
              </p>
            </div>
            <span className="text-caption text-on-surface-variant bg-surface-container px-md py-xs rounded-full border border-outline-variant">
              WCAG AA Compliant
            </span>
          </div>

          <div className="flex flex-col gap-2xl">
            {COLOR_GROUPS.map((group) => (
              <div key={group.groupName} className="flex flex-col gap-md">
                <h3 className="text-h4 font-semibold text-on-surface">{group.groupName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                  {group.tokens.map((token) => (
                    <div
                      key={token.name}
                      onClick={() => copyToClipboard(token.className, token.name)}
                      className="group cursor-pointer rounded-xl border border-outline-variant bg-surface overflow-hidden shadow-xs hover:-translate-y-1 hover:shadow-md transition-all"
                    >
                      <div
                        className={`h-24 w-full ${token.className} p-md flex items-end justify-end`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-surface/90 text-on-surface p-1 rounded-md text-caption flex items-center gap-1 shadow-xs">
                          {copiedToken === token.name ? (
                            <Check size={12} className="text-success" />
                          ) : (
                            <Copy size={12} />
                          )}
                          <span>Copy</span>
                        </span>
                      </div>
                      <div className="p-md flex flex-col gap-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-small font-bold text-on-surface">{token.name}</span>
                          <span className="text-caption font-mono text-on-surface-variant">
                            {token.hexLight}
                          </span>
                        </div>
                        <span className="text-caption font-mono text-primary font-medium">
                          {token.className}
                        </span>
                        <p className="text-caption text-on-surface-variant line-clamp-2 mt-0.5">
                          {token.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Typography */}
        <section id="typography" className="flex flex-col gap-xl scroll-mt-24">
          <div className="border-b border-outline-variant pb-sm">
            <Heading as="h2" size="h2" className="text-on-surface">
              3. Typography Hierarchy
            </Heading>
            <p className="text-small text-on-surface-variant mt-xs">
              <strong>Manrope</strong> geometric typography with tailored line heights and letter
              spacings for digital readability.
            </p>
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-md p-md bg-surface-container border-b border-outline-variant font-caption font-bold text-on-surface-variant">
              <div className="md:col-span-2">TOKEN</div>
              <div className="md:col-span-6">SAMPLE TEXT</div>
              <div className="md:col-span-4 text-left md:text-right">SPECIFICATION & USAGE</div>
            </div>

            <div className="divide-y divide-outline-variant">
              {TYPOGRAPHY_SAMPLES.map((type) => (
                <div
                  key={type.token}
                  className="grid grid-cols-1 md:grid-cols-12 gap-md p-lg items-center hover:bg-surface-container-low transition-colors"
                >
                  <div className="md:col-span-2">
                    <span className="text-small font-bold text-primary font-mono">
                      {type.token}
                    </span>
                    <span className="block text-caption text-on-surface-variant mt-0.5">
                      {type.cssClass.split(" ")[0]}
                    </span>
                  </div>
                  <div className="md:col-span-6 overflow-hidden">
                    <p className={`${type.cssClass} text-on-surface break-words`}>{type.sample}</p>
                  </div>
                  <div className="md:col-span-4 text-left md:text-right">
                    <span className="text-caption font-medium text-on-surface block">
                      {type.specs}
                    </span>
                    <span className="text-caption text-on-surface-variant block mt-0.5">
                      {type.usage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Spacing, Shapes & Elevation */}
        <section id="spacing" className="flex flex-col gap-xl scroll-mt-24">
          <div className="border-b border-outline-variant pb-sm">
            <Heading as="h2" size="h2" className="text-on-surface">
              4. Spacing Scale, Radius & Elevation
            </Heading>
            <p className="text-small text-on-surface-variant mt-xs">
              Harmonic 4pt / 8pt spatial grid and three-tier elevation model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2xl">
            {/* Spacing Steps */}
            <Card className="p-xl flex flex-col gap-lg border border-outline-variant">
              <h3 className="text-h4 font-bold text-on-surface border-b border-outline-variant pb-xs">
                Spacing Tokens
              </h3>
              <div className="flex flex-col gap-sm">
                {[
                  { name: "xs", px: "4px", w: "w-1" },
                  { name: "sm", px: "8px", w: "w-2" },
                  { name: "md", px: "12px", w: "w-3" },
                  { name: "lg", px: "16px", w: "w-4" },
                  { name: "xl", px: "24px", w: "w-6" },
                  { name: "2xl", px: "32px", w: "w-8" },
                  { name: "3xl", px: "48px", w: "w-12" },
                  { name: "4xl", px: "64px", w: "w-16" },
                  { name: "5xl", px: "96px", w: "w-24" },
                ].map((step) => (
                  <div key={step.name} className="flex items-center justify-between text-caption">
                    <span className="font-mono font-semibold text-primary w-12">
                      --{step.name}
                    </span>
                    <div className="flex-1 mx-md bg-surface-container rounded-full h-3 overflow-hidden">
                      <div className={`h-full bg-primary ${step.w}`} />
                    </div>
                    <span className="font-mono text-on-surface-variant w-12 text-right">
                      {step.px}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Corner Radius & Elevation */}
            <Card className="p-xl flex flex-col gap-lg border border-outline-variant">
              <h3 className="text-h4 font-bold text-on-surface border-b border-outline-variant pb-xs">
                Elevation Tiers
              </h3>
              <div className="flex flex-col gap-md">
                <div className="p-lg rounded-lg bg-surface border border-outline-variant flex items-center justify-between">
                  <div>
                    <span className="text-small font-bold text-on-surface block">
                      Level 0: Base Surface
                    </span>
                    <span className="text-caption text-on-surface-variant">
                      Canvas background, border-outline-variant
                    </span>
                  </div>
                  <span className="text-caption font-mono text-on-surface-variant">0px shadow</span>
                </div>

                <div className="p-lg rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-small font-bold text-on-surface block">
                      Level 1: Container
                    </span>
                    <span className="text-caption text-on-surface-variant">
                      Cards, table wrappers, persistent side panels
                    </span>
                  </div>
                  <span className="text-caption font-mono text-on-surface-variant">shadow-xs</span>
                </div>

                <div className="p-lg rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-small font-bold text-on-surface block">
                      Level 2: Elevated
                    </span>
                    <span className="text-caption text-on-surface-variant">
                      Modals, dropdown overlays, floating action bars
                    </span>
                  </div>
                  <span className="text-caption font-mono text-on-surface-variant">shadow-md</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 5. UI Component Library */}
        <section id="components" className="flex flex-col gap-xl scroll-mt-24">
          <div className="border-b border-outline-variant pb-sm">
            <Heading as="h2" size="h2" className="text-on-surface">
              5. Component Library
            </Heading>
            <p className="text-small text-on-surface-variant mt-xs">
              Production-ready primitives implemented with strict accessibility and validation states.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2xl">
            {/* Buttons */}
            <Card className="p-xl flex flex-col gap-lg border border-outline-variant">
              <h3 className="text-h4 font-bold text-on-surface border-b border-outline-variant pb-xs flex items-center justify-between">
                <span>Buttons</span>
                <span className="text-caption text-on-surface-variant font-normal">Button.tsx</span>
              </h3>
              <div className="flex flex-wrap gap-md items-center">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button
                  variant="primary"
                  loading={buttonLoading}
                  onClick={() => {
                    setButtonLoading(true);
                    setTimeout(() => setButtonLoading(false), 2000);
                  }}
                >
                  {buttonLoading ? "Loading..." : "Test Spinner"}
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>

              <div className="flex flex-wrap gap-md items-center pt-md border-t border-outline-variant">
                <Button variant="primary" size="sm">
                  Small (sm)
                </Button>
                <Button variant="primary" size="md">
                  Medium (md)
                </Button>
                <Button variant="primary" size="lg">
                  Large (lg)
                </Button>
              </div>

              <div className="flex items-center gap-sm pt-md border-t border-outline-variant">
                <span className="text-caption text-on-surface-variant mr-sm">IconButtons:</span>
                <IconButton label="Search" variant="primary" icon={<Search size={18} />} />
                <IconButton label="Download" variant="secondary" icon={<Download size={18} />} />
                <IconButton label="Delete" variant="danger" icon={<Trash2 size={18} />} />
              </div>
            </Card>

            {/* Inputs & Form Controls */}
            <Card className="p-xl flex flex-col gap-lg border border-outline-variant">
              <h3 className="text-h4 font-bold text-on-surface border-b border-outline-variant pb-xs flex items-center justify-between">
                <span>Form Inputs & Selects</span>
                <span className="text-caption text-on-surface-variant font-normal">Input.tsx</span>
              </h3>
              <div className="flex flex-col gap-md">
                <Input
                  label="Standard Input"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  helper="Provides descriptive assistance to users."
                />

                <Input
                  label="Validated Error State"
                  value={demoErrorInput}
                  onChange={(e) => setDemoErrorInput(e.target.value)}
                  error="Please enter a valid academic institutional email address."
                />

                <Select
                  label="Status Dropdown"
                  value={demoSelect}
                  onChange={(e) => setDemoSelect(e.target.value)}
                  options={[
                    { value: "approved", label: "Approved for Peer Review" },
                    { value: "pending", label: "Pending Faculty Verification" },
                    { value: "rejected", label: "Revision Requested" },
                  ]}
                />
              </div>
            </Card>

            {/* Status Badges & Chips */}
            <Card className="p-xl flex flex-col gap-lg border border-outline-variant">
              <h3 className="text-h4 font-bold text-on-surface border-b border-outline-variant pb-xs flex items-center justify-between">
                <span>Status Badges & Identifiers</span>
                <span className="text-caption text-on-surface-variant font-normal">StatusBadge.tsx</span>
              </h3>
              <div className="flex flex-col gap-md">
                <div className="flex flex-wrap gap-md items-center">
                  <StatusBadge status="Approved" size="md" />
                  <StatusBadge status="Pending" size="md" />
                  <StatusBadge status="Rejected" size="md" />
                  <StatusBadge status="Active" size="md" />
                  <StatusBadge status="Inactive" size="md" />
                </div>
                <div className="flex flex-wrap gap-md items-center pt-md border-t border-outline-variant">
                  <StatusBadge status="Approved" size="sm" />
                  <StatusBadge status="Pending" size="sm" />
                  <StatusBadge status="Rejected" size="sm" />
                </div>
              </div>
            </Card>

            {/* Avatars */}
            <Card className="p-xl flex flex-col gap-lg border border-outline-variant">
              <h3 className="text-h4 font-bold text-on-surface border-b border-outline-variant pb-xs flex items-center justify-between">
                <span>Avatars</span>
                <span className="text-caption text-on-surface-variant font-normal">Avatar.tsx</span>
              </h3>
              <div className="flex items-center gap-lg">
                <Avatar name="Sarah Jenkins" size="sm" />
                <Avatar name="Dr. Marcus Thorne" size="md" />
                <Avatar name="Elena Rostova" size="lg" />
                <Avatar name="Professor Miller" size="xl" />
              </div>
              <p className="text-caption text-on-surface-variant">
                Automatically calculates initials and maintains high-contrast fallback background.
              </p>
            </Card>
          </div>
        </section>

        {/* 6. Interactive Playground & Dialogs */}
        <section id="interactive" className="flex flex-col gap-xl scroll-mt-24 pb-3xl">
          <div className="border-b border-outline-variant pb-sm">
            <Heading as="h2" size="h2" className="text-on-surface">
              6. Interactive Feedback & Overlays
            </Heading>
            <p className="text-small text-on-surface-variant mt-xs">
              Test dynamic notifications, confirmations, and focus-trapped dialogs live.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {/* Toast Triggers */}
            <Card className="p-xl flex flex-col gap-md border border-outline-variant">
              <h3 className="text-h4 font-bold text-on-surface">Toast Notifications</h3>
              <p className="text-small text-on-surface-variant">
                Auto-dismissing toast notifications with variant border indicators.
              </p>
              <div className="flex flex-col gap-sm mt-xs">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    showToast({
                      message: "Case study submitted successfully for peer review!",
                      variant: "success",
                    })
                  }
                >
                  <CheckCircle2 size={15} className="text-success" />
                  <span>Success Toast</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    showToast({
                      message: "Authentication expired. Please log in again.",
                      variant: "error",
                    })
                  }
                >
                  <XCircle size={15} className="text-error" />
                  <span>Error Toast</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    showToast({
                      message: "System maintenance scheduled for Sunday 02:00 AM.",
                      variant: "warning",
                    })
                  }
                >
                  <AlertTriangle size={15} className="text-warning" />
                  <span>Warning Toast</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    showToast({
                      message: "Your changes have been saved to local draft.",
                      variant: "info",
                    })
                  }
                >
                  <Info size={15} className="text-secondary" />
                  <span>Info Toast</span>
                </Button>
              </div>
            </Card>

            {/* Modal Dialog Demo */}
            <Card className="p-xl flex flex-col gap-md border border-outline-variant justify-between">
              <div>
                <h3 className="text-h4 font-bold text-on-surface">Content Modal</h3>
                <p className="text-small text-on-surface-variant mt-xs">
                  Accessible dialog supporting header, body content, and action footer.
                </p>
              </div>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                <Eye size={16} />
                <span>Open Modal Preview</span>
              </Button>
            </Card>

            {/* Confirmation Dialog Demo */}
            <Card className="p-xl flex flex-col gap-md border border-outline-variant justify-between">
              <div>
                <h3 className="text-h4 font-bold text-on-surface">Destructive Confirm</h3>
                <p className="text-small text-on-surface-variant mt-xs">
                  High-stakes confirmation dialog requiring explicit affirmative intent.
                </p>
              </div>
              <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                <Trash2 size={16} />
                <span>Trigger Confirm</span>
              </Button>
            </Card>
          </div>
        </section>
      </main>

      {/* Interactive Modal Preview */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sample Case Study Modal"
      >
        <div className="flex flex-col gap-md text-small text-on-surface-variant">
          <p>
            This modal illustrates the standard Level 2 elevation dialog in CaseNest Academy. It
            supports backdrop blurring, escape-key dismissal, and high-contrast content presentation.
          </p>
          <div className="p-md rounded-xl bg-surface-container border border-outline-variant">
            <span className="text-caption font-semibold text-on-surface block mb-xs">
              DOCUMENT METADATA
            </span>
            <ul className="text-caption flex flex-col gap-xs">
              <li>• Title: Clinical Diagnosis Workflow Analysis</li>
              <li>• Course Session: CS-2026-FALL</li>
              <li>• Author: Sarah Jenkins (Student ID: #1042)</li>
            </ul>
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                showToast({ message: "Modal action confirmed!", variant: "success" });
              }}
            >
              Confirm Action
            </Button>
          </div>
        </div>
      </Modal>

      {/* Interactive Confirm Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          showToast({
            message: "Demonstration item deleted successfully.",
            variant: "success",
          });
        }}
        title="Delete Case Study Submission?"
        message="Are you sure you want to permanently delete this submission? Attached documents and peer discussion comments will also be permanently purged."
        confirmLabel="Yes, Delete Permanently"
        variant="danger"
      />

      {/* Footer */}
      <footer className="w-full py-xl px-lg md:px-2xl flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-high border-t border-outline-variant mt-auto text-small text-on-surface-variant">
        <div className="flex items-center gap-sm">
          <span className="font-bold text-on-surface">CaseNest Academy</span>
          <span>• Kinetic Scholastic Design System</span>
        </div>
        <p className="text-caption">
          Built with Next.js 16, Tailwind CSS v4, TypeScript & Manrope typography.
        </p>
        <div className="flex items-center gap-md text-caption">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/login/student" className="hover:text-primary transition-colors">
            Student Portal
          </Link>
          <Link href="/login/tutor" className="hover:text-primary transition-colors">
            Tutor Portal
          </Link>
          <Link href="/login/admin" className="hover:text-primary transition-colors">
            Admin Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
