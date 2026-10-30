export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Story {
  id: string;
  title?: string;
  description?: string;
  date: string;
  path: LocationPoint[];
  pathColor: string;
  thumbnailUrl?: string;
  userId: string;
  workspaceId: string;
}
