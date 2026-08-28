import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";

export interface ComingSoonProps {
  /** e.g. "Phase 4" — rendered as "Lands in Phase 4". Omit if unknown. */
  phase?: string;
}

export default function ComingSoon({ phase }: ComingSoonProps) {
  return (
    <Card className="flex flex-col items-center gap-sm py-3xl text-center">
      <Heading as="h2" size="h3" className="text-on-surface">
        This screen is built in a later phase
      </Heading>
      {phase && (
        <Text size="small" className="text-on-surface-variant">
          Lands in {phase}
        </Text>
      )}
    </Card>
  );
}
