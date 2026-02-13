import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Get genealogy tree for a photo or remix
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("photoId");
    const remixId = searchParams.get("remixId");

    if (!photoId && !remixId) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    // If we have a remixId, find the original photo
    let basePhotoId = photoId;
    if (remixId) {
      const remix = await prisma.remix.findUnique({
        where: { id: remixId },
        select: { originalPhotoId: true },
      });
      if (remix) {
        basePhotoId = remix.originalPhotoId;
      }
    }

    if (!basePhotoId) {
      return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
    }

    // Get the original photo
    const originalPhoto = await prisma.photo.findUnique({
      where: { id: basePhotoId },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    });

    if (!originalPhoto) {
      return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
    }

    // Get all remixes of this photo
    const remixes = await prisma.remix.findMany({
      where: { originalPhotoId: basePhotoId },
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Build the genealogy tree
    const tree = {
      original: {
        id: originalPhoto.id,
        type: "photo",
        title: originalPhoto.title,
        imageUrl: originalPhoto.thumbnailUrl || originalPhoto.imageUrl,
        author: originalPhoto.author,
        createdAt: originalPhoto.createdAt,
        vibeCount: originalPhoto.vibeCount,
      },
      remixes: remixes.map((remix) => ({
        id: remix.id,
        type: "remix",
        title: remix.title || `Remix de ${originalPhoto.title}`,
        imageUrl: remix.imageUrl,
        creator: remix.creator,
        createdAt: remix.createdAt,
        vibeCount: remix.vibeCount,
      })),
      stats: {
        totalRemixes: remixes.length,
        totalVibes: originalPhoto.vibeCount + remixes.reduce((sum, r) => sum + r.vibeCount, 0),
        contributors: new Set([originalPhoto.author.id, ...remixes.map((r) => r.creator.id)]).size,
      },
    };

    return NextResponse.json(tree);
  } catch (error) {
    console.error("Error fetching genealogy:", error);
    return NextResponse.json({ error: "Erro ao buscar genealogia" }, { status: 500 });
  }
}
