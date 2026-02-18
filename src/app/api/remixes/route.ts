import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - List remixes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("photoId");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    if (photoId) where.originalPhotoId = photoId;
    if (userId) where.creatorId = userId;

    const remixes = await prisma.remix.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar: true, level: true },
        },
        originalPhoto: {
          include: {
            author: {
              select: { id: true, name: true, username: true },
            },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Always return an array for frontend compatibility
    return NextResponse.json(remixes || []);
  } catch (error) {
    console.error("Error fetching remixes:", error);
    // Return empty array instead of error object to prevent .map() crashes
    return NextResponse.json([]);
  }
}

// POST - Create new remix
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, imageUrl, originalPhotoId, creatorId } = body;

    if (!imageUrl || !originalPhotoId || !creatorId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const remix = await prisma.remix.create({
      data: {
        title,
        imageUrl,
        originalPhotoId,
        creatorId,
      },
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar: true, level: true },
        },
        originalPhoto: {
          include: {
            author: {
              select: { id: true, name: true, username: true },
            },
          },
        },
      },
    });

    // Check for Alchemist badge (first remix)
    const userRemixes = await prisma.remix.count({ where: { creatorId } });
    if (userRemixes === 1) {
      const badge = await prisma.badge.findFirst({
        where: { name: "Alquimista" },
      });
      if (badge) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId: creatorId, badgeId: badge.id } },
          update: {},
          create: { userId: creatorId, badgeId: badge.id },
        });
      }
    }

    return NextResponse.json(remix);
  } catch (error) {
    console.error("Error creating remix:", error);
    return NextResponse.json({ error: "Erro ao criar remix" }, { status: 500 });
  }
}
