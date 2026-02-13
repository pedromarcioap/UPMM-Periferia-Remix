import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

// GET - Get a random pair of photos for battle
export async function GET(request: NextRequest) {
  try {
    // Get all photos with location (from Palmas)
    const photos = await prisma.photo.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    });

    if (photos.length < 2) {
      return NextResponse.json({ error: "Fotos insuficientes para batalha" }, { status: 400 });
    }

    // Get random pair
    const shuffled = photos.sort(() => 0.5 - Math.random());
    const pair = shuffled.slice(0, 2);

    return NextResponse.json({
      photo1: pair[0],
      photo2: pair[1],
    });
  } catch (error) {
    console.error("Error fetching battle pair:", error);
    return NextResponse.json({ error: "Erro ao buscar fotos para batalha" }, { status: 500 });
  }
}

// POST - Vote in a battle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Faça login para votar" }, { status: 401 });
    }

    const body = await request.json();
    const { photo1Id, photo2Id, winnerId } = body;

    if (!photo1Id || !photo2Id || !winnerId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Check if user already voted for this pair
    const existingVote = await prisma.battleVote.findUnique({
      where: {
        userId_photo1Id_photo2Id: {
          userId: session.user.id,
          photo1Id,
          photo2Id,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json({ error: "Você já votou nesta batalha" }, { status: 400 });
    }

    // Record the vote
    await prisma.battleVote.create({
      data: {
        userId: session.user.id,
        photo1Id,
        photo2Id,
        winnerId,
      },
    });

    // Update battle stats
    const winner = await prisma.photo.update({
      where: { id: winnerId },
      data: { battleWins: { increment: 1 } },
    });

    const loserId = winnerId === photo1Id ? photo2Id : photo1Id;
    await prisma.photo.update({
      where: { id: loserId },
      data: { battleLosses: { increment: 1 } },
    });

    // Award Community Gold if winner has 10+ wins and high win rate
    const totalBattles = winner.battleWins + winner.battleLosses;
    const winRate = winner.battleWins / totalBattles;
    
    if (winner.battleWins >= 10 && winRate >= 0.7 && !winner.communityGold) {
      await prisma.photo.update({
        where: { id: winnerId },
        data: { communityGold: true },
      });

      // Notify the author
      await prisma.notification.create({
        data: {
          userId: winner.authorId,
          type: "GOLD_STANDARD",
          title: "Ouro Comunitário! 🏆",
          message: `Sua foto "${winner.title}" ganhou o selo de Ouro Comunitário por vitórias na batalha!`,
          data: JSON.stringify({ photoId: winnerId }),
        },
      });
    }

    // Give vibe points to voter
    await prisma.user.update({
      where: { id: session.user.id },
      data: { vibePoints: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      winner: {
        id: winner.id,
        battleWins: winner.battleWins,
        communityGold: winner.communityGold,
      },
    });
  } catch (error) {
    console.error("Error recording vote:", error);
    return NextResponse.json({ error: "Erro ao registrar voto" }, { status: 500 });
  }
}
