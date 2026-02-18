import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - List photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const sort = searchParams.get("sort") || "recent";
    const tag = searchParams.get("tag");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const withLocation = searchParams.get("withLocation") === "true";

    console.log("[PHOTOS API] Request params:", { type, sort, tag, userId, search, limit, offset, withLocation });

    // Build where clause for PostgreSQL
    const where: any = {};
    
    // PostgreSQL case-insensitive search using mode
    if (tag) {
      where.tags = { 
        contains: tag,
        mode: 'insensitive' as const
      };
    }
    
    if (userId) {
      where.authorId = userId;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { tags: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    
    if (withLocation) {
      where.AND = [
        { latitude: { not: null } },
        { longitude: { not: null } },
      ];
    }

    console.log("[PHOTOS API] Where clause:", JSON.stringify(where, null, 2));

    const photos = await prisma.photo.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true, level: true },
        },
        _count: { select: { likes: true, comments: true, remixes: true } },
      },
      orderBy: sort === "popular" 
        ? { vibeCount: "desc" }
        : { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    console.log("[PHOTOS API] Found photos:", photos.length);

    let remixes: any[] = [];
    if (type === "all" || type === "remixes") {
      remixes = await prisma.remix.findMany({
        where: userId ? { creatorId: userId } : undefined,
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
        orderBy: sort === "popular" 
          ? { vibeCount: "desc" }
          : { createdAt: "desc" },
        take: limit,
        skip: offset,
      });
    }

    return NextResponse.json({ photos, remixes });
  } catch (error) {
    console.error("[PHOTOS API] Error:", error);
    
    // Return more detailed error info
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("[PHOTOS API] Error details:", {
      message: errorMessage,
      stack: errorStack,
    });
    
    // Return empty arrays to prevent frontend crashes
    return NextResponse.json({ 
      photos: [], 
      remixes: [], 
      error: "Erro ao buscar fotos",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}

// POST - Create new photo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      imageUrl, 
      thumbnailUrl, 
      tags, 
      authorId,
      latitude,
      longitude,
      location,
    } = body;

    if (!title || !imageUrl || !authorId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const photo = await prisma.photo.create({
      data: {
        title,
        description,
        imageUrl,
        thumbnailUrl: thumbnailUrl || imageUrl,
        tags: Array.isArray(tags) ? tags.join(",") : tags,
        authorId,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        location,
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true, level: true },
        },
      },
    });

    // Check for first upload badge
    const userPhotos = await prisma.photo.count({ where: { authorId } });
    if (userPhotos === 1) {
      const badge = await prisma.badge.findFirst({
        where: { name: "Primeiro Click" },
      });
      if (badge) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId: authorId, badgeId: badge.id } },
          update: {},
          create: { userId: authorId, badgeId: badge.id },
        });
      }
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("[PHOTOS API] Error creating photo:", error);
    return NextResponse.json({ 
      error: "Erro ao criar foto",
      details: error instanceof Error ? error.message : undefined
    }, { status: 500 });
  }
}
