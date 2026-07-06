import { withParams, withQuery } from "@/utils/route";

export const ROUTES = {
  LOGIN: {
    path: "/login",
    query: (params: { redirect?: string }) => withQuery("/login", params),
  },
  HOME: { path: "/home" },
  CHAT: { path: "/chat" },
  MAP: { path: "/map" },
  CALENDAR: {
    path: "/calendar",
    query: (params: { date?: string }) => withQuery("/calendar", params),
  },
  ANNIVERSARY: { path: "/anniversary" },
  NOTICES: { path: "/notices" },
  SUPPORT: { path: "/support" },

  STORIES: {
    path: "/stories",
    EDIT: {
      path: "/stories/edit",
      query: (params: { storyId?: string }) => withQuery("/stories/edit", params),
    },
    detail: (id: string) => withParams("/stories", id),
  },

  PROFILE: {
    path: "/profile",
    PRIVACY: { path: "/profile/privacy" },
    SETTINGS: { path: "/profile/settings" },
  },

  TODO: {
    path: "/todo",
    CREATE: {
      path: "/todo/create",
      query: (params: { todoId?: string; initialDate?: string }) =>
        withQuery("/todo/create", params),
    },
  },

  WORKSPACE: {
    path: "/workspace",
    LANDING: { path: "/workspace/landing" },
    SETUP: { path: "/workspace/setup" },
    LIST: { path: "/workspace/list" },
    EDIT: {
      path: "/workspace/edit",
      query: (params: { workspaceId?: string }) => withQuery("/workspace/edit", params),
    },
    join: (code: string) => withParams("/workspace/join", code),
  },
} as const;
