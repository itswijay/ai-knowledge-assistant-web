import { Building2 } from "lucide-react";

import { ContentContainer } from "@/components/common/content-container";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { AppShell } from "@/components/layout/app-shell";

export default function Home() {
  return (
    <AppShell>
      <ContentContainer>
        <PageHeader title="Home" />

        <div className="pt-6">
          <EmptyState
            icon={<Building2 aria-hidden="true" />}
            title="No organization selected"
            description="Create or select an organization to continue."
          />
        </div>
      </ContentContainer>
    </AppShell>
  );
}
