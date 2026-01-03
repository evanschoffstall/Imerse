import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Campaign, CampaignRole } from "@prisma/client";
import { Permission, RoleLevel, RoleLevelLabels } from "./permissions-types";

// Re-export types for convenience
export { Permission, RoleLevel, RoleLevelLabels };

export interface UserCampaignPermissions {
  isOwner: boolean;
  isAdmin: boolean;
  role?: CampaignRole;
  permissions: Permission[];
}

/**
 * Get the current user's permissions for a campaign
 */
export async function getCampaignPermissions(
  campaignId: string,
  userId?: string
): Promise<UserCampaignPermissions | null> {
  if (!userId) {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }
    userId = session.user.id;
  }

  // Get campaign with roles
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      campaignRoles: {
        where: { userId },
      },
    },
  });

  if (!campaign) {
    return null;
  }

  const isOwner = campaign.ownerId === userId;
  const role = campaign.campaignRoles[0];

  // Owner has all permissions
  if (isOwner) {
    return {
      isOwner: true,
      isAdmin: true,
      role,
      permissions: Object.values(Permission),
    };
  }

  // No role = no access
  if (!role) {
    return null;
  }

  // Admin role has all permissions
  if (role.isAdmin) {
    return {
      isOwner: false,
      isAdmin: true,
      role,
      permissions: Object.values(Permission),
    };
  }

  // Parse custom permissions from JSON
  const customPermissions = role.permissions
    ? (role.permissions as string[])
    : [];

  // Default permissions by role level
  const defaultPermissions: Record<string, Permission[]> = {
    [RoleLevel.MEMBER]: [
      Permission.READ,
      Permission.EDIT,
      Permission.CREATE,
      Permission.POSTS,
      Permission.GALLERY,
    ],
    [RoleLevel.VIEWER]: [Permission.READ],
  };

  const permissions =
    customPermissions.length > 0
      ? (customPermissions as Permission[])
      : defaultPermissions[role.role] || [];

  return {
    isOwner: false,
    isAdmin: false,
    role,
    permissions,
  };
}

/**
 * Check if user has a specific permission in a campaign
 */
export async function hasPermission(
  campaignId: string,
  permission: Permission,
  userId?: string
): Promise<boolean> {
  const perms = await getCampaignPermissions(campaignId, userId);
  if (!perms) {
    return false;
  }

  return perms.permissions.includes(permission);
}

/**
 * Check if user can view a campaign
 */
export async function canViewCampaign(
  campaignId: string,
  userId?: string
): Promise<boolean> {
  const perms = await getCampaignPermissions(campaignId, userId);
  return perms !== null;
}

/**
 * Check if user can edit a campaign
 */
export async function canEditCampaign(
  campaignId: string,
  userId?: string
): Promise<boolean> {
  return hasPermission(campaignId, Permission.EDIT, userId);
}

/**
 * Check if user can manage campaign members
 */
export async function canManageMembers(
  campaignId: string,
  userId?: string
): Promise<boolean> {
  const perms = await getCampaignPermissions(campaignId, userId);
  if (!perms) {
    return false;
  }

  return (
    perms.isOwner ||
    perms.isAdmin ||
    perms.permissions.includes(Permission.MEMBERS)
  );
}

/**
 * Check if user can delete from campaign
 */
export async function canDelete(
  campaignId: string,
  userId?: string
): Promise<boolean> {
  return hasPermission(campaignId, Permission.DELETE, userId);
}

/**
 * Require campaign access or throw 403
 */
export async function requireCampaignAccess(
  campaignId: string,
  permission?: Permission
): Promise<UserCampaignPermissions> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const perms = await getCampaignPermissions(campaignId, session.user.id);
  if (!perms) {
    throw new Error("Forbidden: No access to campaign");
  }

  if (permission && !perms.permissions.includes(permission)) {
    throw new Error(`Forbidden: Missing ${permission} permission`);
  }

  return perms;
}

/**
 * Get campaign with access check
 */
export async function getCampaignWithAccess(
  campaignId: string,
  permission?: Permission
): Promise<Campaign> {
  await requireCampaignAccess(campaignId, permission);

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  return campaign;
}

/**
 * Check if user is campaign owner
 */
export async function isCampaignOwner(
  campaignId: string,
  userId?: string
): Promise<boolean> {
  if (!userId) {
    const session = await auth();
    if (!session?.user?.id) {
      return false;
    }
    userId = session.user.id;
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { ownerId: true },
  });

  return campaign?.ownerId === userId;
}

/**
 * Check if user is campaign admin (owner or admin role)
 */
export async function isCampaignAdmin(
  campaignId: string,
  userId?: string
): Promise<boolean> {
  const perms = await getCampaignPermissions(campaignId, userId);
  return perms?.isAdmin || perms?.isOwner || false;
}

/**
 * Get all users in a campaign with their roles
 */
export async function getCampaignMembers(campaignId: string) {
  return prisma.campaignRole.findMany({
    where: { campaignId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: [{ isAdmin: "desc" }, { createdAt: "asc" }],
  });
}

/**
 * Add a user to a campaign with a specific role
 */
export async function addCampaignMember(
  campaignId: string,
  userId: string,
  role: RoleLevel = RoleLevel.MEMBER,
  isAdmin: boolean = false,
  permissions?: Permission[]
) {
  // Check if already a member
  const existing = await prisma.campaignRole.findUnique({
    where: {
      campaignId_userId: {
        campaignId,
        userId,
      },
    },
  });

  if (existing) {
    throw new Error("User is already a member of this campaign");
  }

  return prisma.campaignRole.create({
    data: {
      campaignId,
      userId,
      role,
      isAdmin,
      permissions: permissions || undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Update a campaign member's role and permissions
 */
export async function updateCampaignMember(
  campaignId: string,
  userId: string,
  data: {
    role?: RoleLevel;
    isAdmin?: boolean;
    permissions?: Permission[];
  }
) {
  return prisma.campaignRole.update({
    where: {
      campaignId_userId: {
        campaignId,
        userId,
      },
    },
    data: {
      role: data.role,
      isAdmin: data.isAdmin,
      permissions: data.permissions || undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Remove a user from a campaign
 */
export async function removeCampaignMember(campaignId: string, userId: string) {
  // Prevent removing the owner
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { ownerId: true },
  });

  if (campaign?.ownerId === userId) {
    throw new Error("Cannot remove campaign owner");
  }

  return prisma.campaignRole.delete({
    where: {
      campaignId_userId: {
        campaignId,
        userId,
      },
    },
  });
}
