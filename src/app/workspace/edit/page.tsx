import { Suspense } from "react";
import { WorkspaceEditView } from "@/features/workspace/components/WorkspaceEditView";

export default function Page() {
  return (
    <Suspense>
      <WorkspaceEditView />
    </Suspense>
  );
}
