import { FileText, UploadCloud, MessageSquare, FolderOpen, BarChart3 } from "lucide-react";
import Card from "/src/components/ui/Card";

export default function FeaturesGrid() {
  return (
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
            A comprehensive suite of tools designed to facilitate structured
            academic collaboration.
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
                Structured workflows for students to submit detailed academic
                case studies for peer review and grading.
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
                Track engagement across cohorts with visual sector breakdowns
                and geographic distribution maps.
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
  );
}
