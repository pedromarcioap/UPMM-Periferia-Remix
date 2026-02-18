import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Search photos and users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.length < 2) {
      return NextResponse.json({ 
        photos: [], 
        users: [],
        message: "Digite pelo menos 2 caracteres" 
      });
    }

    const searchTerm = query.toLowerCase();
    const results: { photos: any[]; users: any[] } = { photos: [], users: [] };

    // Search photos
    if (type === "all" || type === "photos") {
      results.photos = await prisma.photo.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { tags: { contains: searchTerm } },
          ],
        },
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true, level: true },
          },
          _count: { select: { likes: true, comments: true } },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    }

    // Search users
    if (type === "all" || type === "users") {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { username: { contains: searchTerm } },
            { bio: { contains: searchTerm } },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          level: true,
          vibePoints: true,
          _count: { select: { photos: true } },
        },
        take: limit,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "Erro na busca" }, 
      { status: 500 }
    );
  }
}
