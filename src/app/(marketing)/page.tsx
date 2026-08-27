import {
  Sparkles,
  ArrowRight,
  FileText,
  UploadCloud,
  MessageSquare,
  FolderOpen,
  BarChart3,
  Handshake,
  Lightbulb,
  Layers,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  UserCheck,
  Users,
} from "lucide-react";
import Nav from "/src/components/marketing/Nav";
import ToastButton from "/src/components/marketing/ToastButton";
import Card from "/src/components/ui/Card";

const LEARNING_MODELS = [
  {
    icon: Handshake,
    title: "Collaborative Model",
    blurb:
      "Peer-to-peer learning where students and tutors work together to build shared understanding, rather than following one-directional instruction.",
  },
  {
    icon: Lightbulb,
    title: "ICE Model",
    blurb:
      "A thinking-routine framework — Ideas, Connections, Extensions — for structuring how a case study or discussion progresses: starting from an idea, connecting it to what's already known, then extending it further.",
  },
  {
    icon: Layers,
    title: "Learning Pyramid",
    blurb:
      "A commonly referenced model suggesting that active, collaborative methods — like discussion and teaching others — tend to support deeper retention than passive reading alone.",
  },
  {
    icon: GraduationCap,
    title: "Bloom's Taxonomy",
    blurb:
      "A classic hierarchy of cognitive learning objectives — from remembering and understanding through to applying, analyzing, evaluating, and creating — used here to frame how case-study review moves from basic comprehension toward original contribution.",
  },
];

