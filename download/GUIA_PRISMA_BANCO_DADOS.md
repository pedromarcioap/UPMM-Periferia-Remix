# 🗄️ Guia Completo: Banco de Dados Prisma - UPMM

Este guia ensina detalhadamente como configurar, acessar e manipular o banco de dados da plataforma UPMM usando Prisma ORM.

---

## 📋 Índice

1. [O que é Prisma?](#1-o-que-é-prisma)
2. [Estrutura do Banco de Dados UPMM](#2-estrutura-do-banco-de-dados-upmm)
3. [Configuração do Ambiente](#3-configuração-do-ambiente)
4. [Comandos Essenciais](#4-comandos-essenciais)
5. [Visualizando Dados com Prisma Studio](#5-visualizando-dados-com-prisma-studio)
6. [Consultas Diretas no SQLite](#6-consultas-diretas-no-sqlite)
7. [Usando Prisma via Código](#7-usando-prisma-via-código)
8. [Solução de Problemas](#8-solução-de-problemas)
9. [Backup e Restore](#9-backup-e-restore)

---

## 1. O que é Prisma?

**Prisma** é um ORM (Object-Relational Mapping) moderno para Node.js e TypeScript. Ele facilita o trabalho com bancos de dados, oferecendo:

- **Schema Declarativo**: Você define seus modelos em um arquivo `schema.prisma`
- **Type Safety**: Autocomplete e verificação de tipos no código
- **Prisma Client**: API intuitiva para consultas ao banco
- **Migrations**: Controle de versão do banco de dados
- **Prisma Studio**: Interface visual para gerenciar dados

### Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Seu Código    │────▶│  Prisma Client  │────▶│    SQLite DB    │
│   (TypeScript)  │     │   (Generated)   │     │   (custom.db)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 2. Estrutura do Banco de Dados UPMM

### Localização dos Arquivos

```
/home/z/my-project/
├── prisma/
│   ├── schema.prisma    # Definição dos modelos
│   └── seed.ts          # Dados iniciais
├── db/
│   └── custom.db        # Arquivo do banco SQLite
├── .env                 # Variáveis de ambiente
└── node_modules/
    └── @prisma/client/  # Cliente gerado automaticamente
```

### Modelos do Banco (schema.prisma)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │     │    Photo    │     │    Remix    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ email       │◀───▶│ authorId    │     │ creatorId   │◀───┐
│ name        │     │ title       │     │ originalId  │◀───┤
│ username    │     │ imageUrl    │     │ imageUrl    │    │
│ password    │     │ latitude    │     │ vibeCount   │    │
│ vibePoints  │     │ longitude   │     └─────────────┘    │
│ role        │     │ city        │                        │
└─────────────┘     │ state       │◀───────────────────────┘
      │             └─────────────┘
      │                   │
      ▼                   ▼
┌─────────────┐     ┌─────────────┐
│Notification │     │   Comment   │
├─────────────┤     ├─────────────┤
│ userId      │     │ photoId     │
│ type        │     │ userId      │
│ title       │     │ content     │
│ message     │     └─────────────┘
│ isRead      │
└─────────────┘
```

### Detalhes de cada modelo:

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| **User** | Usuários da plataforma | email, name, username, password, vibePoints, responsaPoints, level, role |
| **Photo** | Fotos enviadas | title, imageUrl, tags, latitude, longitude, city, neighborhood, vibeCount |
| **Remix** | Remakes de fotos | imageUrl, originalPhotoId, creatorId, vibeCount |
| **Comment** | Comentários | content, userId, photoId/remixId |
| **Like** | Curtidas | userId, photoId/remixId |
| **Badge** | Conquistas disponíveis | name, description, icon, type |
| **UserBadge** | Badges conquistados | userId, badgeId, earnedAt |
| **Notification** | Notificações | userId, type, title, message, isRead |
| **BattleVote** | Votos em batalhas | userId, photo1Id, photo2Id, winnerId |

---

## 3. Configuração do Ambiente

### Passo 1: Verificar/Criar o arquivo .env

O arquivo `.env` deve estar na **raiz do projeto**:

```bash
# Navegue até a pasta do projeto
cd /home/z/my-project

# Verifique se o arquivo existe
cat .env
```

### Passo 2: Criar o .env se não existir

```bash
# Criar arquivo .env
cat > .env << 'EOF'
# Database - Caminho ABSOLUTO para o banco SQLite
DATABASE_URL=file:/home/z/my-project/db/custom.db

# Pexels API (opcional)
PEXELS_API_KEY=

# NextAuth.js
NEXTAUTH_SECRET=upmm-secret-key-2024-super-secure
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EOF
```

### Passo 3: Verificar estrutura do DATABASE_URL

O formato correto do DATABASE_URL para SQLite:

```
DATABASE_URL=file:/caminho/absoluto/para/o/banco.db
```

**IMPORTANTE**: Use sempre caminho ABSOLUTO, não relativo!

### Passo 4: Gerar o Prisma Client

```bash
cd /home/z/my-project
bunx prisma generate
```

Saída esperada:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### Passo 5: Sincronizar o banco (se necessário)

```bash
# Aplica o schema no banco (cria tabelas se não existirem)
bunx prisma db push

# Popula com dados iniciais
bunx prisma db seed
```

---

## 4. Comandos Essenciais

### Tabela de Comandos Prisma

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `bunx prisma generate` | Gera o Prisma Client | Após mudar schema |
| `bunx prisma db push` | Sincroniza schema com banco | Desenvolvimento |
| `bunx prisma db pull` | Importa schema do banco existente | Banco existente |
| `bunx prisma db seed` | Executa script de seed | Popular dados |
| `bunx prisma studio` | Abre interface visual | Visualizar/editar |
| `bunx prisma migrate dev` | Cria migration | Produção |
| `bunx prisma validate` | Valida o schema | Verificar erros |
| `bunx prisma format` | Formata o schema | Organizar código |

### Verificando se tudo está funcionando

```bash
# Valida o schema
bunx prisma validate

# Deve retornar:
# Prisma schema loaded from prisma/schema.prisma
# The Prisma schema is valid!
```

---

## 5. Visualizando Dados com Prisma Studio

### O que é Prisma Studio?

Prisma Studio é uma interface visual (GUI) para visualizar e editar dados do banco diretamente no navegador.

### Como usar:

```bash
cd /home/z/my-project
bunx prisma studio
```

Saída:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

Prisma Studio is up on http://localhost:5555
```

### Funcionalidades do Prisma Studio:

1. **Visualizar todas as tabelas** - Clique em cada modelo para ver os registros
2. **Filtrar dados** - Use a barra de busca e filtros
3. **Editar registros** - Clique em uma célula para editar
4. **Adicionar registros** - Botão "Add record"
5. **Deletar registros** - Selecione e delete
6. **Exportar dados** - Formato JSON/CSV

### Captura de tela do Prisma Studio:

```
┌────────────────────────────────────────────────────────────────────┐
│  Prisma Studio                                    http://localhost:5555 │
├────────────────────────────────────────────────────────────────────┤
│  Models: User │ Photo │ Remix │ Comment │ Like │ Badge │ ...      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  📊 User (5 records)                                               │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ id        │ email           │ name      │ vibePoints │ role  │ │
│  ├───────────┼─────────────────┼───────────┼────────────┼───────┤ │
│  │ clxyz123  │ user@email.com  │ João      │ 150        │ USER  │ │
│  │ clxyz456  │ admin@email.com │ Admin     │ 500        │ ADMIN │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 6. Consultas Diretas no SQLite

### Usando o comando sqlite3

O SQLite tem uma ferramenta de linha de comando para consultas diretas:

```bash
# Abrir o banco
sqlite3 /home/z/my-project/db/custom.db
```

### Comandos SQLite úteis:

```sql
-- Listar todas as tabelas
.tables

-- Ver estrutura de uma tabela
.schema User

-- Contar registros
SELECT COUNT(*) FROM User;
SELECT COUNT(*) FROM Photo;

-- Ver todos os usuários
SELECT id, email, name, vibePoints FROM User;

-- Ver todas as fotos com localização
SELECT id, title, city, neighborhood FROM Photo WHERE city = 'Palmas';

-- Ver fotos por bairro
SELECT neighborhood, COUNT(*) as total FROM Photo GROUP BY neighborhood;

-- Sair do sqlite3
.exit
```

### Query em uma linha (sem entrar no shell):

```bash
# Contar usuários
sqlite3 /home/z/my-project/db/custom.db "SELECT COUNT(*) FROM User;"

# Ver emails cadastrados
sqlite3 /home/z/my-project/db/custom.db "SELECT email FROM User;"

# Ver fotos com geolocalização
sqlite3 /home/z/my-project/db/custom.db "SELECT title, latitude, longitude FROM Photo WHERE latitude IS NOT NULL;"
```

---

## 7. Usando Prisma via Código

### Importando o Prisma Client

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // Mostra queries no console
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const db = prisma // Alias para compatibilidade
```

### Exemplos de Consultas

#### Buscar todos os usuários:
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    vibePoints: true,
  }
});
```

#### Buscar usuário por email:
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'usuario@email.com' }
});
```

#### Criar um novo usuário:
```typescript
const newUser = await prisma.user.create({
  data: {
    email: 'novo@email.com',
    name: 'Novo Usuário',
    username: 'novo_user_123',
    password: 'senha_hash',
  }
});
```

#### Buscar fotos com geolocalização:
```typescript
const photosWithLocation = await prisma.photo.findMany({
  where: {
    latitude: { not: null },
    longitude: { not: null }
  },
  select: {
    id: true,
    title: true,
    latitude: true,
    longitude: true,
    neighborhood: true,
    city: true,
  }
});
```

#### Buscar fotos por bairro:
```typescript
const photos = await prisma.photo.findMany({
  where: {
    neighborhood: 'Plano Diretor Norte'
  }
});
```

#### Atualizar pontos de um usuário:
```typescript
await prisma.user.update({
  where: { id: 'user_id' },
  data: {
    vibePoints: { increment: 10 }
  }
});
```

#### Deletar um usuário:
```typescript
await prisma.user.delete({
  where: { id: 'user_id' }
});
```

### Criando um script de consulta

Crie o arquivo `scripts/query.ts`:

```typescript
// scripts/query.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Contar registros
  const userCount = await prisma.user.count()
  const photoCount = await prisma.photo.count()
  
  console.log(`👥 Usuários: ${userCount}`)
  console.log(`📸 Fotos: ${photoCount}`)
  
  // Listar usuários
  const users = await prisma.user.findMany({
    select: { email: true, name: true, vibePoints: true }
  })
  
  console.log('\n📋 Lista de Usuários:')
  users.forEach(u => {
    console.log(`  - ${u.name} (${u.email}): ${u.vibePoints} pontos`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Execute:
```bash
bun run scripts/query.ts
```

---

## 8. Solução de Problemas

### Erro: "Environment variable not found: DATABASE_URL"

**Causa**: O arquivo `.env` não está sendo encontrado ou a variável não está definida.

**Soluções**:

1. **Verifique se o .env existe**:
```bash
ls -la /home/z/my-project/.env
```

2. **Verifique o conteúdo**:
```bash
cat /home/z/my-project/.env | grep DATABASE_URL
```

3. **Crie/corrija o .env**:
```bash
echo 'DATABASE_URL=file:/home/z/my-project/db/custom.db' >> /home/z/my-project/.env
```

4. **Use caminho absoluto** (não relativo):
```bash
# ❌ ERRADO
DATABASE_URL=file:./db/custom.db

# ✅ CORRETO
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

5. **Regenere o Prisma Client**:
```bash
cd /home/z/my-project
bunx prisma generate
```

### Erro: "Can't reach database server"

**Causa**: O arquivo do banco não existe ou está inacessível.

**Solução**:
```bash
# Verifique se o arquivo existe
ls -la /home/z/my-project/db/custom.db

# Se não existir, crie o banco
bunx prisma db push
```

### Erro: "Table does not exist"

**Causa**: O banco existe mas as tabelas não foram criadas.

**Solução**:
```bash
bunx prisma db push
```

### Erro: "Prisma Client not generated"

**Causa**: O cliente Prisma não foi gerado após instalação ou mudança de schema.

**Solução**:
```bash
bunx prisma generate
```

### Erro ao rodar seed

**Causa**: Dados duplicados ou conflito de constraints.

**Solução**:
```bash
# Resetar o banco completamente (CUIDADO: apaga todos os dados!)
bunx prisma migrate reset

# Ou apenas recriar sem dados
bunx prisma db push --force-reset
bunx prisma db seed
```

### Verificar logs do Prisma

Adicione logging ao Prisma Client para ver as queries:

```typescript
// src/lib/db.ts
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

---

## 9. Backup e Restore

### Fazer Backup do Banco

```bash
# Método 1: Copiar o arquivo (mais simples)
cp /home/z/my-project/db/custom.db /home/z/my-project/db/backup_$(date +%Y%m%d_%H%M%S).db

# Método 2: Usar sqlite3 para dump
sqlite3 /home/z/my-project/db/custom.db .dump > backup.sql
```

### Restaurar Backup

```bash
# Método 1: Restaurar arquivo copiado
cp /home/z/my-project/db/backup_20240115_143022.db /home/z/my-project/db/custom.db

# Método 2: Restaurar de dump SQL
sqlite3 /home/z/my-project/db/custom.db < backup.sql
```

### Script de Backup Automatizado

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/z/my-project/backups"
DB_FILE="/home/z/my-project/db/custom.db"

# Criar pasta de backups
mkdir -p $BACKUP_DIR

# Fazer backup
cp $DB_FILE "$BACKUP_DIR/upmm_$DATE.db"

# Manter apenas os últimos 10 backups
ls -t $BACKUP_DIR/*.db | tail -n +11 | xargs -r rm

echo "Backup criado: upmm_$DATE.db"
```

---

## 📝 Resumo dos Comandos Principais

| Tarefa | Comando |
|--------|---------|
| Gerar cliente | `bunx prisma generate` |
| Abrir Prisma Studio | `bunx prisma studio` |
| Sincronizar banco | `bunx prisma db push` |
| Popular dados | `bunx prisma db seed` |
| Validar schema | `bunx prisma validate` |
| Consultar via SQLite | `sqlite3 /home/z/my-project/db/custom.db` |
| Ver variáveis de ambiente | `cat .env` |

---

## 🔗 Links Úteis

- [Documentação Oficial do Prisma](https://www.prisma.io/docs)
- [Prisma Studio](https://www.prisma.io/studio)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Prisma Cheat Sheet](https://pris.ly/d/cheatsheet)

---

<p align="center">
  Guia criado para a plataforma UPMM - Unidos Por Um Mundo Melhor
</p>
