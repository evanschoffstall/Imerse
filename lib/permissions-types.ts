// Permission types (can be imported in client components)
export enum Permission {
  READ = "read",
  EDIT = "edit",
  CREATE = "create",
  DELETE = "delete",
  ADMIN = "admin",
  MANAGE = "manage",
  MEMBERS = "members",
  POSTS = "posts",
  PERMS = "permissions",
  DASHBOARD = "dashboard",
  GALLERY = "gallery",
  TEMPLATES = "templates",
  BOOKMARKS = "bookmarks",
}

export enum RoleLevel {
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
}

export const RoleLevelLabels: Record<string, string> = {
  [RoleLevel.ADMIN]: "Admin",
  [RoleLevel.MEMBER]: "Member",
  [RoleLevel.VIEWER]: "Viewer",
};
