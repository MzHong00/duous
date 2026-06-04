import { Suspense } from "react";
import { StoriesView } from "@/features/stories/components/StoriesView";

export default function Page() {
  return (
    <Suspense>
      <StoriesView />
    </Suspense>
  );
}
