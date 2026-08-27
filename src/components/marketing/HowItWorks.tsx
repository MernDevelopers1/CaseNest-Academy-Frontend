import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";

const STEPS = [
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

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface px-xl py-4xl lg:px-4xl">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3xl">
        <Heading as="h2" size="h1" className="text-center text-primary">
          How it works
        </Heading>
        <div className="relative flex flex-col items-start justify-between gap-xl md:flex-row md:gap-0">
          <div className="absolute top-1/2 left-[10%] right-[10%] z-0 hidden h-[2px] -translate-y-1/2 bg-outline-variant/30 md:block" />
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative z-10 flex flex-1 flex-col items-center gap-md px-lg text-center"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-surface text-h3 shadow-lg ${step.classes}`}
              >
                {step.number}
              </div>
              <Heading as="h3" size="h3" className="text-on-surface">
                {step.title}
              </Heading>
              <Text size="small" className="text-on-surface-variant">
                {step.description}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
