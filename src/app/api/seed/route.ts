import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Static image URLs mapped to tags (using Pexels images)
const IMAGES_BY_TAG: Record<string, string[]> = {
  "Graffiti": [
    "https://images.pexels.com/photos/1525042/pexels-photo-1525042.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/269140/pexels-photo-269140.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "Arquitetura": [
    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/221546/pexels-photo-221546.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/301930/pexels-photo-301930.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "Rua": [
    "https://images.pexels.com/photos/1038914/pexels-photo-1038914.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1346150/pexels-photo-1346150.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2161447/pexels-photo-2161447.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "Cotidiano": [
    "https://images.pexels.com/photos/1007427/pexels-photo-1007427.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1529273/pexels-photo-1529273.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "Cores": [
    "https://images.pexels.com/photos/1133353/pexels-photo-1133353.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1579258/pexels-photo-1579258.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "Texturas": [
    "https://images.pexels.com/photos/235985/pexels-photo-235985.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/689585/pexels-photo-689585.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1022928/pexels-photo-1022928.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "NaturezaUrbana": [
    "https://images.pexels.com/photos/1287089/pexels-photo-1287089.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1591374/pexels-photo-1591374.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2245435/pexels-photo-2245435.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
};

const SAMPLE_USERS = [
  { name: "Maria Silva", email: "maria@upmm.local", username: "maria_fotografias" },
  { name: "João Santos", email: "joao@upmm.local", username: "joao_urbano" },
  { name: "Ana Oliveira", email: "ana@upmm.local", username: "ana_cores" },
  { name: "Pedro Lima", email: "pedro@upmm.local", username: "pedro_studio" },
  { name: "Carla Souza", email: "carla@upmm.local", username: "carla_art" },
];

const PHOTO_TITLES = [
  "Arte Urbana no Centro",
  "Cores da Periferia",
  "Texturas do Cotidiano",
  "Beleza Escondida",
  "Ritmo das Ruas",
  "Luz e Sombra",
  "Entre Becos",
  "Vida Comunitária",
  "Paredes que Falam",
  "Momentos Urbanos",
  "Essência Local",
  "Contrastes",
];

// GET - Seed database (accessible via browser)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const reset = searchParams.get("reset") === "true";

    // Simple security check
    if (key !== "upmm-seed-2024") {
      return NextResponse.json({ error: "Chave inválida" }, { status: 401 });
    }

    // Reset database if requested
    if (reset) {
      await prisma.like.deleteMany();
      await prisma.comment.deleteMany();
      await prisma.remix.deleteMany();
      await prisma.photo.deleteMany();
      await prisma.userBadge.deleteMany();
      await prisma.user.deleteMany();
      console.log("Database reset complete");
    }

    // Check if already seeded
    const existingPhotos = await prisma.photo.count();
    if (existingPhotos > 0 && !reset) {
      return NextResponse.json({ 
        message: "Banco já possui dados. Use ?reset=true para reiniciar.",
        currentPhotos: existingPhotos 
      });
    }

    // Create users
    const users = [];
    for (const userData of SAMPLE_USERS) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          vibePoints: Math.floor(Math.random() * 100),
          level: Math.floor(Math.random() * 5) + 1,
        },
      });
      users.push(user);
    }

    // Create photos
    let photoCount = 0;
    const tags = Object.keys(IMAGES_BY_TAG);

    for (const tag of tags) {
      const images = IMAGES_BY_TAG[tag];
      
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomTitle = PHOTO_TITLES[Math.floor(Math.random() * PHOTO_TITLES.length)];
        
        // Add 1-3 additional tags
        const additionalTags = tags
          .filter(t => t !== tag)
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 2) + 1);
        
        const allTags = [tag, ...additionalTags].join(",");

        // Random coordinates in Palmas-TO area
        const latitude = -10.2491 + (Math.random() - 0.5) * 0.1;
        const longitude = -48.3243 + (Math.random() - 0.5) * 0.1;

        await prisma.photo.create({
          data: {
            title: `${randomTitle} - ${tag}`,
            description: `Explorando a estética ${tag.toLowerCase()} nas ruas de Palmas`,
            imageUrl,
            thumbnailUrl: imageUrl,
            tags: allTags,
            authorId: randomUser.id,
            vibeCount: Math.floor(Math.random() * 50),
            isGoldStandard: Math.random() > 0.8,
          },
        });
        photoCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seed concluído com sucesso!",
      stats: {
        users: users.length,
        photos: photoCount,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({
      error: "Erro no seed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
