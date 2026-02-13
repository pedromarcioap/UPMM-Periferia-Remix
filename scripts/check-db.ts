// Script para verificar o banco de dados UPMM
// Execute: bun run scripts/check-db.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando banco de dados UPMM...\n')

  // Contar registros
  const userCount = await prisma.user.count()
  const photoCount = await prisma.photo.count()
  const remixCount = await prisma.remix.count()
  const commentCount = await prisma.comment.count()
  const badgeCount = await prisma.badge.count()
  const notificationCount = await prisma.notification.count()

  console.log('📊 Estatísticas:')
  console.log(`  👥 Usuários: ${userCount}`)
  console.log(`  📸 Fotos: ${photoCount}`)
  console.log(`  🎨 Remixes: ${remixCount}`)
  console.log(`  💬 Comentários: ${commentCount}`)
  console.log(`  🏆 Badges: ${badgeCount}`)
  console.log(`  🔔 Notificações: ${notificationCount}`)

  // Listar usuários
  console.log('\n📋 Usuários cadastrados:')
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      vibePoints: true,
      responsaPoints: true,
      level: true,
      role: true,
    }
  })

  users.forEach(u => {
    console.log(`  - ${u.name || 'Sem nome'} (${u.email})`)
    console.log(`    ID: ${u.id}`)
    console.log(`    Username: ${u.username || 'N/A'}`)
    console.log(`    Pontos: Vibe=${u.vibePoints}, Responsa=${u.responsaPoints}`)
    console.log(`    Nível: ${u.level} | Role: ${u.role}`)
    console.log('')
  })

  // Listar fotos por bairro
  console.log('\n📍 Fotos por bairro:')
  const photosByNeighborhood = await prisma.photo.groupBy({
    by: ['neighborhood'],
    _count: true,
    where: {
      neighborhood: { not: null }
    }
  })

  photosByNeighborhood.forEach(p => {
    console.log(`  - ${p.neighborhood}: ${p._count} fotos`)
  })

  console.log('\n✅ Banco de dados funcionando corretamente!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao conectar ao banco:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
