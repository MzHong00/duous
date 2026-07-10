import type { Metadata } from "next";
import { Suspense } from "react";

import { CalendarView } from "@/features/calendar/components/CalendarView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.CALENDAR };

export default function Page() {
  return (
    <Suspense>
      <CalendarView />
    </Suspense>
  );
}