const ROLE_CALLOUTS = [
  {
    icon: ShieldCheck,
    role: "Admin",
    description: "Oversee tutors, students, and sessions across the platform.",
  },
  {
    icon: BookOpen,
    role: "Tutor",
    description: "Review case studies and lead discussions with your students.",
  },
  {
    icon: UserCheck,
    role: "Student",
    description: "Submit case studies and learn alongside your peers.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    number: 1,
    title: "Submit",
    description: "Students research and submit structured case studies.",
    classes: "bg-primary text-on-primary",
  },
  {
    number: 2,
    title: "Review & Approve",
    description: "Tutors evaluate submissions against academic criteria.",
    classes: "bg-secondary-container text-on-secondary-container",
  },
  {
    number: 3,
    title: "Discuss & Learn",
    description: "Approved cases open for peer discussion and grading.",
    classes: "bg-tertiary-fixed text-on-tertiary-fixed",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Nav />

      <main className="flex-1 pt-[80px]">
        {/* Hero */}
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
                Empower your institution with structured case studies,
                tutor-led discussions, and comprehensive learning analytics.
                Build a vibrant community of shared knowledge.
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
              <img
                alt="Preview of the CaseNest Academy dashboard, showing a world map of student connections and analytics charts"
                className="relative z-10 h-full w-full rounded-lg border border-outline-variant/20 object-cover shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFoNf42MIIY2OjXjf1UN1inRl6jhtekovDcscgGMS_oabl9Fwd2rexR69UnRS6bLEHbMxfFG78XpZeBjH9z0lndsnFNgWKNzSwFSMMTndO4HPoTwcXyqHyOqUdzBss5mMK1EHar07hYWtRFNMZcwm92Pgd9RBhAipZZHB-wwx0ossE5yYbDFMsyK1FAKVkgjxoA2YIoidKoxirmDtXRFUTWK4bpIDyx8jInUlYQ63Nzp338EodGuZk"
              />
            </div>
          </div>
          <div className="absolute right-0 top-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-inverse-primary/20 blur-3xl" />
          <div className="absolute bottom-0 left-10 -z-10 h-[400px] w-[400px] rounded-full bg-secondary-container/20 blur-3xl" />
        </section>

        {/* Features bento grid */}
        <section
          id="features"
          className="bg-surface-container-low px-xl py-4xl lg:px-4xl"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3xl">
            <div className="mx-auto flex max-w-2xl flex-col gap-sm text-center">
              <h2 className="text-h1 text-primary">
                Everything you need to orchestrate learning
              </h2>
              <p className="text-body text-on-surface-variant">
                A comprehensive suite of tools designed to facilitate
                structured academic collaboration.
              </p>
            </div>
            <div className="grid auto-rows-[300px] grid-cols-1 gap-xl md:grid-cols-3 lg:grid-cols-4">
              <Card
                shadow={false}
                className="ambient-shadow group relative flex flex-col justify-between overflow-hidden md:col-span-2 lg:col-span-2"
              >
                <div className="relative z-10 flex flex-col gap-sm">
                  <div className="mb-sm flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-h2 text-on-surface">
                    Case-study submission
                  </h3>
                  <p className="max-w-sm text-body text-on-surface-variant">
                    Structured workflows for students to submit detailed
                    academic case studies for peer review and grading.
                  </p>
                </div>
                <div className="absolute -bottom-5 -right-5 flex h-64 w-64 items-center justify-center rounded-full bg-surface-container opacity-50 transition-transform duration-500 group-hover:scale-110">
                  <UploadCloud size={120} className="text-primary/10" />
                </div>
              </Card>

              <Card
                shadow={false}
                className="ambient-shadow relative flex flex-col justify-between overflow-hidden border-none bg-secondary text-on-secondary md:col-span-1 lg:col-span-1"
              >
                <div className="relative z-10 flex flex-col gap-sm">
                  <MessageSquare size={32} className="mb-sm" />
                  <h3 className="text-h3">Tutor-led discussion</h3>
                  <p className="text-small opacity-90">
                    Facilitated seminars and deep-dive conversational threads.
                  </p>
                </div>
              </Card>

              <Card
                shadow={false}
                className="ambient-shadow flex flex-col justify-between border-none bg-tertiary-fixed text-on-tertiary-fixed md:col-span-3 lg:col-span-1"
              >
                <div className="flex flex-col gap-sm">
                  <div className="mb-sm flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-fixed-dim">
                    <FolderOpen size={20} />
                  </div>
                  <h3 className="text-h3">Resource sharing</h3>
                  <p className="text-small opacity-80">
                    Centralized hub for literature and course materials.
                  </p>
                </div>
              </Card>

              <Card
                shadow={false}
                className="ambient-shadow relative flex flex-col items-center gap-xl overflow-hidden md:col-span-3 md:flex-row lg:col-span-4"
              >
                <div className="relative z-10 flex flex-1 flex-col gap-sm">
                  <div className="mb-sm flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant">
                    <BarChart3 size={24} />
                  </div>
                  <h3 className="text-h2 text-on-surface">Global Analytics</h3>
                  <p className="max-w-md text-body text-on-surface-variant">
                    Track engagement across cohorts with visual sector
                    breakdowns and geographic distribution maps.
                  </p>
                </div>
                <div className="relative h-full min-h-[200px] w-full flex-1 overflow-hidden rounded-lg border border-outline-variant/20">
                  <img
                    alt="Abstract data visualization showing a stylized world map and a donut chart of engagement metrics"
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI7xe5-wdnbzcKPSLqKpNlCUFIRUtbWjidR7XM_-QOFhj_bmcb6pULjEYJPG-uhY-C9TDTGwgk6AyhCyY7AvjFAipBrklUyIQun0RWqsPssv8wzvubiOyD5IsB06cK5nHMFKx4J-1TiAvaFjBFKy5R1RDZ7csHxHrHoWjwgugS7M2vVZ6UWA4hBVv4MB-qHzvcYQ9sWqPMsk7_pKSyTw68nAJAe4GyjZHREqmgzxKv0vJzUbs4mXas"
                  />
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="bg-surface px-xl py-4xl lg:px-4xl"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3xl">
            <h2 className="text-center text-h1 text-primary">
              How it works
            </h2>
            <div className="relative flex flex-col items-start justify-between gap-xl md:flex-row md:gap-0">
              <div className="absolute top-1/2 left-[10%] right-[10%] z-0 hidden h-[2px] -translate-y-1/2 bg-outline-variant/30 md:block" />
              {HOW_IT_WORKS_STEPS.map((step) => (
                <div
                  key={step.number}
                  className="relative z-10 flex flex-1 flex-col items-center gap-md px-lg text-center"
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-surface text-h3 shadow-lg ${step.classes}`}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-h3 text-on-surface">{step.title}</h3>
                  <p className="text-small text-on-surface-variant">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning models */}
        <section
          id="learning-models"
          className="bg-surface-container-low px-xl py-4xl lg:px-4xl"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3xl">
            <div className="mx-auto flex max-w-2xl flex-col gap-sm text-center">
              <h2 className="text-h1 text-primary">
                Grounded in proven learning models
              </h2>
              <p className="text-body text-on-surface-variant">
                CaseNest structures every case study and discussion around
                frameworks with a track record in education.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-4">
              {LEARNING_MODELS.map(({ icon: Icon, title, blurb }) => (
                <Card key={title} className="flex flex-col gap-sm">
                  <div className="mb-sm flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-h4 text-on-surface">{title}</h3>
                  <p className="text-small text-on-surface-variant">
                    {blurb}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Role callouts */}
        <section className="bg-surface px-xl py-4xl lg:px-4xl">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3xl">
            <div className="mx-auto flex max-w-2xl flex-col gap-sm text-center">
              <h2 className="text-h1 text-primary">Built for every role</h2>
              <p className="text-body text-on-surface-variant">
                Whichever seat you take, CaseNest has a dashboard tailored to
                it.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-xl md:grid-cols-3">
              {ROLE_CALLOUTS.map(({ icon: Icon, role, description }) => (
                <Card
                  key={role}
                  className="flex flex-col items-center gap-md text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-h3 text-on-surface">For {role}s</h3>
                  <p className="text-small text-on-surface-variant">
                    {description}
                  </p>
                  <ToastButton variant="secondary" size="sm">
                    Continue as {role}
                  </ToastButton>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
            <p className="max-w-xs leading-relaxed text-on-surface-variant">
              © 2026 CaseNest Academy. Empowering peer-led education through
              structured collaboration.
            </p>
          </div>
          <div className="flex flex-col gap-sm lg:col-span-1 lg:col-start-3">
            <h4 className="mb-xs text-h4 text-on-surface">Platform</h4>
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
            <h4 className="mb-xs text-h4 text-on-surface">
              Legal &amp; Contact
            </h4>
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
    </div>
  );
}
