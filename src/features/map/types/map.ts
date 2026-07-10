import type { WorkspaceMember } from "@/features/workspace/types/workspace";

export interface UserLocation {
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export interface MemberLocation {
  member: WorkspaceMember;
  lat: number;
  lng: number;
}
