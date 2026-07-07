import { Suspense } from "react";
import { TodoCreateView } from "@/features/todo/components/TodoCreateView";

export default function Page() {
  return (
    <Suspense>
      <TodoCreateView />
    </Suspense>
  );
}
