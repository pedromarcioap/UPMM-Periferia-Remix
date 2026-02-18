import { db } from "./db";

// Levels configuration
export const LEVELS = {
  1: { name: "Observador", minPoints: 0, icon: "👁️" },
  2: { name: "Criador", minPoints: 100, icon: "🎨" },
  3: { name: "Ativista Visual", minPoints: 500, icon: "✊" },
} as const;

// Points values
export const POINTS = {
  LIKE_GIVEN: 1,
  LIKE_RECEIVED: 2,
  COMMENT: 2,
  COMMENT_RECEIVED: 3,
  UPLOAD_APPROVED: 20,
  REMIX_CREATED: 5,
  REMIX_LIKED: 4,
} as const;

// Badge definitions
export const BADGE_DEFINITIONS = [
  {
    id: "primeiro-click",
    name: "Primeiro Click",
    description: "Fez seu primeiro upload na plataforma",
    icon: "📷",
    type: "milestone",
  },
  {
    id: "alquimista",
    name: "Alquimista",
    description: "Criou seu primeiro remix",
    icon: "⚗️",
    type: "milestone",
  },
  {
    id: "comunidade",
    name: "Comunidade",
    description: "Recebeu 50 vibes em suas fotos",
    icon: "🤝",
    type: "achievement",
  },
  {
    id: "curador",
    name: "Curador",
    description: "Teve uma foto marcada como Padrão Ouro",
    icon: "🏆",
    type: "achievement",
  },
  {
    id: "vibe-master",
    name: "Vibe Master",
    description: "Acumulou 200 pontos de vibe",
    icon: "✨",
    type: "achievement",
  },
  {
    id: "mentor",
    name: "Mentor",
    description: "Deixou 50 comentários na comunidade",
    icon: "💬",
    type: "achievement",
  },
] as const;

// Calculate user level based on total points
export function calculateLevel(vibePoints: number, responsaPoints: number): number {
  const totalPoints = vibePoints + responsaPoints;
  
  if (totalPoints >= LEVELS[3].minPoints) return 3;
  if (totalPoints >= LEVELS[2].minPoints) return 2;
  return 1;
}

// Get level info
export function getLevelInfo(level: number) {
  return LEVELS[level as keyof typeof LEVELS] || LEVELS[1];
}

// Add vibe points to a user
export async function addVibePoints(userId: string, points: number) {
  const user = await db.user.update({
    where: { id: userId },
    data: {
      vibePoints: { increment: points },
    },
  });

  const newLevel = calculateLevel(user.vibePoints, user.responsaPoints);
  if (newLevel !== user.level) {
    await db.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }

  return user;
}

// Add responsa points to a user
export async function addResponsaPoints(userId: string, points: number) {
  const user = await db.user.update({
    where: { id: userId },
    data: {
      responsaPoints: { increment: points },
    },
  });

  const newLevel = calculateLevel(user.vibePoints, user.responsaPoints);
  if (newLevel !== user.level) {
    await db.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }

  return user;
}

// Check and award badges
export async function checkAndAwardBadges(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      photos: true,
      remixes: true,
      comments: true,
      badges: { include: { badge: true } },
    },
  });

  if (!user) return [];

  const earnedBadgeIds = user.badges.map((ub) => ub.badge.type || ub.badge.name.toLowerCase());
  const newBadges: string[] = [];

  // Check "Primeiro Click"
  if (user.photos.length > 0 && !earnedBadgeIds.includes("primeiro click")) {
    await awardBadge(userId, "Primeiro Click");
    newBadges.push("Primeiro Click");
  }

  // Check "Alquimista"
  if (user.remixes.length > 0 && !earnedBadgeIds.includes("alquimista")) {
    await awardBadge(userId, "Alquimista");
    newBadges.push("Alquimista");
  }

  // Check "Comunidade"
  const totalVibesReceived = user.photos.reduce((sum, photo) => sum + photo.vibeCount, 0);
  if (totalVibesReceived >= 50 && !earnedBadgeIds.includes("comunidade")) {
    await awardBadge(userId, "Comunidade");
    newBadges.push("Comunidade");
  }

  // Check "Vibe Master"
  if (user.vibePoints >= 200 && !earnedBadgeIds.includes("vibe master")) {
    await awardBadge(userId, "Vibe Master");
    newBadges.push("Vibe Master");
  }

  // Check "Mentor"
  if (user.comments.length >= 50 && !earnedBadgeIds.includes("mentor")) {
    await awardBadge(userId, "Mentor");
    newBadges.push("Mentor");
  }

  return newBadges;
}

// Award a specific badge
async function awardBadge(userId: string, badgeName: string) {
  const badge = await db.badge.findFirst({
    where: { name: badgeName },
  });

  if (badge) {
    await db.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      },
    });
  }
}

// Initialize badges in database
export async function initializeBadges() {
  for (const badgeDef of BADGE_DEFINITIONS) {
    const existing = await db.badge.findFirst({
      where: { name: badgeDef.name },
    });

    if (!existing) {
      await db.badge.create({
        data: {
          id: badgeDef.id,
          name: badgeDef.name,
          description: badgeDef.description,
          icon: badgeDef.icon,
          type: badgeDef.type,
        },
      });
    }
  }
}
