import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkspaceEditView } from "@/features/workspace/components/WorkspaceEditView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.WORKSPACE_EDIT };

export default function Page() {
  return (
    <Suspense>
      <WorkspaceEditView />
    </Suspense>
  );
}
