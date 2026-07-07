import { Suspense } from "react";
import { WorkspaceSetupView } from "@/features/workspace/components/WorkspaceSetupView";

export default function Page() {
  return (
    <Suspense>
      <WorkspaceSetupView />
    </Suspense>
  );
}
