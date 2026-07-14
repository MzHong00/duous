import type { WorkspaceMember } from "@/features/workspace/types/workspace";

export interface MemberLocation {
  member: WorkspaceMember;
  lat: number;
  lng: number;
}
