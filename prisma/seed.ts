import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcrypt";

const prisma = new PrismaClient();

// Dados reais de Palmas, Tocantins
const PALMAS_LOCATIONS = [
  {
    name: "Praça dos Girassóis",
    neighborhood: "Centro Administrativo",
    latitude: -10.1862,
    longitude: -48.3347,
    description: "Uma das maiores praças do mundo, coração de Palmas"
  },
  {
    name: "Praia da Graciosa",
    neighborhood: "Graciosa",
    latitude: -10.2456,
    longitude: -48.3123,
    description: "Praia urbana às margens do Lago de Palmas"
  },
  {
    name: "Parque Cesamar",
    neighborhood: "Plano Diretor Norte",
    latitude: -10.2134,
    longitude: -48.3456,
    description: "Parque ambiental com trilhas e lago"
  },
  {
    name: "Feira do Bosque",
    neighborhood: "Plano Diretor Sul",
    latitude: -10.2678,
    longitude: -48.3389,
    description: "Feira popular com artesanato e comida típica"
  },
  {
    name: "Rua das Palmas",
    neighborhood: "Plano Diretor Norte",
    latitude: -10.2234,
    longitude: -48.3267,
    description: "Principal rua comercial da cidade"
  },
  {
    name: "Igreja Matriz",
    neighborhood: "Plano Diretor Sul",
    latitude: -10.2567,
    longitude: -48.3412,
    description: "Igreja católica no coração da cidade"
  },
  {
    name: "Lago de Palmas",
    neighborhood: "Beira Lago",
    latitude: -10.2345,
    longitude: -48.3012,
    description: "Lago artificial para esportes e lazer"
  },
  {
    name: "Taquarussu",
    neighborhood: "Taquarussu",
    latitude: -10.2890,
    longitude: -48.3012,
    description: "Região com cachoeiras e natureza"
  },
  {
    name: "Taquaralto",
    neighborhood: "Taquaralto",
    latitude: -10.3012,
    longitude: -48.2890,
    description: "Bairro residencial com vista para o lago"
  },
  {
    name: "Jardim Aureny I",
    neighborhood: "Jardim Aureny I",
    latitude: -10.3456,
    longitude: -48.2678,
    description: "Bairro popular em expansão"
  },
  {
    name: "Jardim Aureny II",
    neighborhood: "Jardim Aureny II",
    latitude: -10.3567,
    longitude: -48.2567,
    description: "Comunidade vibrante e acolhedora"
  },
  {
    name: "Jardim Aureny III",
    neighborhood: "Jardim Aureny III",
    latitude: -10.3678,
    longitude: -48.2456,
    description: "Novo polo de desenvolvimento"
  },
  {
    name: "Santa Fé",
    neighborhood: "Santa Fé",
    latitude: -10.2789,
    longitude: -48.3456,
    description: "Bairro com forte identidade cultural"
  },
  {
    name: "Ponta Negra",
    neighborhood: "Ponta Negra",
    latitude: -10.3123,
    longitude: -48.3567,
    description: "Área de expansão urbana"
  },
  {
    name: "Plano Diretor Norte",
    neighborhood: "Plano Diretor Norte",
    latitude: -10.2123,
    longitude: -48.3156,
    description: "Região norte planejada da cidade"
  },
  {
    name: "Arse 11",
    neighborhood: "Arse 11",
    latitude: -10.2012,
    longitude: -48.3234,
    description: "Setor residencial tradicional"
  },
  {
    name: "Arse 21",
    neighborhood: "Arse 21",
    latitude: -10.2456,
    longitude: -48.3289,
    description: "Área residional e comercial"
  },
  {
    name: "Lago Sul",
    neighborhood: "Lago Sul",
    latitude: -10.2678,
    longitude: -48.3567,
    description: "Região nobre beira lago"
  },
];

