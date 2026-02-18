# UPMM Platform - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Step 1: Set Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres.vtturkgwzjhcaldpcaqf:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | Connection pooler (port 6543) |
| `DIRECT_DATABASE_URL` | `postgresql://postgres.vtturkgwzjhcaldpcaqf:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres` | Direct connection (port 5432) |
| `NEXTAUTH_SECRET` | `your-random-secret-key` | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://upmm-periferia-remix.vercel.app` | Your production URL |

### Step 2: Trigger Redeploy

After setting the environment variables:
1. Go to your Vercel project dashboard
2. Click "Redeploy" or push a new commit

## 🗄️ Database Setup

### Tables Already Created

The following tables exist in Supabase:
- `User` - User accounts
- `Photo` - Uploaded photos with geolocation
- `Remix` - Remixed photos
- `Comment` - Comments on photos/remixes
- `Like` - Likes
- `Badge` / `UserBadge` - Gamification badges

### Seed Data

To populate sample data, access this URL after deploy:
```
https://your-domain.vercel.app/api/seed?key=upmm-seed-2024&reset=true
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main page (gallery)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/                  # API routes
│       ├── auth/[...nextauth]/  # Authentication
│       ├── photos/           # Photos CRUD
│       ├── battle/           # Battle mode
│       ├── likes/            # Likes
│       ├── remixes/          # Remixes
│       ├── notifications/    # User notifications
│       ├── health/           # Health check
│       └── seed/             # Database seeding
├── components/
│   ├── upmm/                 # UPMM components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── photo-card.tsx
│   │   ├── upload-modal.tsx
│   │   ├── map-view.tsx
│   │   ├── battle-mode.tsx
│   │   └── user-profile.tsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── auth.ts               # Auth options
│   └── utils.ts              # Utilities
└── store/
    └── useAppStore.ts        # Zustand store
```

## ✅ Features

- **Gallery**: Browse photos with tag filtering and search
- **Upload**: Upload photos with geolocation
- **Map**: View photos on interactive map
- **Battle**: Vote between two random photos
- **Profile**: View your uploads and stats
- **Authentication**: Login/Register with email or Google

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🐛 Troubleshooting

### Error 500 on API routes

1. Check DATABASE_URL is correctly set
2. Check DIRECT_DATABASE_URL is set
3. Verify database connection with `/api/health`

### Authentication not working

1. Verify NEXTAUTH_SECRET is set
2. Verify NEXTAUTH_URL matches your domain
3. Check Google OAuth credentials if using Google login

### Images not loading

- Pexels images are used for seed data
- User uploads are stored as base64 (for MVP)
- Configure Supabase Storage for production
