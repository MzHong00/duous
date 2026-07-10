import type { Metadata } from "next";
import { WorkspaceListView } from "@/features/workspace/components/WorkspaceListView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.WORKSPACE_LIST };

export default function Page() {
  return <WorkspaceListView />;
}
