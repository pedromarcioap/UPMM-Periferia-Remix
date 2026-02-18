import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// GET - List notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get likes on user's photos
    const likesOnPhotos = await prisma.like.findMany({
      where: {
        photo: { authorId: session.user.id },
        user: { NOT: { id: session.user.id } },
      },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        photo: { select: { id: true, title: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Get comments on user's photos
    const commentsOnPhotos = await prisma.comment.findMany({
      where: {
        photo: { authorId: session.user.id },
        user: { NOT: { id: session.user.id } },
      },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        photo: { select: { id: true, title: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Get remixes of user's photos
    const remixesOfPhotos = await prisma.remix.findMany({
      where: {
        originalPhoto: { authorId: session.user.id },
        creator: { NOT: { id: session.user.id } },
      },
      include: {
        creator: { select: { id: true, name: true, username: true, avatar: true } },
        originalPhoto: { select: { id: true, title: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Combine and format notifications
    const notifications = [
      ...likesOnPhotos.map((like) => ({
        id: like.id,
        type: "like",
        user: like.user,
        photo: like.photo,
        message: `${like.user.name || "Alguém"} curtiu sua foto "${like.photo.title}"`,
        createdAt: like.createdAt.toISOString(),
      })),
      ...commentsOnPhotos.map((comment) => ({
        id: comment.id,
        type: "comment",
        user: comment.user,
        photo: comment.photo,
        message: `${comment.user.name || "Alguém"} comentou em "${comment.photo.title}"`,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
      })),
      ...remixesOfPhotos.map((remix) => ({
        id: remix.id,
        type: "remix",
        user: remix.creator,
        photo: remix.originalPhoto,
        message: `${remix.creator.name || "Alguém"} remixou sua foto "${remix.originalPhoto.title}"`,
        createdAt: remix.createdAt.toISOString(),
      })),
    ];

    // Sort by date
    notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ 
      notifications: notifications.slice(0, limit),
      total: notifications.length 
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Erro ao buscar notificações" }, 
      { status: 500 }
    );
  }
}
