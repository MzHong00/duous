import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkspaceSetupView } from "@/features/workspace/components/WorkspaceSetupView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.WORKSPACE_SETUP };

export default function Page() {
  return (
    <Suspense>
      <WorkspaceSetupView />
    </Suspense>
  );
}
