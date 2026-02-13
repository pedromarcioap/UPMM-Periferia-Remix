import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Check if user liked
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const photoId = searchParams.get("photoId");
    const remixId = searchParams.get("remixId");

    if (!userId) {
      return NextResponse.json({ liked: false });
    }

    const like = await prisma.like.findFirst({
      where: {
        userId,
        ...(photoId && { photoId }),
        ...(remixId && { remixId }),
      },
    });

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    console.error("Error checking like:", error);
    return NextResponse.json({ liked: false });
  }
}

// POST - Toggle like
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, photoId, remixId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    if (!photoId && !remixId) {
      return NextResponse.json({ error: "É necessário especificar photoId ou remixId" }, { status: 400 });
    }

    // Check if already liked
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        ...(photoId && { photoId }),
        ...(remixId && { remixId }),
      },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      
      if (photoId) {
        await prisma.photo.update({
          where: { id: photoId },
          data: { vibeCount: { decrement: 1 } },
        });
      }
      if (remixId) {
        await prisma.remix.update({
          where: { id: remixId },
          data: { vibeCount: { decrement: 1 } },
        });
      }

      return NextResponse.json({ liked: false, action: "unliked" });
    } else {
      await prisma.like.create({
        data: {
          userId,
          photoId: photoId || null,
          remixId: remixId || null,
        },
      });

      if (photoId) {
        await prisma.photo.update({
          where: { id: photoId },
          data: { vibeCount: { increment: 1 } },
        });
      }
      if (remixId) {
        await prisma.remix.update({
          where: { id: remixId },
          data: { vibeCount: { increment: 1 } },
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { vibePoints: { increment: 2 } },
      });

      return NextResponse.json({ liked: true, action: "liked" });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Erro ao processar curtida" }, { status: 500 });
  }
}
