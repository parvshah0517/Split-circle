import { Construction } from "lucide-react";
import Card from "./Card";
import EmptyState from "./EmptyState";
import PageHeader from "./PageHeader";

export default function PlaceholderPage({ title }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <Card>
        <EmptyState
          icon={Construction}
          title="Coming soon"
          description="This section is waiting for its backend endpoints. No data is shown until the API is available."
        />
      </Card>
    </div>
  );
}
