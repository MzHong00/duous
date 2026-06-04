export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: "couple" | "group";
  startDate?: string;
  backgroundImage?: string;
  partnerName?: string;
  members?: WorkspaceMember[];
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterEmail: string;
  inviteeEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}
