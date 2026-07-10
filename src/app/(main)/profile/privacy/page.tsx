import type { Metadata } from "next";
import { PrivacyView } from "@/features/profile/components/PrivacyView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.PROFILE_PRIVACY };

export default function Page() {
  return <PrivacyView />;
}
