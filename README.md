# Moses Café

Site de commande en ligne (café Robusta) : catalogue, commande avec ou sans compte,
suivi de commande invité, back-office admin.

**Stack** : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind/shadcn · PostgreSQL + Prisma ·
NextAuth v5 (Google + email/mot de passe) · Resend (emails) · Cloudinary (images).

## Démarrage

```bash
cp .env.example .env        # puis renseigner les variables
npm install
npx prisma migrate deploy
ADMIN_SEED_PASSWORD='un-mot-de-passe-de-12+-caracteres' npm run db:seed
npm run dev
```

## Base de données — numéro de commande

Les commandes ont un numéro public aléatoire `MC-XXXXXX` (`orders.order_number`), en plus de l'`id` interne.
Le suivi `/suivi` accepte ce numéro **ou** l'ancien numéro numérique (commandes déjà envoyées par email), toujours avec le téléphone.

⚠️ À appliquer **avant** de déployer ce code (sinon les commandes échouent, la colonne n'existe pas) :

```bash
psql "$DATABASE_URL" -f prisma/sql/add-order-number.sql   # idempotent
```

Note : `prisma/migrations/` contient une migration MySQL, inutilisable avec ce PostgreSQL ; d'où ce script SQL à part.

## Scripts

| Script | Rôle |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Tests Vitest (`tests/`) |
| `npm run lint` | ESLint |
| `npm run db:seed` | Crée l'admin (mot de passe via `ADMIN_SEED_PASSWORD`, jamais écrasé) |

## Sécurité — principes

- Chaque route sensible vérifie elle-même session/rôle (`src/lib/auth-guards.ts`) ; le middleware n'est qu'une couche en plus.
- Routes publiques voulues : `GET /api/products`, `POST /api/orders` (invité), `POST /api/orders/track`.
- Les prix ne viennent **jamais** du client : produits du catalogue en base, ou `src/lib/landing-catalog.ts` pour les landing pages.
- Suivi invité : numéro de commande **et** téléphone exigés, limitation de débit, champs minimaux renvoyés.
- Entrées validées avec zod (`src/lib/schemas.ts`).
- Limiteur de débit en mémoire (`src/lib/rate-limit.ts`) : à remplacer par un store partagé (Redis/Upstash) en multi-instances.
- Ne jamais committer de secrets (`.env*` ignoré, voir `.env.example`).
