import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// GET - Get a battle pair
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Get two random photos for battle
    const photos = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM Photo 
      ORDER BY RANDOM() 
      LIMIT 2
    `;

    if (photos.length < 2) {
      return NextResponse.json({ 
        error: "Fotos insuficientes para batalha" 
      }, { status: 400 });
    }

    const [photo1, photo2] = await Promise.all([
      prisma.photo.findUnique({
        where: { id: photos[0].id },
        include: {
          author: { 
            select: { id: true, name: true, username: true, avatar: true, level: true } 
          },
          _count: { select: { likes: true } },
        },
      }),
      prisma.photo.findUnique({
        where: { id: photos[1].id },
        include: {
          author: { 
            select: { id: true, name: true, username: true, avatar: true, level: true } 
          },
          _count: { select: { likes: true } },
        },
      }),
    ]);

    if (!photo1 || !photo2) {
      return NextResponse.json({ 
        error: "Erro ao carregar fotos" 
      }, { status: 500 });
    }

    return NextResponse.json({ photo1, photo2 });
  } catch (error) {
    console.error("Error fetching battle:", error);
    return NextResponse.json(
      { error: "Erro ao carregar batalha" }, 
      { status: 500 }
    );
  }
}

// POST - Vote in battle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { winnerId, loserId } = body;

    if (!winnerId || !loserId) {
      return NextResponse.json({ 
        error: "Winner and loser IDs are required" 
      }, { status: 400 });
    }

    // Increment vibe count for winner
    await prisma.photo.update({
      where: { id: winnerId },
      data: { vibeCount: { increment: 1 } },
    });

    // Add vibe points to voter
    await prisma.user.update({
      where: { id: session.user.id },
      data: { vibePoints: { increment: 1 } },
    });

    // Create a like for the winner
    const existingLike = await prisma.like.findFirst({
      where: { userId: session.user.id, photoId: winnerId },
    });

    if (!existingLike) {
      await prisma.like.create({
        data: { userId: session.user.id, photoId: winnerId },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Voto registrado com sucesso!" 
    });
  } catch (error) {
    console.error("Error voting in battle:", error);
    return NextResponse.json(
      { error: "Erro ao registrar voto" }, 
      { status: 500 }
    );
  }
}
