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

    console.log("[BATTLE API] Starting battle fetch");

    // Get photo count first
    const photoCount = await prisma.photo.count();
    console.log("[BATTLE API] Photo count:", photoCount);
    
    if (photoCount < 2) {
      return NextResponse.json({ 
        error: "Fotos insuficientes para batalha",
        photo1: null,
        photo2: null
      });
    }

    // Get random offset values
    const skip1 = Math.floor(Math.random() * photoCount);
    let skip2 = Math.floor(Math.random() * photoCount);
    
    // Ensure we get different photos
    while (skip2 === skip1 && photoCount > 1) {
      skip2 = Math.floor(Math.random() * photoCount);
    }

    console.log("[BATTLE API] Skip values:", { skip1, skip2 });

    const [photo1Result] = await prisma.photo.findMany({
      take: 1,
      skip: skip1,
      include: {
        author: { 
          select: { id: true, name: true, username: true, avatar: true, level: true } 
        },
        _count: { select: { likes: true } },
      },
    });

    const [photo2Result] = await prisma.photo.findMany({
      take: 1,
      skip: skip2,
      include: {
        author: { 
          select: { id: true, name: true, username: true, avatar: true, level: true } 
        },
        _count: { select: { likes: true } },
      },
    });

    console.log("[BATTLE API] Photos found:", { 
      photo1: photo1Result?.id, 
      photo2: photo2Result?.id 
    });

    if (!photo1Result || !photo2Result) {
      return NextResponse.json({ 
        error: "Erro ao carregar fotos",
        photo1: null,
        photo2: null
      });
    }

    return NextResponse.json({ photo1: photo1Result, photo2: photo2Result });
  } catch (error) {
    console.error("[BATTLE API] Error:", error);
    
    return NextResponse.json(
      { 
        error: "Erro ao carregar batalha", 
        photo1: null, 
        photo2: null,
        details: error instanceof Error ? error.message : undefined
      }, 
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
    console.error("[BATTLE API] Error voting:", error);
    return NextResponse.json(
      { 
        error: "Erro ao registrar voto",
        details: error instanceof Error ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}
