import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Admin dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "stats") {
      const [totalUsers, totalPhotos, totalRemixes, totalComments, goldPhotos, syncedPhotos] = await Promise.all([
        prisma.user.count(),
        prisma.photo.count(),
        prisma.remix.count(),
        prisma.comment.count(),
        prisma.photo.count({ where: { isGoldStandard: true } }),
        prisma.photo.count({ where: { isSynced: true } }),
      ]);

      const topPhotos = await prisma.photo.findMany({
        where: { isGoldStandard: false },
        include: {
          author: { select: { id: true, name: true, username: true, avatar: true } },
          _count: { select: { likes: true, comments: true, remixes: true } },
        },
        orderBy: { vibeCount: "desc" },
        take: 10,
      });

      return NextResponse.json({
        stats: { totalUsers, totalPhotos, totalRemixes, totalComments, goldPhotos, syncedPhotos },
        topPhotos,
      });
    }

    if (action === "gold") {
      const goldPhotos = await prisma.photo.findMany({
        where: { isGoldStandard: true },
        include: {
          author: { select: { id: true, name: true, username: true, avatar: true } },
          _count: { select: { likes: true, comments: true, remixes: true } },
        },
        orderBy: { syncedAt: "desc" },
      });

      return NextResponse.json(goldPhotos);
    }

    return NextResponse.json({ error: "Ação não especificada" }, { status: 400 });
  } catch (error) {
    console.error("Error in admin API:", error);
    return NextResponse.json({ error: "Erro no admin" }, { status: 500 });
  }
}

// POST - Admin actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, photoId, userId } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (action === "setGold") {
      const photo = await prisma.photo.update({
        where: { id: photoId },
        data: { isGoldStandard: true },
      });

      await prisma.user.update({
        where: { id: photo.authorId },
        data: { responsaPoints: { increment: 50 } },
      });

      return NextResponse.json(photo);
    }

    if (action === "removeGold") {
      const photo = await prisma.photo.update({
        where: { id: photoId },
        data: { isGoldStandard: false },
      });

      return NextResponse.json(photo);
    }

    if (action === "setSynced") {
      const photo = await prisma.photo.update({
        where: { id: photoId },
        data: { isSynced: true, syncedAt: new Date() },
      });

      await prisma.user.update({
        where: { id: photo.authorId },
        data: { responsaPoints: { increment: 100 } },
      });

      return NextResponse.json(photo);
    }

    if (action === "deletePhoto") {
      await prisma.photo.delete({ where: { id: photoId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Error in admin action:", error);
    return NextResponse.json({ error: "Erro na ação admin" }, { status: 500 });
  }
}
