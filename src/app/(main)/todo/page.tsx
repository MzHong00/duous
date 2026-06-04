import { Suspense } from "react";
import { TodoView } from "@/features/todo/components/TodoView";

export default function Page() {
  return (
    <Suspense>
      <TodoView />
    </Suspense>
  );
}
