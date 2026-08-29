import { AlertTriangle } from "lucide-react";
import Card from "/src/components/ui/Card";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import Button from "/src/components/ui/Button";

export interface DashboardErrorProps {
  message?: string;
  onRetry: () => void;
  retrying?: boolean;
}

export default function DashboardError({ message, onRetry, retrying }: DashboardErrorProps) {
  return (
    <Card padding="lg" className="flex flex-col items-center gap-md py-2xl text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-container text-on-error-container">
        <AlertTriangle size={24} />
      </div>
      <Heading as="h3" size="h4" className="text-on-surface">
        Couldn&apos;t load dashboard data
      </Heading>
      <Text size="small" className="max-w-xs text-on-surface-variant">
        {message ?? "Something went wrong while reaching the server."}
      </Text>
      <Button variant="secondary" onClick={onRetry} loading={retrying}>
        Retry
      </Button>
    </Card>
  );
}
