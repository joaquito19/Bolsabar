# BolsaBar – Starter (fix Prisma)
Deploy fácil en Vercel con Supabase (Postgres) y Upstash (Redis). Usa polling + cron para mover precios.

## Variables en Vercel
- `DATABASE_URL` (Supabase, con sslmode=require)
- `REDIS_URL` (Upstash, rediss://...)
- `DEFAULT_VENUE_ID=default-venue`
- `VENUE_TZ=America/Montevideo`
- `CRON_SECRET=tu-secreto`
- `ALLOW_SEED=true` (solo primera carga demo)

## Build command
```
npx prisma generate && npx prisma db push && next build
```

## Rutas
- `/admin` (configuración, bebidas, happy hour)
- `/tablet` (tablets)
- `/screen` (pantalla grande)
- `/api/seed` (POST para demo)
- cron: `/api/tick` (POST con Authorization: Bearer TU_CRON_SECRET)
