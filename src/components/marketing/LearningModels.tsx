import { Handshake, Lightbulb, Layers, GraduationCap } from "lucide-react";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";

const MODELS = [
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

export default function LearningModels() {
  return (
    <section
      id="learning-models"
      className="bg-surface-container-low px-xl py-4xl lg:px-4xl"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3xl">
        <div className="mx-auto flex max-w-2xl flex-col gap-sm text-center">
          <Heading as="h2" size="h1" className="text-primary">
            Grounded in proven learning models
          </Heading>
          <Text className="text-on-surface-variant">
            CaseNest structures every case study and discussion around
            frameworks with a track record in education.
          </Text>
        </div>
        <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-4">
          {MODELS.map(({ icon: Icon, title, blurb }) => (
            <Card key={title} className="flex flex-col gap-sm">
              <div className="mb-sm flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                <Icon size={24} />
              </div>
              <Heading as="h3" size="h4" className="text-on-surface">
                {title}
              </Heading>
              <Text size="small" className="text-on-surface-variant">
                {blurb}
              </Text>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
