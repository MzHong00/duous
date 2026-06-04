export interface User {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  status?: string;
  location?: string;
  lastActive?: string;
}

export interface UserProfile {
  name: string;
  profileImage?: string;
}