async function main() {
  console.log("🌱 Seeding database with Palmas-TO real data...");

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
    prisma.badge.upsert({
      where: { name: "Mapa da Quebrada" },
      update: {},
      create: {
        name: "Mapa da Quebrada",
        description: "Adicionou localização em 5 fotos",
        icon: "🗺️",
        type: "location",
        requirement: "5_geotagged",
      },
    }),
    prisma.badge.upsert({
      where: { name: "Guerreiro da Batalha" },
      update: {},
      create: {
        name: "Guerreiro da Batalha",
        description: "Venceu 10 batalhas de vibes",
        icon: "⚔️",
        type: "battle",
        requirement: "10_battle_wins",
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
      bio: "Administrador da plataforma UPMM - Palmas, TO",
      role: "ADMIN",
      vibePoints: 1000,
      responsaPoints: 500,
      level: 5,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Create users from Palmas-TO
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "maria@upmm.org" },
      update: {},
      create: {
        email: "maria@upmm.org",
        name: "Maria Silva",
        username: "maria_tocantins",
        bio: "Fotógrafa de Palmas, apaixonada por capturar a beleza do Cerrado e da nossa gente",
        vibePoints: 450,
        responsaPoints: 180,
        level: 3,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
      },
    }),
    prisma.user.upsert({
      where: { email: "joao@upmm.org" },
      update: {},
      create: {
        email: "joao@upmm.org",
        name: "João Santos",
        username: "joao_pdn",
        bio: "Nascido e criado no Plano Diretor Norte, fotografo o cotidiano da quebrada",
        vibePoints: 620,
        responsaPoints: 250,
        level: 4,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao",
      },
    }),
    prisma.user.upsert({
      where: { email: "ana@upmm.org" },
      update: {},
      create: {
        email: "ana@upmm.org",
        name: "Ana Costa",
        username: "ana_graciosa",
        bio: "Designer e artista visual, moradora da Graciosa há 15 anos",
        vibePoints: 280,
        responsaPoints: 120,
        level: 2,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
      },
    }),
    prisma.user.upsert({
      where: { email: "pedro@upmm.org" },
      update: {},
      create: {
        email: "pedro@upmm.org",
        name: "Pedro Oliveira",
        username: "pedro_aureny",
        bio: "Do Jardim Aureny, fotografo a transformação do nosso bairro",
        vibePoints: 340,
        responsaPoints: 90,
        level: 2,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro",
      },
    }),
    prisma.user.upsert({
      where: { email: "carla@upmm.org" },
      update: {},
      create: {
        email: "carla@upmm.org",
        name: "Carla Mendes",
        username: "carla_taquaralto",
        bio: "Artista plástica e educadora, espalhando arte por Taquaralto",
        vibePoints: 510,
        responsaPoints: 200,
        level: 3,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carla",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create photos with real locations from Palmas-TO
  const samplePhotos = [
    {
      title: "Entardecer na Praça dos Girassóis",
      description: "O sol se pondo sobre a maior praça do mundo, no coração de Palmas",
      tags: "Cores,NaturezaUrbana,Cotidiano",
      locationIndex: 0,
      vibeCount: 89,
      isGoldStandard: true,
      communityGold: true,
    },
    {
      title: "Beco do Aureny III",
      description: "As cores vibrantes das casas no novo polo de desenvolvimento",
      tags: "Cores,Arquitetura,Rua",
      locationIndex: 12,
      vibeCount: 67,
      isGoldStandard: true,
    },
    {
      title: "Grafite no Plano Diretor Norte",
      description: "Arte urbana transformando os muros da nossa quebrada",
      tags: "Graffiti,Arquitetura,Cores",
      locationIndex: 14,
      vibeCount: 124,
      isGoldStandard: true,
      communityGold: true,
    },
    {
      title: "Cachoeira do Taquarussu",
      description: "A natureza exuberante que rodeia nossa cidade",
      tags: "NaturezaUrbana,Cores,Cotidiano",
      locationIndex: 7,
      vibeCount: 156,
      isGoldStandard: true,
      isSynced: true,
    },
    {
      title: "Feira do Bosque ao Amanhecer",
      description: "O movimento começando na feira mais tradicional de Palmas",
      tags: "Cotidiano,Rua,Cores",
      locationIndex: 3,
      vibeCount: 78,
    },
    {
      title: "Lago de Palmas",
      description: "O espelho d'água que reflete nossa cidade",
      tags: "NaturezaUrbana,Cores,Rua",
      locationIndex: 6,
      vibeCount: 198,
      isGoldStandard: true,
      communityGold: true,
    },
    {
      title: "Rua das Palmas à Noite",
      description: "As luzes da rua mais movimentada da cidade",
      tags: "Cotidiano,Rua,Cores",
      locationIndex: 4,
      vibeCount: 92,
    },
    {
      title: "Casas Coloridas do Santa Fé",
      description: "A identidade visual do bairro Santa Fé",
      tags: "Cores,Arquitetura,Rua",
      locationIndex: 12,
      vibeCount: 145,
      isGoldStandard: true,
    },
    {
      title: "Pôr do Sol na Graciosa",
      description: "A praia urbana ganhando tons dourados",
      tags: "Cores,NaturezaUrbana,Cotidiano",
      locationIndex: 1,
      vibeCount: 234,
      isGoldStandard: true,
      communityGold: true,
      isSynced: true,
    },
    {
      title: "Parque Cesamar",
      description: "O pulmão verde de Palmas",
      tags: "NaturezaUrbana,Cotidiano,Rua",
      locationIndex: 2,
      vibeCount: 87,
    },
    {
      title: "Arte no Taquaralto",
      description: "Intervenção urbana no bairro com vista para o lago",
      tags: "Graffiti,Arquitetura,Cores",
      locationIndex: 8,
      vibeCount: 112,
      isGoldStandard: true,
    },
    {
      title: "Janelas do Aureny I",
      description: "Cada janela conta uma história diferente",
      tags: "Arquitetura,Cotidiano,Texturas",
      locationIndex: 9,
      vibeCount: 56,
    },
    {
      title: "Texturas do Cerrado",
      description: "A beleza natural do bioma que nos cerca",
      tags: "Texturas,NaturezaUrbana,Cores",
      locationIndex: 2,
      vibeCount: 98,
    },
    {
      title: "Noites do Plano Diretor Sul",
      description: "O céu estrelado sobre o sul da cidade",
      tags: "Cotidiano,Rua,Cores",
      locationIndex: 15,
      vibeCount: 76,
    },
    {
      title: "Cores do Arse 11",
      description: "A paleta vibrante do setor residencial tradicional",
      tags: "Cores,Arquitetura,Rua",
      locationIndex: 16,
      vibeCount: 134,
      isGoldStandard: true,
    },
    {
      title: "Manhã na Ponta Negra",
      description: "O sol nascendo na área de expansão urbana",
      tags: "NaturezaUrbana,Cores,Cotidiano",
      locationIndex: 13,
      vibeCount: 89,
    },
  ];

  // Generate unique image URLs using Lorem Picsum with seeds based on photo title
  const generateImageUrl = (title: string, width = 800, height = 600) => {
    const seed = title.replace(/\s/g, "").toLowerCase();
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  };

  for (let i = 0; i < samplePhotos.length; i++) {
    const photoData = samplePhotos[i];
    const location = PALMAS_LOCATIONS[photoData.locationIndex];
    const authorId = users[i % users.length].id;

    await prisma.photo.upsert({
      where: { id: `photo-palmas-${i + 1}` },
      update: {},
      create: {
        id: `photo-palmas-${i + 1}`,
        title: photoData.title,
        description: photoData.description,
        tags: photoData.tags,
        imageUrl: generateImageUrl(photoData.title),
        thumbnailUrl: generateImageUrl(photoData.title, 400, 300),
        vibeCount: photoData.vibeCount,
        isGoldStandard: photoData.isGoldStandard || false,
        communityGold: photoData.communityGold || false,
        isSynced: photoData.isSynced || false,
        syncedAt: photoData.isSynced ? new Date() : null,
        latitude: location.latitude,
        longitude: location.longitude,
        location: location.name,
        neighborhood: location.neighborhood,
        city: "Palmas",
        state: "Tocantins",
        country: "Brasil",
        authorId,
        battleWins: Math.floor(Math.random() * 20),
        battleLosses: Math.floor(Math.random() * 10),
      },
    });
  }

  console.log(`✅ Created ${samplePhotos.length} photos with real Palmas-TO locations`);

  // Create some remixes for genealogy
  const basePhotos = await prisma.photo.findMany({ take: 5 });
  
  if (basePhotos.length >= 3) {
    const remixData = [
      { title: "Remix: Girassóis em Neon", photoIndex: 0, userIdx: 1 },
      { title: "Remix: Aureny Vintage", photoIndex: 1, userIdx: 2 },
      { title: "Remix: PDN Abstrato", photoIndex: 2, userIdx: 3 },
    ];

    for (let i = 0; i < remixData.length; i++) {
      const remix = remixData[i];
      await prisma.remix.create({
        data: {
          title: remix.title,
          imageUrl: generateImageUrl(remix.title),
          originalPhotoId: basePhotos[remix.photoIndex].id,
          creatorId: users[remix.userIdx % users.length].id,
          vibeCount: Math.floor(Math.random() * 50) + 10,
        },
      });
    }
    console.log(`✅ Created ${remixData.length} remixes`);
  }

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

  // Create some notifications
  try {
    await prisma.notification.createMany({
      data: [
        {
          userId: users[0].id,
          type: "REMIX_CREATED",
          title: "Seu foto foi remixada!",
          message: "João Santos criou um remix de 'Entardecer na Praça dos Girassóis'",
          data: JSON.stringify({ photoId: "photo-palmas-1", remixId: "remix-1" }),
        },
        {
          userId: users[1].id,
          type: "GOLD_STANDARD",
          title: "Padrão Ouro! 🏆",
          message: "Sua foto 'Grafite no Plano Diretor Norte' foi destacada como Padrão Ouro",
          data: JSON.stringify({ photoId: "photo-palmas-3" }),
        },
        {
          userId: users[2].id,
          type: "BATTLE_WIN",
          title: "Vitória na Batalha! ⚔️",
          message: "Sua foto venceu 5 batalhas consecutivas",
          data: JSON.stringify({ wins: 5 }),
        },
      ],
    });
    console.log("✅ Created initial notifications");
  } catch (e) {
    console.log("⚠️ Notifications may already exist");
  }

  console.log("🎉 Seeding complete! Palmas-TO data loaded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
