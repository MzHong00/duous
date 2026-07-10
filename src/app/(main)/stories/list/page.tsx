import type { Metadata } from "next";
import { Suspense } from "react";

import { StoriesView } from "@/features/stories/components/StoriesView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.STORIES_LIST };

export default function Page() {
  return (
    <Suspense>
      <StoriesView />
    </Suspense>
  );
}
