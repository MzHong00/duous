import type { Metadata } from "next";
import { AnniversaryView } from "@/features/anniversary/components/AnniversaryView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.ANNIVERSARY };

export default function Page() {
  return <AnniversaryView />;
}
