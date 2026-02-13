import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

// GET - List remixes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("photoId");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const remixes = await prisma.remix.findMany({
      where: {
        ...(photoId && { originalPhotoId: photoId }),
        ...(userId && { creatorId: userId }),
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
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(remixes);
  } catch (error) {
    console.error("Error fetching remixes:", error);
    return NextResponse.json({ error: "Erro ao buscar remixes" }, { status: 500 });
  }
}

// POST - Create new remix (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "Autenticação necessária",
        message: "Você precisa estar logado para criar remixes."
      }, { status: 401 });
    }

    const body = await request.json();
    const { title, imageUrl, originalPhotoId, creatorId } = body;

    // Validate that the authenticated user matches the creatorId
    if (creatorId !== session.user.id) {
      return NextResponse.json({ 
        error: "Não autorizado",
        message: "Você só pode criar remixes em nome da sua própria conta."
      }, { status: 403 });
    }

    if (!imageUrl || !originalPhotoId || !creatorId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Verify the original photo exists
    const originalPhoto = await prisma.photo.findUnique({
      where: { id: originalPhotoId },
    });

    if (!originalPhoto) {
      return NextResponse.json({ 
        error: "Foto original não encontrada" 
      }, { status: 404 });
    }

    const remix = await prisma.remix.create({
      data: {
        title: title || "Remix sem título",
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

    // Update user's vibe points
    await prisma.user.update({
      where: { id: creatorId },
      data: { vibePoints: { increment: 15 } },
    });

    // Increment remix count on original photo
    await prisma.photo.update({
      where: { id: originalPhotoId },
      data: { 
        remixCount: { increment: 1 },
        vibeCount: { increment: 1 },
      },
    });

    return NextResponse.json(remix);
  } catch (error) {
    console.error("Error creating remix:", error);
    return NextResponse.json({ error: "Erro ao criar remix" }, { status: 500 });
  }
}
