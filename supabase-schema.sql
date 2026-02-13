-- =============================================
-- UPMM DATABASE SCHEMA FOR SUPABASE
-- Execute this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vtturkgwzjhcaldpcaqf/sql/new
-- =============================================

-- Create enums
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "NotificationType" AS ENUM ('REMIX_CREATED', 'GOLD_STANDARD', 'BATTLE_WIN', 'NEW_FOLLOWER', 'BADGE_EARNED');

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "username" TEXT UNIQUE,
    "bio" TEXT,
    "avatar" TEXT,
    "googleId" TEXT UNIQUE,
    "password" TEXT,
    "vibePoints" INTEGER DEFAULT 0,
    "responsaPoints" INTEGER DEFAULT 0,
    "level" INTEGER DEFAULT 1,
    "role" "Role" DEFAULT 'USER',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Photos table
CREATE TABLE IF NOT EXISTS "Photo" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "tags" TEXT,
    "authorId" TEXT NOT NULL,
    "vibeCount" INTEGER DEFAULT 0,
    "commentCount" INTEGER DEFAULT 0,
    "remixCount" INTEGER DEFAULT 0,
    "isGoldStandard" BOOLEAN DEFAULT FALSE,
    "communityGold" BOOLEAN DEFAULT FALSE,
    "isSynced" BOOLEAN DEFAULT FALSE,
    "syncedAt" TIMESTAMP,
    "latitude" FLOAT,
    "longitude" FLOAT,
    "location" TEXT,
    "neighborhood" TEXT,
    "city" TEXT DEFAULT 'Palmas',
    "state" TEXT DEFAULT 'Tocantins',
    "country" TEXT DEFAULT 'Brasil',
    "battleWins" INTEGER DEFAULT 0,
    "battleLosses" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "Photo_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Remixes table
CREATE TABLE IF NOT EXISTS "Remix" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "originalPhotoId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "parentRemixId" TEXT,
    "vibeCount" INTEGER DEFAULT 0,
    "commentCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "Remix_originalPhotoId_fkey" FOREIGN KEY ("originalPhotoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Remix_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoId" TEXT,
    "remixId" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_remixId_fkey" FOREIGN KEY ("remixId") REFERENCES "Remix"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Likes table
CREATE TABLE IF NOT EXISTS "Like" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "photoId" TEXT,
    "remixId" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Like_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Like_remixId_fkey" FOREIGN KEY ("remixId") REFERENCES "Remix"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Badges table
CREATE TABLE IF NOT EXISTS "Badge" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT UNIQUE NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "requirement" TEXT NOT NULL
);

-- UserBadges table
CREATE TABLE IF NOT EXISTS "UserBadge" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBadge_userId_badgeId_unique" UNIQUE ("userId", "badgeId")
);

-- Notifications table
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "isRead" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- BattleVotes table
CREATE TABLE IF NOT EXISTS "BattleVote" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "photo1Id" TEXT NOT NULL,
    "photo2Id" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "BattleVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BattleVote_photo1Id_fkey" FOREIGN KEY ("photo1Id") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BattleVote_photo2Id_fkey" FOREIGN KEY ("photo2Id") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BattleVote_userId_photo1Id_photo2Id_unique" UNIQUE ("userId", "photo1Id", "photo2Id")
);

-- NextAuth tables
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Account_provider_providerAccountId_unique" UNIQUE ("provider", "providerAccountId")
);

CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expires" TIMESTAMP NOT NULL,
    CONSTRAINT "VerificationToken_identifier_token_unique" UNIQUE ("identifier", "token")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Photo_authorId_idx" ON "Photo"("authorId");
CREATE INDEX IF NOT EXISTS "Photo_neighborhood_idx" ON "Photo"("neighborhood");
CREATE INDEX IF NOT EXISTS "Photo_city_idx" ON "Photo"("city");
CREATE INDEX IF NOT EXISTS "Remix_originalPhotoId_idx" ON "Remix"("originalPhotoId");
CREATE INDEX IF NOT EXISTS "Remix_creatorId_idx" ON "Remix"("creatorId");
CREATE INDEX IF NOT EXISTS "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX IF NOT EXISTS "Like_userId_idx" ON "Like"("userId");
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");

-- Insert default badges
INSERT INTO "Badge" ("name", "description", "icon", "type", "requirement") VALUES
    ('Primeiro Click', 'Realizou o primeiro upload de foto', '📷', 'upload', 'first_upload'),
    ('Alquimista', 'Criou o primeiro remix', '⚗️', 'remix', 'first_remix'),
    ('Comunidade', 'Fez 10 comentários construtivos', '💬', 'social', '10_comments'),
    ('Mapa da Quebrada', 'Adicionou localização em 5 fotos', '🗺️', 'location', '5_geotagged'),
    ('Guerreiro da Batalha', 'Venceu 10 batalhas de vibes', '⚔️', 'battle', '10_battle_wins')
ON CONFLICT ("name") DO NOTHING;

-- Create default admin user (password: admin123)
-- Note: In production, use a proper password hash
INSERT INTO "User" ("email", "name", "username", "password", "role", "vibePoints", "responsaPoints", "level") VALUES
    ('admin@upmm.org', 'Admin UPMM', 'admin_upmm', '$2b$10$rQZ9QxZxZxZxZxZxZxZxZ.vJ7J7J7J7J7J7J7J7J7J7J7J7J7J7J7a', 'ADMIN', 1000, 500, 5)
ON CONFLICT ("email") DO NOTHING;

SELECT 'Database schema created successfully! 🎉' as result;
