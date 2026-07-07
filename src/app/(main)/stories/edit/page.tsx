import { Suspense } from "react";
import { StoryEditView } from "@/features/stories/components/StoryEditView";

export default function Page() {
  return (
    <Suspense>
      <StoryEditView />
    </Suspense>
  );
}
