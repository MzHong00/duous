import type { Metadata } from "next";
import { Suspense } from "react";
import { StoryEditView } from "@/features/stories/components/StoryEditView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.STORIES_EDIT };

export default function Page() {
  return (
    <Suspense>
      <StoryEditView />
    </Suspense>
  );
}
