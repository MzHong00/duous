import { Suspense } from "react";
import { CalendarView } from "@/features/calendar/components/CalendarView";

export default function Page() {
  return (
    <Suspense>
      <CalendarView />
    </Suspense>
  );
}
