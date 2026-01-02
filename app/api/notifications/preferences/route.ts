import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { UpdateNotificationPreferenceInput } from "@/types/notification";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Failed to fetch notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateNotificationPreferenceInput;

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: session.user.id },
      update: {
        ...(body.emailOnMention !== undefined && {
          emailOnMention: body.emailOnMention,
        }),
        ...(body.emailOnComment !== undefined && {
          emailOnComment: body.emailOnComment,
        }),
        ...(body.emailOnCalendar !== undefined && {
          emailOnCalendar: body.emailOnCalendar,
        }),
        ...(body.emailOnReminder !== undefined && {
          emailOnReminder: body.emailOnReminder,
        }),
        ...(body.emailOnCampaign !== undefined && {
          emailOnCampaign: body.emailOnCampaign,
        }),
        ...(body.emailOnQuest !== undefined && {
          emailOnQuest: body.emailOnQuest,
        }),
        ...(body.emailOnCharacter !== undefined && {
          emailOnCharacter: body.emailOnCharacter,
        }),
        ...(body.emailDigest !== undefined && {
          emailDigest: body.emailDigest,
        }),
        ...(body.emailDigestFrequency && {
          emailDigestFrequency: body.emailDigestFrequency,
        }),
        ...(body.notifyOnMention !== undefined && {
          notifyOnMention: body.notifyOnMention,
        }),
        ...(body.notifyOnComment !== undefined && {
          notifyOnComment: body.notifyOnComment,
        }),
        ...(body.notifyOnCalendar !== undefined && {
          notifyOnCalendar: body.notifyOnCalendar,
        }),
        ...(body.notifyOnReminder !== undefined && {
          notifyOnReminder: body.notifyOnReminder,
        }),
        ...(body.notifyOnCampaign !== undefined && {
          notifyOnCampaign: body.notifyOnCampaign,
        }),
        ...(body.notifyOnQuest !== undefined && {
          notifyOnQuest: body.notifyOnQuest,
        }),
        ...(body.notifyOnCharacter !== undefined && {
          notifyOnCharacter: body.notifyOnCharacter,
        }),
      },
      create: {
        userId: session.user.id,
        ...body,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Failed to update notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
