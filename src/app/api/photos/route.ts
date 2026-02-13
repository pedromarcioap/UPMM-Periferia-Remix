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
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const photos = await prisma.photo.findMany({
      where: {
        ...(tag && { tags: { contains: tag } }),
        ...(userId && { authorId: userId }),
      },
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

    const remixes = type === "all" || type === "remixes" 
      ? await prisma.remix.findMany({
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
        })
      : [];

    return NextResponse.json({ photos, remixes });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json({ error: "Erro ao buscar fotos" }, { status: 500 });
  }
}

// POST - Create new photo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, thumbnailUrl, tags, authorId } = body;

    if (!title || !imageUrl || !authorId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const photo = await prisma.photo.create({
      data: {
        title,
        description,
        imageUrl,
        thumbnailUrl: thumbnailUrl || imageUrl,
        tags: tags.join(","),
        authorId,
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
    console.error("Error creating photo:", error);
    return NextResponse.json({ error: "Erro ao criar foto" }, { status: 500 });
  }
}
