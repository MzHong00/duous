import type { Metadata } from "next";

import { WorkspaceLandingView } from "@/features/workspace/components/WorkspaceLandingView";
import { INDEXABLE_ROBOTS, PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = {
  title: PAGE_TITLES.WORKSPACE_LANDING,
  description: "연인, 가족과 함께 일상과 추억을 기록하는 공간, 듀어스를 시작해보세요.",
  robots: INDEXABLE_ROBOTS,
  openGraph: {
    title: PAGE_TITLES.WORKSPACE_LANDING,
    description: "연인, 가족과 함께 일상과 추억을 기록하는 공간, 듀어스를 시작해보세요.",
  },
};

export default function Page() {
  return <WorkspaceLandingView />;
}
