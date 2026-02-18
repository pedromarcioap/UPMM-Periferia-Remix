import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

// GET - List photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const sort = searchParams.get("sort") || "recent";
    const tag = searchParams.get("tag");
    const userId = searchParams.get("userId");
    const neighborhood = searchParams.get("neighborhood");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const photos = await prisma.photo.findMany({
      where: {
        ...(tag && { tags: { contains: tag } }),
        ...(userId && { authorId: userId }),
        ...(neighborhood && neighborhood !== "Todos" && { neighborhood }),
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

// POST - Create new photo (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "Autenticação necessária",
        message: "Você precisa estar logado para fazer upload de fotos."
      }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      imageUrl, 
      thumbnailUrl, 
      tags, 
      authorId, 
      source,
      // Geotagging - Palmas-TO
      latitude,
      longitude,
      location,
      neighborhood,
      city = "Palmas",
      state = "Tocantins",
      country = "Brasil",
    } = body;

    // Validate that the authenticated user matches the authorId
    if (authorId !== session.user.id) {
      return NextResponse.json({ 
        error: "Não autorizado",
        message: "Você só pode fazer upload em nome da sua própria conta."
      }, { status: 403 });
    }

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
        // Geotagging
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        location,
        neighborhood,
        city,
        state,
        country,
        // Source attribution
        ...(source && { 
          description: description 
            ? `${description}\n\nFonte: ${source.type} - Foto por ${source.photographer}`
            : `Fonte: ${source.type} - Foto por ${source.photographer}`
        }),
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

    // Check for geotagging badge (Mapa da Quebrada)
    const geotaggedPhotos = await prisma.photo.count({ 
      where: { 
        authorId,
        latitude: { not: null },
        longitude: { not: null },
      } 
    });
    if (geotaggedPhotos >= 5) {
      const badge = await prisma.badge.findFirst({
        where: { name: "Mapa da Quebrada" },
      });
      if (badge) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId: authorId, badgeId: badge.id } },
          update: {},
          create: { userId: authorId, badgeId: badge.id },
        });
      }
    }

    // Update user's responsa points
    await prisma.user.update({
      where: { id: authorId },
      data: { responsaPoints: { increment: 10 } },
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error creating photo:", error);
    return NextResponse.json({ error: "Erro ao criar foto" }, { status: 500 });
  }
}