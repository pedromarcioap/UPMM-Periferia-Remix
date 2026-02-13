import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create badges
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { name: "Primeiro Click" },
      update: {},
      create: {
        name: "Primeiro Click",
        description: "Realizou o primeiro upload de foto",
        icon: "📷",
        type: "upload",
        requirement: "first_upload",
      },
    }),
    prisma.badge.upsert({
      where: { name: "Alquimista" },
      update: {},
      create: {
        name: "Alquimista",
        description: "Criou o primeiro remix",
        icon: "⚗️",
        type: "remix",
        requirement: "first_remix",
      },
    }),
    prisma.badge.upsert({
      where: { name: "Comunidade" },
      update: {},
      create: {
        name: "Comunidade",
        description: "Fez 10 comentários construtivos",
        icon: "💬",
        type: "social",
        requirement: "10_comments",
      },
    }),
  ]);

  console.log(`✅ Created ${badges.length} badges`);

  // Create admin user
  const adminPassword = hashSync("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@upmm.org" },
    update: {},
    create: {
      email: "admin@upmm.org",
      name: "Admin UPMM",
      username: "admin_upmm",
      password: adminPassword,
      bio: "Administrador da plataforma UPMM",
      role: "ADMIN",
      vibePoints: 1000,
      responsaPoints: 500,
      level: 3,
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Create demo users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "maria@upmm.org" },
      update: {},
      create: {
        email: "maria@upmm.org",
        name: "Maria Silva",
        username: "maria_fotografa",
        bio: "Fotógrafa de rua apaixonada por capturar a essência da periferia",
        vibePoints: 350,
        responsaPoints: 100,
        level: 2,
      },
    }),
    prisma.user.upsert({
      where: { email: "joao@upmm.org" },
      update: {},
      create: {
        email: "joao@upmm.org",
        name: "João Santos",
        username: "joao_grafite",
        bio: "Artista visual e grafiteiro da Zona Leste",
        vibePoints: 520,
        responsaPoints: 200,
        level: 3,
      },
    }),
    prisma.user.upsert({
      where: { email: "ana@upmm.org" },
      update: {},
      create: {
        email: "ana@upmm.org",
        name: "Ana Costa",
        username: "ana_olhar",
        bio: "Designer e criadora de conteúdo visual",
        vibePoints: 180,
        responsaPoints: 50,
        level: 2,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} demo users`);

  // Create sample photos
  const samplePhotos = [
    {
      title: "Beco Colorido",
      description: "Grafite no beco da Vila Madalena, cores vibrantes que contam histórias",
      tags: "Graffiti,Cores,Arquitetura",
      vibeCount: 45,
      isGoldStandard: true,
    },
    {
      title: "Cores do Entardecer",
      description: "O pôr do sol pintando as casas do morro com tons dourados",
      tags: "Cores,NaturezaUrbana,Rua",
      vibeCount: 67,
      isGoldStandard: true,
      isSynced: true,
    },
    {
      title: "Textura Urbana",
      description: "Paredes descascadas revelando camadas de história",
      tags: "Texturas,Arquitetura,Cotidiano",
      vibeCount: 32,
    },
    {
      title: "Rua de Terra",
      description: "O cotidiano simples de uma rua não asfaltada",
      tags: "Rua,Cotidiano,Texturas",
      vibeCount: 28,
    },
    {
      title: "Arte nas Paredes",
      description: "Expressão artística que transforma espaços esquecidos",
      tags: "Graffiti,Arquitetura,Cores",
      vibeCount: 89,
      isGoldStandard: true,
    },
    {
      title: "Janelas da Comunidade",
      description: "Cada janela conta uma história diferente",
      tags: "Arquitetura,Cotidiano,Rua",
      vibeCount: 41,
    },
    {
      title: "Grafite Político",
      description: "Arte como forma de expressão e resistência",
      tags: "Graffiti,Cores,Rua",
      vibeCount: 76,
      isGoldStandard: true,
    },
    {
      title: "Contrastes",
      description: "Onde o antigo encontra o novo nas periferias",
      tags: "Arquitetura,Texturas,Cores",
      vibeCount: 53,
    },
    {
      title: "Natureza Urbana",
      description: "Plantas crescendo entre concreto e tijolos",
      tags: "NaturezaUrbana,Texturas,Cotidiano",
      vibeCount: 38,
    },
    {
      title: "Cores da Favela",
      description: "A paleta vibrante das casas coloridas",
      tags: "Cores,Arquitetura,Rua",
      vibeCount: 94,
      isGoldStandard: true,
      isSynced: true,
    },
    {
      title: "Beco dos Artistas",
      description: "Onde a arte floresce em cada esquina",
      tags: "Graffiti,Arquitetura,Cores",
      vibeCount: 61,
    },
    {
      title: "Vida Noturna",
      description: "As luzes da periferia após o entardecer",
      tags: "Cotidiano,Rua,Cores",
      vibeCount: 47,
    },
  ];

  const placeholderImages = [
    "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=800",
    "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
    "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800",
    "https://images.unsplash.com/photo-1493238792000-8113da705763?w=800",
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800",
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
    "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=800",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800",
    "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=800",
  ];

  let photoIndex = 0;
  for (const photoData of samplePhotos) {
    const authorId = users[photoIndex % users.length].id;
    
    await prisma.photo.upsert({
      where: { id: `photo-${photoIndex + 1}` },
      update: {},
      create: {
        id: `photo-${photoIndex + 1}`,
        ...photoData,
        imageUrl: placeholderImages[photoIndex % placeholderImages.length],
        thumbnailUrl: placeholderImages[photoIndex % placeholderImages.length],
        authorId,
        syncedAt: photoData.isSynced ? new Date() : null,
      },
    });
    photoIndex++;
  }

  console.log(`✅ Created ${samplePhotos.length} sample photos`);

  // Award initial badges
  const primeiroClickBadge = await prisma.badge.findFirst({
    where: { name: "Primeiro Click" },
  });

  if (primeiroClickBadge) {
    for (const user of users) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: user.id, badgeId: primeiroClickBadge.id } },
        update: {},
        create: { userId: user.id, badgeId: primeiroClickBadge.id },
      });
    }
  }

  console.log("✅ Awarded initial badges");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
