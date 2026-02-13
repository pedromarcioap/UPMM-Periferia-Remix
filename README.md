# UPMM - Periferia Remix

<p align="center">
  <strong>Unidos Por Um Mundo Melhor</strong><br>
  Plataforma comunitária de estética visual das periferias brasileiras
</p>

<p align="center">
  <a href="#-sobre">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#%EF%B8%8F-instalação">Instalação</a> •
  <a href="#-configuração">Configuração</a> •
  <a href="#-tecnologias">Tecnologias</a>
</p>

---

## 📖 Sobre

UPMM é uma plataforma web que valoriza a estética visual das periferias brasileiras. Os usuários podem fazer upload de fotos, remixar imagens com um editor in-browser, e participar de uma comunidade criativa com sistema de gamificação.

## ✨ Funcionalidades

### 📸 Upload e Galeria
- Upload de fotos locais ou busca online via Pexels API
- Tags periféricas pré-definidas (Graffiti, Arquitetura, Rua, Cotidiano, etc.)
- Galeria com filtros por tags e ordenação
- Diretrizes éticas para upload responsável

### 🎨 Estúdio Criativo (Editor)
- Filtros urbanos: Fim de Tarde, Concreto, Neon, Vibrante, Vintage
- Ajustes: Brilho, Contraste, Saturação
- Stickers da biblioteca UPMM
- Texto com fontes e cores personalizáveis
- Créditos automáticos ao autor original

### 🎮 Gamificação
- Pontos Vibe (interações) e Responsa (curadoria)
- Sistema de níveis: Observador → Criador → Ativista Visual
- Badges: Primeiro Click, Alquimista, Comunidade

### 👤 Autenticação
- Login com email/senha
- Login social com Google (opcional)
- Perfis personalizáveis

### 🛡️ Curadoria (Admin)
- Dashboard com estatísticas
- Marcação de fotos como "Padrão Ouro"
- Sincronização externa

---

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- Bun (recomendado) ou npm

### Clone o repositório
```bash
git clone https://github.com/pedromarcioap/UPMM-Periferia-Remix.git
cd UPMM-Periferia-Remix
```

### Instale as dependências
```bash
bun install
# ou
npm install
```

### Configure as variáveis de ambiente
```bash
cp .env.example .env
```

### Execute as migrations
```bash
bunx prisma db push
bunx prisma db seed
```

### Inicie o servidor
```bash
bun run dev
# ou
npm run dev
```

Acesse: http://localhost:3000

---

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
# Database
DATABASE_URL=file:./db/custom.db

# Pexels API (obtenha em: https://www.pexels.com/api/)
PEXELS_API_KEY=sua_chave_aqui

# NextAuth.js
NEXTAUTH_SECRET=sua_chave_secreta
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Obter API Key do Pexels
1. Acesse: https://www.pexels.com/api/
2. Crie uma conta gratuita
3. Solicite uma API key
4. Adicione no arquivo `.env`

---

## 🧪 Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilização**: Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: SQLite, Prisma ORM
- **Autenticação**: NextAuth.js
- **Estado**: Zustand
- **Animações**: Framer Motion
- **Deploy**: Vercel (recomendado)

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/           # Rotas da API
│   │   ├── auth/      # Autenticação
│   │   ├── photos/    # Upload e listagem
│   │   ├── remixes/   # Remixes
│   │   ├── pexels/    # Integração Pexels
│   │   └── ...
│   ├── layout.tsx     # Layout principal
│   └── page.tsx       # Página inicial
├── components/
│   ├── ui/            # Componentes shadcn/ui
│   └── upmm/          # Componentes específicos
│       ├── header.tsx
│       ├── footer.tsx
│       ├── photo-card.tsx
│       ├── upload-modal.tsx
│       ├── image-editor.tsx
│       └── ...
├── lib/
│   └── db.ts          # Prisma client
└── store/
    └── useAppStore.ts # Estado global (Zustand)
```

---

## 🚀 Deploy na Vercel

1. Conecte o repositório na Vercel
2. Configure as variáveis de ambiente
3. Deploy automático!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pedromarcioap/UPMM-Periferia-Remix)

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👥 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

<p align="center">
  Feito com 💛 pela comunidade UPMM
</p>
