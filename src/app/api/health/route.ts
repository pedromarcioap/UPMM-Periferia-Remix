import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Health check endpoint
export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const userCount = await prisma.user.count();
    const photoCount = await prisma.photo.count();
    
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      stats: {
        users: userCount,
        photos: photoCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({
      status: "unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
