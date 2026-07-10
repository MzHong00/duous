import type { Metadata } from "next";

import { HomeView } from "@/features/home/components/HomeView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.HOME };

export default function Page() {
  return <HomeView />;
}
