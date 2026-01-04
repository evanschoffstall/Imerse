-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."abilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entry" TEXT,
    "charges" INTEGER,
    "type" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attribute_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "entityType" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attribute_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attributes" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookmarks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "type" TEXT NOT NULL DEFAULT 'entity',
    "config" JSONB NOT NULL DEFAULT '{}',
    "folder" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT,
    "locationId" TEXT,
    "itemId" TEXT,
    "questId" TEXT,
    "eventId" TEXT,
    "journalId" TEXT,
    "familyId" TEXT,
    "organisationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."calendar_weather" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "weatherType" TEXT,
    "temperature" TEXT,
    "precipitation" TEXT,
    "wind" TEXT,
    "effect" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'all',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "calendarId" TEXT NOT NULL,

    CONSTRAINT "calendar_weather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."calendars" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "date" TEXT,
    "months" JSONB,
    "weekdays" JSONB,
    "years" JSONB,
    "seasons" JSONB,
    "moons" JSONB,
    "weekNames" JSONB,
    "monthAliases" JSONB,
    "suffix" TEXT,
    "format" TEXT,
    "hasLeapYear" BOOLEAN NOT NULL DEFAULT false,
    "leapYearAmount" INTEGER,
    "leapYearMonth" INTEGER,
    "leapYearOffset" INTEGER,
    "leapYearStart" INTEGER,
    "startOffset" INTEGER NOT NULL DEFAULT 0,
    "skipYearZero" BOOLEAN NOT NULL DEFAULT false,
    "showBirthdays" BOOLEAN NOT NULL DEFAULT true,
    "parameters" JSONB,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaign_dashboard_roles" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_dashboard_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaign_dashboard_widget_tags" (
    "id" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_dashboard_widget_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaign_dashboard_widgets" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 4,
    "height" INTEGER NOT NULL DEFAULT 4,
    "dashboardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_dashboard_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaign_dashboards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "visibility" TEXT NOT NULL DEFAULT 'members',
    "layout" JSONB NOT NULL DEFAULT '{}',
    "position" INTEGER NOT NULL DEFAULT 0,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaign_roles" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaign_styles" (
    "id" TEXT NOT NULL,
    "headerImage" TEXT,
    "colors" JSONB NOT NULL DEFAULT '{}',
    "fonts" JSONB NOT NULL DEFAULT '{}',
    "customCSS" TEXT,
    "themeId" TEXT,
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bgOpacity" DOUBLE PRECISION DEFAULT 0.8,
    "bgBlur" DOUBLE PRECISION DEFAULT 4,
    "bgExpandToSidebar" BOOLEAN DEFAULT false,
    "bgExpandToHeader" BOOLEAN DEFAULT false,
    "headerBgOpacity" DOUBLE PRECISION DEFAULT 0.95,
    "sidebarBgOpacity" DOUBLE PRECISION DEFAULT 1.0,
    "headerBlur" DOUBLE PRECISION DEFAULT 0,
    "sidebarBlur" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "campaign_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "backgroundImage" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "type" TEXT,
    "age" TEXT,
    "sex" TEXT,
    "pronouns" TEXT,
    "location" TEXT,
    "family" TEXT,
    "description" TEXT,
    "imageId" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "birthCalendarId" TEXT,
    "birthDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversation_messages" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT,
    "characterId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversation_participants" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT,
    "characterId" TEXT,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" TEXT NOT NULL DEFAULT 'characters',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."creature_locations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatureId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "creature_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."creatures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entry" TEXT,
    "type" TEXT,
    "image" TEXT,
    "isExtinct" BOOLEAN NOT NULL DEFAULT false,
    "isDead" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "creatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dice_roll_results" (
    "id" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diceRollId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "dice_roll_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dice_rolls" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "system" TEXT,
    "parameters" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "characterId" TEXT,

    CONSTRAINT "dice_rolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entity_abilities" (
    "id" TEXT NOT NULL,
    "charges" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "entity_abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entity_assets" (
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "imageId" TEXT NOT NULL,
    "characterId" TEXT,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entity_event_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entity_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "date" TEXT,
    "description" TEXT,
    "image" TEXT,
    "location" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "calendarId" TEXT,
    "calendarDate" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" JSONB,
    "timelineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."families" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "image" TEXT,
    "location" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."image_mentions" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "characterId" TEXT,
    "locationId" TEXT,
    "postId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."images" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ext" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "focusX" INTEGER,
    "focusY" INTEGER,
    "isFolder" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "visibility" INTEGER NOT NULL DEFAULT 0,
    "campaignId" TEXT NOT NULL,
    "folderId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "image" TEXT,
    "location" TEXT,
    "character" TEXT,
    "price" TEXT,
    "size" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."journals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "date" TEXT,
    "image" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "parentId" TEXT,
    "description" TEXT,
    "imageId" TEXT,
    "mapImage" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."map_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isShown" BOOLEAN NOT NULL DEFAULT true,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mapId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "map_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."map_layers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "entry" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mapId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "map_layers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."map_markers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entry" TEXT,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "shape" TEXT NOT NULL DEFAULT 'marker',
    "size" INTEGER NOT NULL DEFAULT 1,
    "colour" TEXT NOT NULL DEFAULT '#ff0000',
    "fontColour" TEXT NOT NULL DEFAULT '#ffffff',
    "icon" TEXT,
    "customIcon" TEXT,
    "customShape" TEXT,
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "circleRadius" INTEGER,
    "polygonStyle" JSONB,
    "isDraggable" BOOLEAN NOT NULL DEFAULT false,
    "isPopupless" BOOLEAN NOT NULL DEFAULT false,
    "pinSize" INTEGER,
    "css" TEXT,
    "entityId" TEXT,
    "entityType" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mapId" TEXT NOT NULL,
    "groupId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "map_markers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."maps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "image" TEXT,
    "grid" JSONB,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "image" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_preferences" (
    "id" TEXT NOT NULL,
    "emailOnMention" BOOLEAN NOT NULL DEFAULT true,
    "emailOnComment" BOOLEAN NOT NULL DEFAULT true,
    "emailOnCalendar" BOOLEAN NOT NULL DEFAULT true,
    "emailOnReminder" BOOLEAN NOT NULL DEFAULT true,
    "emailOnCampaign" BOOLEAN NOT NULL DEFAULT true,
    "emailOnQuest" BOOLEAN NOT NULL DEFAULT false,
    "emailOnCharacter" BOOLEAN NOT NULL DEFAULT false,
    "emailDigest" BOOLEAN NOT NULL DEFAULT false,
    "emailDigestFrequency" TEXT NOT NULL DEFAULT 'daily',
    "notifyOnMention" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnComment" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnCalendar" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnReminder" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnCampaign" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnQuest" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnCharacter" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "entityType" TEXT,
    "entityId" TEXT,
    "userId" TEXT NOT NULL,
    "creatorId" TEXT,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organisations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "image" TEXT,
    "location" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_permissions" (
    "id" TEXT NOT NULL,
    "permission" INTEGER NOT NULL DEFAULT 0,
    "postId" TEXT NOT NULL,
    "roleId" TEXT,
    "userId" TEXT,

    CONSTRAINT "post_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_tags" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entry" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "layoutId" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "characterId" TEXT,
    "locationId" TEXT,
    "itemId" TEXT,
    "questId" TEXT,
    "eventId" TEXT,
    "journalId" TEXT,
    "familyId" TEXT,
    "organisationId" TEXT,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."preset_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preset_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."presets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "typeId" TEXT NOT NULL,
    "campaignId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "image" TEXT,
    "status" TEXT DEFAULT 'active',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."races" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "image" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."relations" (
    "id" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "attitude" INTEGER NOT NULL DEFAULT 0,
    "colour" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "visibility" TEXT NOT NULL DEFAULT 'all',
    "mirrorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."relationships" (
    "id" TEXT NOT NULL,
    "sourceEntityType" TEXT NOT NULL,
    "sourceEntityId" TEXT NOT NULL,
    "targetEntityType" TEXT NOT NULL,
    "targetEntityId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "bidirectional" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reminders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventTypeId" TEXT NOT NULL,
    "calendarId" TEXT,
    "calendarDate" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" JSONB,
    "notifyBefore" INTEGER,
    "isNotification" BOOLEAN NOT NULL DEFAULT false,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "color" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."themes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "preview" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "colors" JSONB NOT NULL DEFAULT '{}',
    "fonts" JSONB NOT NULL DEFAULT '{}',
    "layout" JSONB NOT NULL DEFAULT '{}',
    "customCSS" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."timelines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "image" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."versions" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changeType" TEXT NOT NULL DEFAULT 'update',
    "changesMade" TEXT,
    "changedFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whiteboards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL DEFAULT '{}',
    "thumbnail" TEXT,
    "template" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "abilities_campaignId_idx" ON "public"."abilities"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "abilities_campaignId_name_idx" ON "public"."abilities"("campaignId" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "abilities_parentId_idx" ON "public"."abilities"("parentId" ASC);

-- CreateIndex
CREATE INDEX "attribute_templates_campaignId_idx" ON "public"."attribute_templates"("campaignId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "attribute_templates_campaignId_slug_key" ON "public"."attribute_templates"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "attribute_templates_entityType_idx" ON "public"."attribute_templates"("entityType" ASC);

-- CreateIndex
CREATE INDEX "attributes_campaignId_idx" ON "public"."attributes"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "attributes_entityType_entityId_idx" ON "public"."attributes"("entityType" ASC, "entityId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "attributes_entityType_entityId_key_key" ON "public"."attributes"("entityType" ASC, "entityId" ASC, "key" ASC);

-- CreateIndex
CREATE INDEX "bookmarks_campaignId_idx" ON "public"."bookmarks"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "bookmarks_characterId_idx" ON "public"."bookmarks"("characterId" ASC);

-- CreateIndex
CREATE INDEX "bookmarks_folder_idx" ON "public"."bookmarks"("folder" ASC);

-- CreateIndex
CREATE INDEX "bookmarks_locationId_idx" ON "public"."bookmarks"("locationId" ASC);

-- CreateIndex
CREATE INDEX "bookmarks_userId_idx" ON "public"."bookmarks"("userId" ASC);

-- CreateIndex
CREATE INDEX "calendar_weather_calendarId_date_idx" ON "public"."calendar_weather"("calendarId" ASC, "date" ASC);

-- CreateIndex
CREATE INDEX "calendar_weather_calendarId_idx" ON "public"."calendar_weather"("calendarId" ASC);

-- CreateIndex
CREATE INDEX "calendars_campaignId_idx" ON "public"."calendars"("campaignId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "calendars_campaignId_slug_key" ON "public"."calendars"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "calendars_parentId_idx" ON "public"."calendars"("parentId" ASC);

-- CreateIndex
CREATE INDEX "campaign_dashboard_roles_dashboardId_idx" ON "public"."campaign_dashboard_roles"("dashboardId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_dashboard_roles_dashboardId_roleId_key" ON "public"."campaign_dashboard_roles"("dashboardId" ASC, "roleId" ASC);

-- CreateIndex
CREATE INDEX "campaign_dashboard_widget_tags_tagId_idx" ON "public"."campaign_dashboard_widget_tags"("tagId" ASC);

-- CreateIndex
CREATE INDEX "campaign_dashboard_widget_tags_widgetId_idx" ON "public"."campaign_dashboard_widget_tags"("widgetId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_dashboard_widget_tags_widgetId_tagId_key" ON "public"."campaign_dashboard_widget_tags"("widgetId" ASC, "tagId" ASC);

-- CreateIndex
CREATE INDEX "campaign_dashboard_widgets_dashboardId_idx" ON "public"."campaign_dashboard_widgets"("dashboardId" ASC);

-- CreateIndex
CREATE INDEX "campaign_dashboard_widgets_type_idx" ON "public"."campaign_dashboard_widgets"("type" ASC);

-- CreateIndex
CREATE INDEX "campaign_dashboards_campaignId_idx" ON "public"."campaign_dashboards"("campaignId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_dashboards_campaignId_slug_key" ON "public"."campaign_dashboards"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "campaign_dashboards_isDefault_idx" ON "public"."campaign_dashboards"("isDefault" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_roles_campaignId_userId_key" ON "public"."campaign_roles"("campaignId" ASC, "userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_styles_campaignId_key" ON "public"."campaign_styles"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "campaign_styles_themeId_idx" ON "public"."campaign_styles"("themeId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_slug_key" ON "public"."campaigns"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "characters_campaignId_slug_key" ON "public"."characters"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "conversation_messages_characterId_idx" ON "public"."conversation_messages"("characterId" ASC);

-- CreateIndex
CREATE INDEX "conversation_messages_conversationId_createdAt_idx" ON "public"."conversation_messages"("conversationId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "conversation_messages_conversationId_idx" ON "public"."conversation_messages"("conversationId" ASC);

-- CreateIndex
CREATE INDEX "conversation_messages_userId_idx" ON "public"."conversation_messages"("userId" ASC);

-- CreateIndex
CREATE INDEX "conversation_participants_characterId_idx" ON "public"."conversation_participants"("characterId" ASC);

-- CreateIndex
CREATE INDEX "conversation_participants_conversationId_idx" ON "public"."conversation_participants"("conversationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_characterId_key" ON "public"."conversation_participants"("conversationId" ASC, "userId" ASC, "characterId" ASC);

-- CreateIndex
CREATE INDEX "conversation_participants_userId_idx" ON "public"."conversation_participants"("userId" ASC);

-- CreateIndex
CREATE INDEX "conversations_campaignId_idx" ON "public"."conversations"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "conversations_campaignId_name_idx" ON "public"."conversations"("campaignId" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "conversations_isClosed_idx" ON "public"."conversations"("isClosed" ASC);

-- CreateIndex
CREATE INDEX "creature_locations_creatureId_idx" ON "public"."creature_locations"("creatureId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "creature_locations_creatureId_locationId_key" ON "public"."creature_locations"("creatureId" ASC, "locationId" ASC);

-- CreateIndex
CREATE INDEX "creature_locations_locationId_idx" ON "public"."creature_locations"("locationId" ASC);

-- CreateIndex
CREATE INDEX "creatures_campaignId_idx" ON "public"."creatures"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "creatures_campaignId_name_idx" ON "public"."creatures"("campaignId" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "creatures_parentId_idx" ON "public"."creatures"("parentId" ASC);

-- CreateIndex
CREATE INDEX "creatures_type_idx" ON "public"."creatures"("type" ASC);

-- CreateIndex
CREATE INDEX "dice_roll_results_createdById_idx" ON "public"."dice_roll_results"("createdById" ASC);

-- CreateIndex
CREATE INDEX "dice_roll_results_diceRollId_createdAt_idx" ON "public"."dice_roll_results"("diceRollId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "dice_roll_results_diceRollId_idx" ON "public"."dice_roll_results"("diceRollId" ASC);

-- CreateIndex
CREATE INDEX "dice_rolls_campaignId_idx" ON "public"."dice_rolls"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "dice_rolls_campaignId_name_idx" ON "public"."dice_rolls"("campaignId" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "dice_rolls_characterId_idx" ON "public"."dice_rolls"("characterId" ASC);

-- CreateIndex
CREATE INDEX "entity_abilities_abilityId_idx" ON "public"."entity_abilities"("abilityId" ASC);

-- CreateIndex
CREATE INDEX "entity_abilities_entityType_entityId_idx" ON "public"."entity_abilities"("entityType" ASC, "entityId" ASC);

-- CreateIndex
CREATE INDEX "entity_abilities_entityType_entityId_position_idx" ON "public"."entity_abilities"("entityType" ASC, "entityId" ASC, "position" ASC);

-- CreateIndex
CREATE INDEX "entity_assets_characterId_idx" ON "public"."entity_assets"("characterId" ASC);

-- CreateIndex
CREATE INDEX "entity_assets_imageId_idx" ON "public"."entity_assets"("imageId" ASC);

-- CreateIndex
CREATE INDEX "entity_assets_locationId_idx" ON "public"."entity_assets"("locationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "entity_event_types_name_key" ON "public"."entity_event_types"("name" ASC);

-- CreateIndex
CREATE INDEX "entity_logs_action_idx" ON "public"."entity_logs"("action" ASC);

-- CreateIndex
CREATE INDEX "entity_logs_campaignId_idx" ON "public"."entity_logs"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "entity_logs_createdAt_idx" ON "public"."entity_logs"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "entity_logs_entityType_entityId_idx" ON "public"."entity_logs"("entityType" ASC, "entityId" ASC);

-- CreateIndex
CREATE INDEX "entity_logs_userId_idx" ON "public"."entity_logs"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "events_campaignId_slug_key" ON "public"."events"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "families_campaignId_slug_key" ON "public"."families"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "image_mentions_characterId_idx" ON "public"."image_mentions"("characterId" ASC);

-- CreateIndex
CREATE INDEX "image_mentions_imageId_idx" ON "public"."image_mentions"("imageId" ASC);

-- CreateIndex
CREATE INDEX "image_mentions_locationId_idx" ON "public"."image_mentions"("locationId" ASC);

-- CreateIndex
CREATE INDEX "image_mentions_postId_idx" ON "public"."image_mentions"("postId" ASC);

-- CreateIndex
CREATE INDEX "images_campaignId_idx" ON "public"."images"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "images_createdBy_idx" ON "public"."images"("createdBy" ASC);

-- CreateIndex
CREATE INDEX "images_folderId_idx" ON "public"."images"("folderId" ASC);

-- CreateIndex
CREATE INDEX "images_isFolder_idx" ON "public"."images"("isFolder" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "items_campaignId_slug_key" ON "public"."items"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "journals_campaignId_slug_key" ON "public"."journals"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "locations_campaignId_slug_key" ON "public"."locations"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "map_groups_mapId_idx" ON "public"."map_groups"("mapId" ASC);

-- CreateIndex
CREATE INDEX "map_groups_parentId_idx" ON "public"."map_groups"("parentId" ASC);

-- CreateIndex
CREATE INDEX "map_layers_mapId_idx" ON "public"."map_layers"("mapId" ASC);

-- CreateIndex
CREATE INDEX "map_layers_mapId_position_idx" ON "public"."map_layers"("mapId" ASC, "position" ASC);

-- CreateIndex
CREATE INDEX "map_markers_entityType_entityId_idx" ON "public"."map_markers"("entityType" ASC, "entityId" ASC);

-- CreateIndex
CREATE INDEX "map_markers_groupId_idx" ON "public"."map_markers"("groupId" ASC);

-- CreateIndex
CREATE INDEX "map_markers_mapId_idx" ON "public"."map_markers"("mapId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "maps_campaignId_slug_key" ON "public"."maps"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "notes_campaignId_slug_key" ON "public"."notes"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "public"."notification_preferences"("userId" ASC);

-- CreateIndex
CREATE INDEX "notifications_campaignId_idx" ON "public"."notifications"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "public"."notifications"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "public"."notifications"("type" ASC);

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "public"."notifications"("userId" ASC, "read" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "organisations_campaignId_slug_key" ON "public"."organisations"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "post_permissions_postId_idx" ON "public"."post_permissions"("postId" ASC);

-- CreateIndex
CREATE INDEX "post_permissions_roleId_idx" ON "public"."post_permissions"("roleId" ASC);

-- CreateIndex
CREATE INDEX "post_permissions_userId_idx" ON "public"."post_permissions"("userId" ASC);

-- CreateIndex
CREATE INDEX "post_tags_postId_idx" ON "public"."post_tags"("postId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "post_tags_postId_tagId_key" ON "public"."post_tags"("postId" ASC, "tagId" ASC);

-- CreateIndex
CREATE INDEX "post_tags_tagId_idx" ON "public"."post_tags"("tagId" ASC);

-- CreateIndex
CREATE INDEX "posts_campaignId_idx" ON "public"."posts"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "posts_campaignId_name_idx" ON "public"."posts"("campaignId" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "posts_characterId_idx" ON "public"."posts"("characterId" ASC);

-- CreateIndex
CREATE INDEX "posts_isPinned_idx" ON "public"."posts"("isPinned" ASC);

-- CreateIndex
CREATE INDEX "posts_locationId_idx" ON "public"."posts"("locationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "preset_types_name_key" ON "public"."preset_types"("name" ASC);

-- CreateIndex
CREATE INDEX "presets_campaignId_idx" ON "public"."presets"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "presets_category_idx" ON "public"."presets"("category" ASC);

-- CreateIndex
CREATE INDEX "presets_isOfficial_idx" ON "public"."presets"("isOfficial" ASC);

-- CreateIndex
CREATE INDEX "presets_isPublic_idx" ON "public"."presets"("isPublic" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "presets_slug_key" ON "public"."presets"("slug" ASC);

-- CreateIndex
CREATE INDEX "presets_typeId_idx" ON "public"."presets"("typeId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "quests_campaignId_slug_key" ON "public"."quests"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "races_campaignId_slug_key" ON "public"."races"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "relations_campaignId_idx" ON "public"."relations"("campaignId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "relations_mirrorId_key" ON "public"."relations"("mirrorId" ASC);

-- CreateIndex
CREATE INDEX "relations_ownerId_ownerType_idx" ON "public"."relations"("ownerId" ASC, "ownerType" ASC);

-- CreateIndex
CREATE INDEX "relations_targetId_targetType_idx" ON "public"."relations"("targetId" ASC, "targetType" ASC);

-- CreateIndex
CREATE INDEX "relationships_campaignId_idx" ON "public"."relationships"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "relationships_relationshipType_idx" ON "public"."relationships"("relationshipType" ASC);

-- CreateIndex
CREATE INDEX "relationships_sourceEntityType_sourceEntityId_idx" ON "public"."relationships"("sourceEntityType" ASC, "sourceEntityId" ASC);

-- CreateIndex
CREATE INDEX "relationships_targetEntityType_targetEntityId_idx" ON "public"."relationships"("targetEntityType" ASC, "targetEntityId" ASC);

-- CreateIndex
CREATE INDEX "reminders_calendarId_idx" ON "public"."reminders"("calendarId" ASC);

-- CreateIndex
CREATE INDEX "reminders_campaignId_idx" ON "public"."reminders"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "reminders_entityType_entityId_idx" ON "public"."reminders"("entityType" ASC, "entityId" ASC);

-- CreateIndex
CREATE INDEX "reminders_eventTypeId_idx" ON "public"."reminders"("eventTypeId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "tags_campaignId_slug_key" ON "public"."tags"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "themes_isOfficial_idx" ON "public"."themes"("isOfficial" ASC);

-- CreateIndex
CREATE INDEX "themes_isPublic_idx" ON "public"."themes"("isPublic" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "themes_slug_key" ON "public"."themes"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "timelines_campaignId_slug_key" ON "public"."timelines"("campaignId" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "user_logs_action_idx" ON "public"."user_logs"("action" ASC);

-- CreateIndex
CREATE INDEX "user_logs_createdAt_idx" ON "public"."user_logs"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "user_logs_userId_idx" ON "public"."user_logs"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE INDEX "versions_campaignId_idx" ON "public"."versions"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "versions_createdAt_idx" ON "public"."versions"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "versions_entityType_entityId_idx" ON "public"."versions"("entityType" ASC, "entityId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "versions_entityType_entityId_versionNumber_key" ON "public"."versions"("entityType" ASC, "entityId" ASC, "versionNumber" ASC);

-- CreateIndex
CREATE INDEX "whiteboards_campaignId_idx" ON "public"."whiteboards"("campaignId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "whiteboards_campaignId_slug_key" ON "public"."whiteboards"("campaignId" ASC, "slug" ASC);

-- AddForeignKey
ALTER TABLE "public"."abilities" ADD CONSTRAINT "abilities_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abilities" ADD CONSTRAINT "abilities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abilities" ADD CONSTRAINT "abilities_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."abilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attribute_templates" ADD CONSTRAINT "attribute_templates_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attribute_templates" ADD CONSTRAINT "attribute_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attributes" ADD CONSTRAINT "attributes_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attributes" ADD CONSTRAINT "attributes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "public"."journals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_questId_fkey" FOREIGN KEY ("questId") REFERENCES "public"."quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."calendar_weather" ADD CONSTRAINT "calendar_weather_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "public"."calendars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."calendars" ADD CONSTRAINT "calendars_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."calendars" ADD CONSTRAINT "calendars_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."calendars" ADD CONSTRAINT "calendars_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_dashboard_roles" ADD CONSTRAINT "campaign_dashboard_roles_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "public"."campaign_dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_dashboard_widget_tags" ADD CONSTRAINT "campaign_dashboard_widget_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_dashboard_widget_tags" ADD CONSTRAINT "campaign_dashboard_widget_tags_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "public"."campaign_dashboard_widgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_dashboard_widgets" ADD CONSTRAINT "campaign_dashboard_widgets_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "public"."campaign_dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_dashboards" ADD CONSTRAINT "campaign_dashboards_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_dashboards" ADD CONSTRAINT "campaign_dashboards_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_roles" ADD CONSTRAINT "campaign_roles_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_roles" ADD CONSTRAINT "campaign_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_styles" ADD CONSTRAINT "campaign_styles_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_styles" ADD CONSTRAINT "campaign_styles_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "public"."themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaigns" ADD CONSTRAINT "campaigns_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."characters" ADD CONSTRAINT "characters_birthCalendarId_fkey" FOREIGN KEY ("birthCalendarId") REFERENCES "public"."calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."characters" ADD CONSTRAINT "characters_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."characters" ADD CONSTRAINT "characters_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."characters" ADD CONSTRAINT "characters_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_messages" ADD CONSTRAINT "conversation_messages_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_messages" ADD CONSTRAINT "conversation_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_messages" ADD CONSTRAINT "conversation_messages_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_messages" ADD CONSTRAINT "conversation_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_participants" ADD CONSTRAINT "conversation_participants_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_participants" ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creature_locations" ADD CONSTRAINT "creature_locations_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "public"."creatures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creature_locations" ADD CONSTRAINT "creature_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creatures" ADD CONSTRAINT "creatures_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creatures" ADD CONSTRAINT "creatures_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creatures" ADD CONSTRAINT "creatures_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."creatures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dice_roll_results" ADD CONSTRAINT "dice_roll_results_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dice_roll_results" ADD CONSTRAINT "dice_roll_results_diceRollId_fkey" FOREIGN KEY ("diceRollId") REFERENCES "public"."dice_rolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dice_rolls" ADD CONSTRAINT "dice_rolls_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dice_rolls" ADD CONSTRAINT "dice_rolls_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dice_rolls" ADD CONSTRAINT "dice_rolls_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entity_abilities" ADD CONSTRAINT "entity_abilities_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "public"."abilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entity_abilities" ADD CONSTRAINT "entity_abilities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entity_assets" ADD CONSTRAINT "entity_assets_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entity_assets" ADD CONSTRAINT "entity_assets_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entity_assets" ADD CONSTRAINT "entity_assets_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entity_logs" ADD CONSTRAINT "entity_logs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entity_logs" ADD CONSTRAINT "entity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "public"."calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "public"."timelines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."families" ADD CONSTRAINT "families_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."families" ADD CONSTRAINT "families_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."image_mentions" ADD CONSTRAINT "image_mentions_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."image_mentions" ADD CONSTRAINT "image_mentions_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."image_mentions" ADD CONSTRAINT "image_mentions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."image_mentions" ADD CONSTRAINT "image_mentions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."images" ADD CONSTRAINT "images_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."images" ADD CONSTRAINT "images_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."images" ADD CONSTRAINT "images_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."items" ADD CONSTRAINT "items_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."items" ADD CONSTRAINT "items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."journals" ADD CONSTRAINT "journals_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."journals" ADD CONSTRAINT "journals_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."map_groups" ADD CONSTRAINT "map_groups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."map_groups" ADD CONSTRAINT "map_groups_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "public"."maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."map_groups" ADD CONSTRAINT "map_groups_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."map_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."map_layers" ADD CONSTRAINT "map_layers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."map_layers" ADD CONSTRAINT "map_layers_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "public"."maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."map_markers" ADD CONSTRAINT "map_markers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."map_markers" ADD CONSTRAINT "map_markers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."map_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."map_markers" ADD CONSTRAINT "map_markers_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "public"."maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maps" ADD CONSTRAINT "maps_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maps" ADD CONSTRAINT "maps_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organisations" ADD CONSTRAINT "organisations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organisations" ADD CONSTRAINT "organisations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_permissions" ADD CONSTRAINT "post_permissions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_permissions" ADD CONSTRAINT "post_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."campaign_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_permissions" ADD CONSTRAINT "post_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_tags" ADD CONSTRAINT "post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_tags" ADD CONSTRAINT "post_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "public"."journals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_questId_fkey" FOREIGN KEY ("questId") REFERENCES "public"."quests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."presets" ADD CONSTRAINT "presets_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."presets" ADD CONSTRAINT "presets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."presets" ADD CONSTRAINT "presets_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."preset_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quests" ADD CONSTRAINT "quests_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quests" ADD CONSTRAINT "quests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."races" ADD CONSTRAINT "races_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."races" ADD CONSTRAINT "races_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_mirrorId_fkey" FOREIGN KEY ("mirrorId") REFERENCES "public"."relations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relationships" ADD CONSTRAINT "relationships_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relationships" ADD CONSTRAINT "relationships_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "public"."calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "public"."entity_event_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tags" ADD CONSTRAINT "tags_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tags" ADD CONSTRAINT "tags_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."themes" ADD CONSTRAINT "themes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timelines" ADD CONSTRAINT "timelines_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timelines" ADD CONSTRAINT "timelines_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_logs" ADD CONSTRAINT "user_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."versions" ADD CONSTRAINT "versions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."versions" ADD CONSTRAINT "versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whiteboards" ADD CONSTRAINT "whiteboards_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whiteboards" ADD CONSTRAINT "whiteboards_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

