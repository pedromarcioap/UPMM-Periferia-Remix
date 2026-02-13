import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - List comments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("photoId");
    const remixId = searchParams.get("remixId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const comments = await prisma.comment.findMany({
      where: {
        ...(photoId && { photoId }),
        ...(remixId && { remixId }),
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true, level: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Erro ao buscar comentários" }, { status: 500 });
  }
}

// POST - Create comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, userId, photoId, remixId } = body;

    if (!content || !userId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    if (!photoId && !remixId) {
      return NextResponse.json({ error: "É necessário especificar photoId ou remixId" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        photoId: photoId || null,
        remixId: remixId || null,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true, level: true },
        },
      },
    });

    // Update comment count
    if (photoId) {
      await prisma.photo.update({
        where: { id: photoId },
        data: { commentCount: { increment: 1 } },
      });
    }
    if (remixId) {
      await prisma.remix.update({
        where: { id: remixId },
        data: { commentCount: { increment: 1 } },
      });
    }

    // Award Vibe points for commenting
    await prisma.user.update({
      where: { id: userId },
      data: { vibePoints: { increment: 5 } },
    });

    // Check for Community badge (10 comments)
    const userComments = await prisma.comment.count({ where: { userId } });
    if (userComments >= 10) {
      const badge = await prisma.badge.findFirst({
        where: { name: "Comunidade" },
      });
      if (badge) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId, badgeId: badge.id } },
          update: {},
          create: { userId, badgeId: badge.id },
        });
      }
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Erro ao criar comentário" }, { status: 500 });
  }
}
