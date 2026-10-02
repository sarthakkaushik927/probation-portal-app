# 05. Backend API Deployment

The backend (`probation-portal-api`) is a Node.js + Express + Prisma application.

## 1. Hosting Provider (Vercel)
Currently, the API is hosted on Vercel at `https://probation-portal-backend.vercel.app`.
Because Vercel is Serverless, the `api/index.ts` file acts as the serverless function entrypoint.

## 2. Deploying to Vercel
Deployment is usually automated via GitHub. When you push to the `main` branch, Vercel automatically:
1. Runs `npm install`
2. Runs `npx prisma generate` (via postinstall script in `package.json`)
3. Starts the serverless functions.

To trigger a manual deploy from CLI:
```powershell
cd probation-portal-api
npm i -g vercel
vercel --prod
```

## 3. Database Changes (Prisma Migrations)
If you add or modify a table in `prisma/schema.prisma` (e.g. adding Team tasks), you MUST push these changes to the live production database!

1. Backup your production DB (always a good idea).
2. Ensure your LOCAL `.env` file in `probation-portal-api` is pointing to the **Production Database URL**.
3. Run the Prisma push command:
```powershell
cd probation-portal-api
npx prisma db push
```
*(This directly alters the tables in the Supabase/Neon Postgres database to match your schema).*
4. Run `npx prisma generate` locally so your VS Code has the new types.
5. Push the code to GitHub so Vercel redeploys with the updated Prisma Client.

## 4. Serverless Limitations
Since this is serverless on Vercel, WebSocket connections (Socket.IO) don't work reliably because the server spins down.
This is why we use **Pusher** for real-time events. Pusher handles the persistent WebSocket connections externally, and Vercel just triggers events via HTTP.
