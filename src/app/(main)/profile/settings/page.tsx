import type { Metadata } from "next";
import { SettingsView } from "@/features/profile/components/SettingsView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.PROFILE_SETTINGS };

export default function Page() {
  return <SettingsView />;
}
