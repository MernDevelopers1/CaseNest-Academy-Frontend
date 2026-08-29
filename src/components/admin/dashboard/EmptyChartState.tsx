import { PieChart } from "lucide-react";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";

export default function EmptyChartState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-sm rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-xl text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
        <PieChart size={32} />
      </div>
      <Heading as="h4" className="text-on-surface">
        No Data Available
      </Heading>
      <Text size="small" className="max-w-xs text-on-surface-variant">
        There isn&apos;t enough data collected yet to generate this chart.
      </Text>
    </div>
  );
}
